'use strict';
var EventMessage = require('../../Polimod/datatypes/EventMessage.js');
const Base= require("../Base");
var headers = EventMessage.headers;

/**
 @constructor
 the instance of the of the module, ment to be instantiated multiple times.
 require to moduleBase.call
 */


var FixNoteLen = function (properties,environment) {
  Base.call(this,properties,environment);
  var thisInstance = this;
  var myBitmap = 0;
  var settings = this.settings = {
    delayMicro: {
      value: 0,
    },
    // feedback:{
    //   value:0,
    //   valueNames:['no','yes'],
    // },
  }
  let clock = this.clock = {
    subSteps: 1,
    subStep: 0,
    step: 0
  }

  
  this.baseName = "FixNoteLen";
  
  
  var self = this;

  

  var memory = new Set();
  var recMessages = {
    rate: new EventMessage({ value: [headers.changeRate, 12, -1] })
  }
  this.recordRate = function () {
    recMessages.rate.value[2] = settings.delayMicro.value;
    self.recordOutput(recMessages.rate);
  }
  this.recordingReceived = function (evt) {
    if (evt.eventMessage.value[0] == headers.record) {
      var event = evt.eventMessage;
      event.value.shift();
      memory.add(event);
    }
    //backpropagate rec messages
  }
  this.messageReceived = function (evt) {
    if (evt.eventMessage.value[0] == headers.clockTick) {
      memory.forEach(function (evt) {
        if (!evt.wait) evt.wait = settings.delayMicro.value;
        evt.wait--;
        if (evt.wait <= 0) {
          evt.value[0] = headers.triggerOff;
          //console.log("opt", evt.value);
          self.output(evt);
          memory.delete(evt);
        }
      })
    } else if (evt.eventMessage.value[0] == headers.changeRate) {
      clock.subSteps = evt.eventMessage.value[2] / (evt.eventMessage.value[1] || 1);
    } else if (evt.eventMessage.value[0] == headers.triggerOn) {
      if (settings.delayMicro.value > 0) {
        memory.add(evt.eventMessage);
        self.output(evt.eventMessage);
      }
    }
  }

  this.getBitmap16 = function () {
    return myBitmap;
  }
  // this.onRemove = function () {
  //   noteOnTracker.empty(function (noff) {
  //     thisInstance.output(noff, true);
  //   });
  //   return true;
  // }

  this.handleStepsChange = function () {
    self.handle('~module', { steps: runningNotes.length });
  }

};

FixNoteLen.color = [210, 0, 233];
module.exports = FixNoteLen;