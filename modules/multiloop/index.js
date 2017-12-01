'use strict';
var EventMessage = require('../../datatypes/EventMessage.js');
var moduleInstanceBase = require('../moduleInstanceBase');
var uix16Control = require('./x16basic');
// var Recorder = require('./Recorder.js');
var NoteOnTracker = require('./NoteOnTracker.js');
var NoteLogger = require('./NoteLogger.js');
var CLOCKTICKHEADER = 0x00;
var TRIGGERONHEADER = 0x01;
var TRIGGEROFFHEADER = 0x02;
var RECORDINGHEADER = 0xAA;
/**
@constructor ModuleSingleton
singleton, only one per run of the program
every module needs to run at the beginning of the runtime to register it's interactor in the interactionManager
*/

module.exports = function(environment) {
  return new(function() {
    var interactorSingleton = this.InteractorSingleton = new uix16Control(environment);
    // environment.interactionMan.registerModuleInteractor(uix16Control);
    var testcount = 0;
    var testGetName = function() {
      this.name = this.baseName + " " + testcount;
      testcount++;
    }
    /**
    @constructor
    the instance of the of the module, ment to be instantiated multiple times.
    require to moduleBase.call
    */
    this.Instance = function(properties) {
      moduleInstanceBase.call(this);
      this.baseName = "multiloop";
      testGetName.call(this);
      if (properties.name) this.name = properties.name;
      var noteOffSuperImpose = new EventMessage({
        value: [TRIGGEROFFHEADER]
      });
      var thisModule = this;
      var myBitmap = 0;
      //
      /**
      Events are stored using a step-based index.
      @example [[step,microStep]]={EventPattern:eventMessage,age:how old}
      eventMessage contains additional information:  the duration of each note, in this way its easier to keep the noteoffs
      */
      var memory = this.memory = [];
      this.recording = true;
      var clock = this.clock = {
        steps: 32,
        step: 0,
        microSteps: 12,
        microStep: 0,
        historicStep:0
      };
      var noteLogger=new NoteLogger(thisModule);
      noteLogger.setExternalClock(this.clock);
      // var recorder = new Recorder(thisModule,memory);
      // recorder.setExternalClock(this.clock);
      var noteOnTracker = new NoteOnTracker(thisModule);
      /**
      @param callback the function to call for each memory event. The eventMessage will be this. Callback is called with @param-s (timeIndex,eventIndex) where timeIndex is an array containing [step,microStep] of the evenMessage caller, and eventIndex is the number of the event in that very step, since each step could contain more than one event.
      you can set the time range to take in consideration using:
      @param {array} timeStart time of the first memory event on whom to call the callback, in [step,microStep]
      @param {array} timeEnd time of the last memory event on whom to call the callback, in [step,microStep]
      */
      this.eachMemoryEvent = function(callback, timeStart, timeEnd) {
        if (!timeStart) timeStart = [0, 0];
        if (!timeEnd) timeEnd = [clock.steps, clock.microSteps];
        if (timeStart[0] === undefined) console.warn("eachMemoryEvent timeStart parameter must be array of [step,microStep]");
        if (timeEnd[0] === undefined) console.warn("eachMemoryEvent timeEnd parameter must be array of [step,microStep]");
        var timeRangeStarted = false;
        for (var timeIndex in memory) {
          if (!timeRangeStarted) {
            if (timeStart[0] <= timeIndex[0] && timeStart[1] <= timeIndex[1]) {
              timeRangeStarted = true;
            }
          }
          if (timeRangeStarted) {
            for (var eventIndex in memory[timeIndex]) {
              callback.call(memory[timeIndex][eventIndex], JSON.parse("[" + timeIndex + "]"), eventIndex);
            }
          }
          if (timeIndex[0] >= timeEnd[0] && timeIndex[1] >= timeEnd[1]) {
            break;
          }
        }
      }


      var baseEventMessage = this.baseEventMessage = new EventMessage({
        value: [TRIGGERONHEADER, -1, -1, -1]
      });
      var myInteractor = new interactorSingleton.Instance(this);
      this.interactor = myInteractor;
      this.interactor.name = this.name;
      this.memoryOutput = function(eventMessage) {
        //add eventPattern to a lengthManager, play that
        noteOnTracker.trackEventMessage(eventMessage, function(error) {
          if (error) {
            console.error(error);
            return
          }
          thisModule.output(eventMessage);
        });
      }
      var clockFunction = function() {
        // recorder.clockFunction(clock.step, clock.microStep);
        noteOnTracker.clockFunction(clock.step, clock.microStep);
        // noteLogger.clockFunction()
        if (memory[[clock.step, clock.microStep]]) {
          // console.log(`memory[${clock.step},${clock.microStep}]`);
          for (var eventMessage of memory[[clock.step, clock.microStep]]) {
            // console.log('y:',eventMessage);
            thisModule.memoryOutput(eventMessage);
          }
        }
      }
      var currentLoopEnd=[0,0];
      var stepFunction = function(){
        noteLogger.lastEventTime(false,function(lastEventTime){
          // console.log("LEV",lastEventTime);
          if(currentLoopEnd[0]!=lastEventTime[0]){
            console.log("NNE");
            memory=[];
            currentLoopEnd=lastEventTime;
            var time=[lastEventTime[0]-clock.steps,lastEventTime[1]-1];
            // console.log("TTM",time,lastEventTime);
            noteLogger.getLastTimeEvents(time, false,function(_eventMessage){
              var eventMessage=_eventMessage.clone();
              var timeIndex=eventMessage.starts;
              timeIndex[0]%=clock.steps;
              if(!memory[timeIndex]) memory[timeIndex]=[];
              memory[timeIndex].push(eventMessage);
            });
          }
        });
      }

      this.eventReceived = function(evt) {

        if (evt.eventMessage.value[0] == CLOCKTICKHEADER) {
          // console.log("CK");
          clock.microStep = evt.eventMessage.value[2];
          clock.microSteps = evt.eventMessage.value[1];
          if (evt.eventMessage.value[2] % evt.eventMessage.value[1] == 0) {
            clock.step++;
            clock.step %= clock.steps;
            clock.historicStep++;
            stepFunction();
            // thisModule.handle('step');
          }
          clockFunction();
        } else if (evt.eventMessage.value[0] == TRIGGERONHEADER) {
          // recorder.addEvent(evt.eventMessage);
          // noteLogger.addEvent(evt.eventMessage);

        } else if (evt.eventMessage.value[0] == TRIGGEROFFHEADER) {
        } else if (evt.eventMessage.value[0] == RECORDINGHEADER) {
          evt.eventMessage.value.shift();
          // if (thisModule.recording) {
          // if(evt.eventMessage.value[0]==TRIGGEROFFHEADER)console.log("LOGOFF");
            noteLogger.addEvent(evt.eventMessage);
          // }
        } else {}
      }

      this.delete = function() {
        for (var noff of noteOnTracker) {
          noteOnTracker.setAllOff(noff);
        }
      }
    }
  })
};