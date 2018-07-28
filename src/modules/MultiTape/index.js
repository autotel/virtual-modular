'use strict';
var EventMessage = require('../../datatypes/EventMessage.js');

var Tape = require('./Tape.js');
var InterfaceX28 = require('./InterfaceX28');
// var Recorder = require('./Recorder.js');
var NoteOnTracker = require('./NoteOnTracker.js');
var headers=EventMessage.headers;
/**
@constructor ModuleSingleton
singleton, only one per run of the program
every module needs to run at the beginning of the runtime to register it's interactor in the interactionManager
*/

var testcount = 0;
var testGetName = function () {
  this.name = this.baseName + " " + testcount;
  testcount++;
}
/**
@constructor
the instance of the of the module, ment to be instantiated multiple times.
require to moduleBase.call
*/
var MultiTape = function (properties, environment) {

  this.baseName = "multitape";
  this.interfaces.X28 = InterfaceX28;
  testGetName.call(this);
  if (properties.name) this.name = properties.name;
  var noteOffSuperImpose = new EventMessage({
    value: [headers.triggerOff]
  });
  var self = this;
  var myBitmap = 0;
  //
  /**
  Events are stored using a step-based index.
  @example [[step,microStep]]={EventPattern:eventMessage,age:how old}
  eventMessage contains additional information:  the duration of each note, in this way its easier to keep the noteoffs
  */


  var tapes = [];
  this.getTapes = function () {
    return tapes;
  }
  this.addNewTape = function () {
    let len = tapes.length;
    tapes.push(new Tape({
      outputFunction: self.memoryOutput,
      clock: clock
    }));
    return tapes[len];
  }
  this.getTapeNum = function (tape) {
    return tapes.indexOf(tape);
  }
  this.getNumTape = function (n) {
    if (tapes[n]) {
      return tapes[n]
    } else {
      console.log("false");
      return false;
    }
  }
  this.getCurrentTapeNumber = function () {
    let ret = tapes.indexOf(currentTape);
    return ret != -1 ? ret : false;
  }
  this.tapeCount = function () {
    return tapes.length;
  }
  this.selectTape = function (tape) {
    currentTape = tape;
    currentMemory = tape.memory;
  }
  this.getCurrentTape = function () {
    return currentTape;
  }
  this.removeTape = function (tape) {
    tapes.splice(tapes.indexOf(tape, 1));
  }
  this.clearTape = function (tape) {
    tape.clearMemory();
  }
  this.muteTape = function (tape) {
    tape.muted.value = true;
  }
  this.unmuteTape = function (tape) {
    tape.muted.value = false;
  }
  this.muteTapeToggle = function (tape) {
    tape.muted.value = !tape.muted.value;
  }
  this.eachTape = function (cb) {
    for (var n in tapes) {
      cb.call(tapes[n], n);
    }
  }
  // this.tapeFold=function(factor,destructive){
  //   currentTape.fold(factor,destructive);
  // }
  var currentTape = false;
  var currentMemory = false;

  function setInitState() {
    currentTape = self.addNewTape();
    currentMemory = currentTape.memory;
    if (properties) {
      console.log("TODO:should apply", properties);
    }
    self.recording = true;
  }

  var clock = this.clock = {
    steps: 32,
    step: 0,
    microSteps: 12,
    microStep: 0,
    historicStep: 0
  };

  var noteOnTracker = new NoteOnTracker(self);

  var baseEventMessage = this.baseEventMessage = new EventMessage({
    value: [headers.triggerOn, -1, -1, -1]
  });


  this.memoryOutput = function (eventMessage) {
    if (self.mute) return;
    //add eventPattern to a lengthManager, play that
    noteOnTracker.trackEventMessage(eventMessage, function (error) {
      if (error) {
        console.error(error);
        return
      }
      self.output(eventMessage);
    });
  }
  var clockFunction = function () {
    noteOnTracker.clockFunction(clock.historicStep, clock.microStep);
    for (var tape of tapes) {
      tape.clockFunction([clock.historicStep, clock.microStep]);
    }
  }

  this.recordingReceived = function (evt) {
    if (evt.eventMessage.value[0] == headers.record) {
      evt.eventMessage.value.shift();
      // if (self.recording) {
      // if(evt.eventMessage.value[0]==headers.triggerOff)console.log("LOGOFF");
      currentTape.record(evt.eventMessage);
      self.handle('eventrecorded', evt);
      // }
    }
  }
  this.messageReceived = function (evt) {

    if (evt.eventMessage.value[0] == headers.clockTick) {
      // console.log("CK");
      clock.microStep = evt.eventMessage.value[2];
      clock.microSteps = evt.eventMessage.value[1];
      if (evt.eventMessage.value[2] % evt.eventMessage.value[1] == 0) {
        clock.step++;
        clock.step %= clock.steps;
        clock.historicStep++;
      }
      clockFunction();
    } else if (evt.eventMessage.value[0] == headers.triggerOn) {
      // recorder.addEvent(evt.eventMessage);
      // noteLogger.addEvent(evt.eventMessage);

    } else if (evt.eventMessage.value[0] == headers.triggerOff) { }
  }

  setInitState();

  // this.onRemove = function () {
  //   for (var noff of noteOnTracker) {
  //     noteOnTracker.setAllOff(noff);
  //   }
  // }

}

MultiTape.color = [0, 127, 255];
module.exports = MultiTape;