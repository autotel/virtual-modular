"use strict";
var EventMessage = require('../../datatypes/EventMessage.js');
var base=require('../../interaction/x16basic/interactorBase.js');
module.exports = function(controlledModule) {
  // environment.interactionMan.interfaces.x16basic.interactorBase.call(this, controlledModule);
  var engagedHardwares = new Set();
  var playHeadBmp;
  var microStepsBmp;
  base.call(this);
  // controlledModule.on('micro step',function(event){
  // });
  //microStep event happens too often, instead I am setting an interval to updte the leds
  setInterval(function() {
    playHeadBmp = 1 << controlledModule.step.value;
    microStepsBmp = ~(0xffff << controlledModule.step.microSteps);
    for (let hardware of engagedHardwares) {
      updateLeds(hardware);
    }
  }, 20);
  this.matrixButtonPressed = function(event) {
    var hardware = event.hardware;
  };
  this.matrixButtonReleased = function(event) {};
  this.matrixButtonHold = function(event) {};
  this.selectorButtonPressed = function(event) {};
  this.selectorButtonReleased = function(event) {};
  this.encoderScrolled = function(event) {
    controlledModule.cpm.value += event.delta;
    event.hardware.sendScreenA("CPM" + controlledModule.cpm.value);
  };
  this.encoderPressed = function(event) {};
  this.encoderReleased = function(event) {};
  this.engage = function(event) {
    engagedHardwares.add(event.hardware);
    updateHardware(event.hardware);
  };
  this.disengage = function(event) {
    engagedHardwares.delete(event.hardware);
  }
  var updateHardware = function(hardware) {
    hardware.sendScreenA("Clock Generator");
    updateLeds(hardware);
  }
  var updateLeds = function(hardware) {
    hardware.draw([
      playHeadBmp,
      playHeadBmp | microStepsBmp,
      playHeadBmp | microStepsBmp
    ]);
  }
}