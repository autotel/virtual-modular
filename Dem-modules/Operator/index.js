'use strict';

var EventMessage = require('../../Polimod/datatypes/EventMessage.js');
var NoteOnTracker = require('../moduleUtils/NoteOnTracker.js');

var InterfaceX16 = require('./InterfaceX16');

/**
@constructor ModuleSingleton
singleton, only one per run of the program
every module needs to run at the beginning of the runtime to register it's interactor in the interactionManager

*/
var headers = EventMessage.headers;
var instancesCount = 0;
var testGetName = function () {
  this.name = this.baseName + " " + instancesCount;
  instancesCount++;
}
/**
@constructor
the instance of the of the module, ment to be instantiated multiple times.
require to moduleBase.call
*/
var Operator = function (properties) {

  //maybe the operator should allow layering of many operation layers, also adding timing operations

  var self = this;
  this.preventBus = true;
  this.baseName = "Operator";

  var baseEventMessage = this.baseEventMessage = new EventMessage({ value: [0, 0, 0, 0] });

  let opMap = this.opMap = [0, 0, 0, 0];

  testGetName.call(this);

  if (properties.name) this.name = properties.name;

  var noteOnTracker = new NoteOnTracker(this);

  this.interfaces.X16 = InterfaceX16;
  this.ops = {
    "none": function (signal) {
      return signal;
    },
    "=": function (signal, value) {
      return value
    },
    "+": function (signal, value) {
      return signal + value
    },
    "-": function (signal, value) {
      return signal - value
    },
    "*": function (signal, value) {
      return signal * value;
    },
    "%": function (signal, value) {
      return signal % value;
    },
    "?": function (signal, value) {
      if (value == signal) return signal;
      return false;
    },
    "!": function (signal, value) {
      if (value != signal) return signal;
      return false;
    },
    "s<": function (signal, value) {
      if (value > signal) return signal;
      return false;
    },
    "s>": function (signal, value) {
      if (value < signal) return signal;
      return false;
    }
  }
  //make lookup arrays
  this.opNames = [];
  var opFns = this.opFns = [];
  this.availOps = 0;
  for (var n in this.ops) {
    this.opNames.push(n);
    this.opFns.push(this.ops[n]);
    this.availOps++;
  }

  this.triggerOperationChange = function () {
    // operationEventMessage.update();
    // self.recordOutput(operationEventMessage);
  }
  this.triggerValueChange = function () {
    // valuesEventMessage.update();
    // self.recordOutput(valuesEventMessage);
  }
  this.recordingReceived = function (evt) {
    var inEvt = evt.eventMessage;

    if (inEvt.value[0] == headers.record) {
      inEvt.value.shift();
      for (var a in inEvt.value) {
        baseEventMessage.value[a] = inEvt.value[a];
      }
    }
  }
  this.messageReceived = function (evt) {
    var inEvt = evt.eventMessage;
    var outEvt = inEvt.clone();
    var cancelEvent = false;
    if (inEvt.value[0] == headers.triggerOff) {
      var noteTrackerKey = [inEvt.value[1], inEvt.value[2]];
      // console.log(noteTrackerKey);
      noteOnTracker.ifNoteOff(noteTrackerKey, function (noteOff) {
        self.output(noteOff);
        // console.log("NOFF",noteOff.value);
      });
    }

    for (var n in opMap) {
      if (opMap[n]) {
        var result = opFns[opMap[n]](inEvt.value[n], baseEventMessage.value[n]);
        if (typeof result === "boolean") {
          // console.log("CANCEL",inEvt.value);
          cancelEvent = true;
        } else {
          // console.log("PASS",inEvt.value);

          outEvt.value[n] = result;
        }
      }
    }

    if (!cancelEvent) {
      if (inEvt.value[0] == headers.triggerOn) {
        var noteTrackerKey = [inEvt.value[1], inEvt.value[2]];
        noteOnTracker.add(outEvt, noteTrackerKey);
      }
      self.output(outEvt);
    }

  }
  // this.onRemove = function () {
  //   for (let a in opMap) {
  //     opMap[a] = 0;
  //   }
  //   noteOnTracker.empty(function (noteOff) {
  //     // console.log("NOFF",noteOff.value);
  //     self.output(noteOff);
  //   });
  //   return true;
  // }
}

Operator.color = [255, 0, 255];
module.exports = Operator