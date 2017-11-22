'use strict';
var EventMessage = require('../../datatypes/EventMessage.js');
var moduleInstanceBase = require('../moduleInstanceBase');
var uix16Control = require('./x16basic');
var Recorder = require('./recorder.js');
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
        microStep: 0
      };
      var recorder = new Recorder(thisModule,memory);
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

      var noteOnTracker = new(function() {
        var trackedNotes = [];
        this.trackEventMessage = function(eventMessage, callback) {
          eventMessage.started = currentMicroStep;
          trackedNotes.push(eventMessage);
          if (eventMessage.value[0] == TRIGGERONHEADER) {
            eventKey = [eventMessage.value[1], eventMessage.value[2]];
            trackedNotes[eventKey] = eventMessage;
            if (!isNaN(eventMessage.duration)) {
              callback.call(eventMessage, false);
            } else {
              callback.call(eventMessage, "error: noteon without duration");
            }
          } else {
            callback.call(eventMessage, false);
          }
        }
        this.clockFunction = function(currentsStep, currentMicroStep) {
          for (var a in trackedNotes) {
            if (trackedNotes.value[0] == TRIGGERONHEADER) {
              if (currentMicroStep - trackedNotes[a].started > trackedNotes[a].duration) {
                thisModule.output(trackedNotes[a].clone().superImpose(noteOffSuperImpose));
              }
            }
          }
        }
        this.setAllOff = function() {
          for (var a in trackedNotes) {
            if (trackedNotes.value[0] == TRIGGERONHEADER) {
              thisModule.output(trackedNotes[a].clone().superImpose(noteOffSuperImpose));
            }
          }
        }
        return this;
      })();

      var baseEventMessage = this.baseEventMessage = new EventMessage({
        value: [TRIGGERONHEADER, -1, -1, -1]
      });
      var myInteractor = new interactorSingleton.Instance(this);
      this.interactor = myInteractor;
      this.interactor.name = this.name;
      this.memoryOutput = function(eventPattern) {
        //add eventPattern to a lengthManager, play that
        noteOnTracker.trackEventMessage(eventPattern, function(error) {
          if (error) {
            console.error(error);
            return
          }
          thisModule.output(eventPattern);
        });
      }
      var clockFunction = function() {
        recorder.clockFunction(clock.step, clock.microStep);
        noteOnTracker.clockFunction(clock.step, clock.microStep);
        if (memory[[clock.step, clock.microStep]]) {
          // console.log(`memory[${clock.step},${clock.microStep}]`);
          for (var event of memory[[clock.step, clock.microStep]]) {
            // console.log(`y:${event}`);
            thisModule.output(event);
          }
        }
      }

      this.eventReceived = function(evt) {
        if (thisModule.recording) {
          if (evt.eventMessage.value[0] != CLOCKTICKHEADER) recorder.getEvent(evt.eventMessage);
        }
        if (evt.eventMessage.value[0] == CLOCKTICKHEADER) {
          // console.log("CK");
          clock.microStep = evt.eventMessage.value[2];
          clock.microSteps = evt.eventMessage.value[1];
          if (evt.eventMessage.value[2] % evt.eventMessage.value[1] == 0) {
            clock.step++;
            clock.step %= clock.steps;
            // thisModule.handle('step');
          }
          clockFunction();
        } else if (evt.eventMessage.value[0] == TRIGGERONHEADER) {
          recorder.getEvent(evt.eventMessage);
        } else if (evt.eventMessage.value[0] == TRIGGEROFFHEADER) {} else if (evt.eventMessage.value[0] == TRIGGEROFFHEADER + 1) {} else if (evt.eventMessage.value[0] == RECORDINGHEADER) {
          evt.eventMessage.value.shift();
          thisModule.eventReceived(evt);
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