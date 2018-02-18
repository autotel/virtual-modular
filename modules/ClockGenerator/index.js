'use strict';
var EventMessage = require('../../datatypes/EventMessage.js');
var InterfaceX16 = require('./InterfaceX16');
// var clockSpec=require('../standards/clock.js');
var CLOCKTICKHEADER = 0x00;
var CLOCKABSOLUTEHEADER = 0x03;
var instanced = 0;
var name = function() {
  this.name = this.baseName + " " + instanced;
  instanced++;
}
var ClockGenerator = function(properties) {
  var thisInstance = this;
  var myInterval = false;
  var myEventMessage = new EventMessage({
    value: [CLOCKTICKHEADER, 12 /*ck per step*/ , 0 /* step number*/ ]
  });
  var cpm = this.cpm = {
    value: 60 * 16,
    updated: 60 * 16
  };
  var step = this.step = {
    value: 0,
    microSteps: 12
  }
  if (properties.cpm) this.cpm.value = properties.cpm;
  this.baseName = "clockGenerator";
  this.color = [60, 100, 100];
  name.call(this);
  if (properties.name) this.name = properties.name;
  this.interfaces.X16 =  InterfaceX16;

  function resetInterval() {
    clearInterval(myInterval);
    cpm.updated = cpm.value;
    myInterval = setInterval(function() {
      if (cpm.value != cpm.updated) resetInterval();
      step.value++;
      step.value %= step.microSteps;
      myEventMessage.value[1] = step.microSteps;
      myEventMessage.value[2] = step.value;
      thisInstance.output(myEventMessage);
      // thisInstance.handle('micro step');
    }, (60000) / (cpm.value * step.microSteps));
  }
  resetInterval();
}
module.exports = ClockGenerator;