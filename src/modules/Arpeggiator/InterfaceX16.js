"use strict";
var EventMessage = require('../../datatypes/EventMessage.js');
var BlankConfigurator = require('../x16utils/BlankConfigurator.js');
var base=require('../../interaction/x16basic/interactorBase.js');

/**
definition of a monoSequencer interactor for the x16basic controller hardware
*/

//instance section
module.exports = function(controlledModule) {
  base.call(this);
  var configurators = {};
  configurators.global = new BlankConfigurator(this, {
    name: "",
    vars: {
      "clear":controlledModule.settings.reset,
      "step div": {
        value: controlledModule.clock.subSteps,
        changeFunction:function(thisVar,delta){
          thisVar.value+=delta;
          controlledModule.clock.subSteps=thisVar.value;
          console.log(controlledModule.clock);
        }
      },
    }
  });
  var engagedConfigurator = false;
  var lastEngagedConfigurator = configurators.event;
  var stepsBmp = 0;

  var engagedHardwares = new Set();

  this.matrixButtonPressed = function(event) {
    if (engagedConfigurator) {
      engagedConfigurator.matrixButtonPressed(event);
    } else {
      updateHardware(event.hardware);
    }
  };
  this.matrixButtonReleased = function(event) {
    if (engagedConfigurator) {} else {
      updateHardware(event.hardware);
    }
  };
  this.matrixButtonHold = function(event) {};
  this.selectorButtonPressed = function(event) {
    var hardware = event.hardware;
    if (engagedConfigurator) {
      engagedConfigurator.selectorButtonPressed(event);
    } else {
      if (event.data[0] == 2) {
        engagedConfigurator = configurators.global;
        configurators.global.engage(event);
      }
    }
  };
  this.selectorButtonReleased = function(event) {
    var hardware = event.hardware;
    if (event.data[0] == 2) {
      if (engagedConfigurator == configurators.global) {
        lastEngagedConfigurator = engagedConfigurator;
        engagedConfigurator.disengage(event);
        engagedConfigurator = false;
      }
    }
  };
  this.encoderScrolled = function(event) {
    if (engagedConfigurator) {
      engagedConfigurator.encoderScrolled(event);
    } else {
      if (lastEngagedConfigurator) {
        lastEngagedConfigurator.encoderScrolled(event)
      }
    }
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
    hardware.sendScreenA(controlledModule.name);
    updateLeds(hardware);
  }
  var updateLeds = function(hardware) {
    hardware.draw([0, stepsBmp, stepsBmp]);
  }
}