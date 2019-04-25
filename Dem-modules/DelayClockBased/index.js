'use strict';
var EventMessage = require('../../Polimod/datatypes/EventMessage.js');

// var clockSpec=require('../standards/clock.js');
var headers = EventMessage.headers;
const Base= require("../Base");

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
var DelayClockBased = function (properties) {
  Base.call(this,properties,environment);

  var thisInstance = this;
  var myBitmap = 0;
  var settings = this.settings = {
    delayMicro: {
      value: 0,
    },
    feedback: {
      value: 0,
    },
    sendClock: {
      value: false,
    }
  }
  let clock = this.clock = {
    microsteps: 12,
    subSteps: 1,
    subStep: 0,
    step: 0
  }

  this.baseName = "DelayClockBased";
  testGetName.call(this);
  if (properties.name) this.name = properties.name;
  var self = this;


  
  
  var memory = this.memory = new Set();
  var recMessages = {
    rate: new EventMessage({ value: [headers.changeRate, 12, -1] })
  }


  var handleStepsChange = function () {
    self.handle('~module', { steps: memory.size });
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
      // handleStepsChange();
    }
  }

  this.messageReceived = function (evt) {
    if (evt.eventMessage.value[0] == headers.clockTick) {
      //microsteps are not taken into consideration by anything more than the user interface.
      clock.microSteps = evt.eventMessage.value[1];
      // var changed = false;
      memory.forEach(function (evt) {
        if (!evt.wait) evt.wait = settings.delayMicro.value;
        evt.wait--;
        if (evt.wait <= 0) {
          self.output(evt);
          if (settings.feedback.value) {
            if (evt.value[3] == -1) evt.value[3] = 100;
            if (evt.value[3] > 0) {
              evt.value[3] = Math.max(0, evt.value[3] - settings.feedback.value);
            } else {
              memory.delete(evt);
              // changed = true;
            }
          } else {
            memory.delete(evt);
            // changed = true;
          }
        }
      })
      // if (changed) handleStepsChange();
      if (settings.sendClock.value)
        memory.add(evt.eventMessage);

    } else if (evt.eventMessage.value[0] == headers.changeRate) {
      clock.subSteps = evt.eventMessage.value[2] / (evt.eventMessage.value[1] || 1);
    } else {
      memory.add(evt.eventMessage);
      // handleStepsChange();
    }
  }

  this.getBitmap16 = function () {
    return myBitmap;
  }

  this.onRemove = function () {
    memory.forEach(function (evt) {
      memory.delete(evt);
    });
    return true;
  }
};

DelayClockBased.color = [210, 0, 233];
module.exports = DelayClockBased;