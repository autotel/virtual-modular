'use strict';
var Recorder = require('./sequencerGuts/record.js');
// var clockSpec=require('../standards/clock.js');
var EventMessage = require('../../datatypes/EventMessage.js');
var InterfaceX16 = require('./InterfaceX16');
var InterfaceX28 = require('./InterfaceX28');
var headers = EventMessage.headers;


const sequencerFunctions = require("./sequencerGuts");
/**
Sequencer
TODO: module naming functions should be a static property, and thus defaults to "name+number"
*/
var testcount = 0;
var testGetName = function () {
  this.name = baseName + " " + testcount;
  testcount++;
}
var baseName = "sequencer";

var Sequencer = function (properties, environment) {
  testGetName.call(this);
  if (properties.name) this.name = properties.name;

  var currentStep = {
    value: 0
  };
  this.currentStep = currentStep;
  var recorder = new Recorder(this);
  var self = this;
  this.patData = {};
  var currentModulus = 16;
  this.loopLength = {
    value: 16,
    lastWatchedValue: 16
  };
  this.stepLength = {
    value: 12
  }
  this.listenTransport = {
    value: false
  }
  this.recordSettings = {
    mode: 3,
    namesList: ['overdub', 'grow', 'fold', 'adjust'/*,stop*/],
    growStep: 16,
    recording: false,
    switchOnEnd: 0,
  }
  let recordSettings = this.recordSettings;

  this.noteLenManager = sequencerFunctions.NoteLenManager(this);
  var patchMem = sequencerFunctions.PatchMem(this);
  //import "gut" functions to my own;
  //I don't use an iterator to have more clear control of the namespace
  //but in some text tools you can always multiline edit
  this.store = patchMem.store;
  this.loopDisplace = patchMem.loopDisplace;
  this.storeNoDup = patchMem.storeNoDup;
  this.clearStepNewest = patchMem.clearStepNewest;
  this.clearStepOldest = patchMem.clearStepOldest;
  this.clearStep = patchMem.clearStep;
  this.clearStepByFilter = patchMem.clearStepByFilter;
  this.getBoolean = patchMem.getBoolean;
  this.stepDivide = patchMem.stepDivide;
  this.microStep = patchMem.microStep;
  this.microStepDivide = patchMem.microStepDivide;
  this.microStepDisplace = patchMem.microStepDisplace
  // this.eachFold=patchMem.eachFold;
  // this.getThroughfoldBoolean=patchMem.getThroughfoldBoolean;
  this.clearStepRange = patchMem.clearStepRange;
  this.duplicateSequence = patchMem.duplicateSequence;
  this.offsetSequence = patchMem.offsetSequence;
  this.sequenceBounds = patchMem.sequenceBounds;
  // this.getBitmapx16=patchMem.getBitmapx16;
  this.step = patchMem.step;
  this.restart = patchMem.restart;
  this.stepAbsolute = patchMem.stepAbsolute;
  this.playing = patchMem.playing;
  // this.stepIncremental=patchMem.stepIncremental;
  this.stepMicro = patchMem.stepMicro;
  var thisInstance = this;

  this.compensatedOffsetSequence = function (steps) {
    self.offsetSequence(steps);
    currentStep.value += steps;
  }
  this.trimSequence = function (grid = 1) {
    var bounds = self.sequenceBounds();
    //quantize trim to grid
    console.log("sequence bounds",bounds);

    bounds.start = Math.round(bounds.start / grid) * grid;
    bounds.end = Math.round(bounds.end / grid) * grid;

    //trim first and last chunks

    // bounds.start += grid;
    // bounds.end -= grid;
    

    self.loopLength.value = bounds.end -bounds.start;

    console.log("trim from step", bounds.start,"to",bounds.end);
    if (bounds.start > 0) {
      self.compensatedOffsetSequence(-bounds.start);
    }


  }

  this.onPatchStep = function (evt) {
    if (recordSettings.recording) {
      if (currentStep.value >= self.loopLength.value - 2) {
        switch (recordSettings.mode) {
          case 1: {
            // console.log("Grow ");
            self.loopLength.value += recordSettings.growStep;
            break;
          } case 2: {
            // console.log("Fold");
            self.loopLength.value *= 2;
            break;
          } case 3: {
            // console.log("adjust");
            self.loopLength.value += recordSettings.growStep;
            break;
          }/*case :{
              console.log("Stop");
              controlledModule.loopLength.value *= 2;
              break;
            }*/
          // default: console.log("overdub");
        }
      }
    }
    this.handle('step', evt);
    if (self.loopLength.lastWatchedValue != self.loopLength.value) {
      this.handleStepsChange();
    }
  }
  // selfm.on('~module',console.log);
  this.handleStepsChange = function () {
    // console.log("STEPCHANGE");
    self.handle('~module', { steps: self.loopLength.value });
    self.loopLength.lastWatchedValue = self.loopLength.value;
  }
  this.play = function () {
    thisInstance.playing.value = true;
    // thisInstance.restart();
  }
  this.stop = function () {
    thisInstance.playing.value = false;
  }
  /**


  # module interpretation of eventMessages:
  [header,data1,data2]
  * Header is 0: eventMessage is a clock tick
    * A indicates how many clocks makes one step. i.e. source clock rate is bpm*4
    * B indicates what clock number is the current clock number
  * Header is 1: set the playhead to a position indicated by data2, set the state to play (not implemented yet)
  * Header is 2: stop playing (not implemented yet)
  * Header is 3: jump playhead to position indicated by data 2, but don't change the playing state (not implemented yet)

  * Header is 70: request of stored data, it will trigger a data response. Not implemented yet

  */
  this.recordingReceived = function (event) {
    var evt = event.eventMessage;
    // if(evt.value[0]!=headers.clockTick) console.log(evt);
    // console.log(evt.value);
    switch (evt.value[0]) {
      case headers.record: {
        // console.log("sq:headers.record");
        // console.log(evt.value);
        // console.log("REC");
        evt.value.shift();
        // console.log(evt.value[0]);
        if (evt.value[0] == headers.triggerOn) {
          recorder.recordNoteStart([evt.value[1], evt.value[2]], evt);
          // console.log("ON",[evt.value[1],evt.value[2]]);
        } else if (evt.value[0] == headers.triggerOff) {
          recorder.recordNoteEnd([evt.value[1], evt.value[2]]);
        } else {
          recorder.recordSingularEvent(evt);
        }
        // thisInstance.recorder.start();
        break;
      } case headers.recordStatus: {
        recordSettings.recording = evt.value[1];
        if (!recordSettings.recording) {

          if (recordSettings.mode == 3) {
            //trimSequence uses the loopLength, so it must be floored
            if (self.loopLength.value > recordSettings.growStep) {
              self.loopLength.value -= recordSettings.growStep;
            }
            self.trimSequence(recordSettings.growStep / 2, true);
            //quantize length to the growStep
            if (self.loopLength.value > recordSettings.growStep) {
              self.loopLength.value -= self.loopLength.value % recordSettings.growStep;
            }
            //prevent negative or zero length sequences
            if (self.loopLength.value < recordSettings.growStep) {
              self.loopLength.value = recordSettings.growStep;
            }
          }

          if (recordSettings.switchOnEnd !== false) {
            recordSettings.mode = recordSettings.switchOnEnd;
          }
        }
        // console.log("RECSTATUS",evt.value);
        break;
      }
    }
  }

  // x71: data response
  this.messageReceived = function (event) {
    var evt = event.eventMessage;
    // if(evt.value[0]!=headers.clockTick) console.log(evt);
    // console.log(evt.value);
    switch (evt.value[0]) {
      case headers.clockTick: {
        // console.log("sq:headers.clockTick");
        thisInstance.stepMicro(evt.value[1], evt.value[2]);
        thisInstance.lastMicroStepBase = evt.value[1];
        // console.log("0 stepMicro("+evt.value[1]+","+evt.value[2]+");");
        break;
      }
      case headers.triggerOn: {
        // console.log("sq:headers.triggerOn");
        thisInstance.stepAbsolute(evt.value[2]);
        if (self.listenTransport.value) {
          thisInstance.play();
        }
        // console.log("1 thisInstance.stepAbsolute("+evt.value[1]+");");
        break;
      } case headers.triggerOff: {
        // console.log("sq:headers.triggerOff");
        if (self.listenTransport.value) {
          thisInstance.stop();
        }
        // console.log("2 stop");
        break;
      } 
        this.handle('receive', evt);
    }
  }
  this.interfaces.X16 = InterfaceX16;
  this.interfaces.X28 = InterfaceX28;
  // this.interfaces.Http = require("./InterfaceHttp.js");

}
Sequencer.color = [0, 0, 255];
module.exports = Sequencer