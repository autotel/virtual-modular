"use strict";
var EventMessage = require('../../datatypes/EventMessage.js');
var EventConfigurator = require('../x16utils/EventConfigurator.js');
var base=require('../../interaction/x16basic/interactorBase.js');
/**
definition of a monoSequencer interactor for the x16basic controller hardware
*/

//instance section
module.exports = function(controlledModule) {
  base.call(this);
  var configurators = {};
  configurators.event = new EventConfigurator(this, {
    baseEvent: controlledModule.baseEventMessage
  });
  var engagedConfigurator = false;
  var lastEngagedConfigurator = configurators.event;
  var stepsBmp = 0;

  function hasEvent(button) {
    return 0 != (controlledModule.getBitmap16() & (1 << button));
  }
  var engagedHardwares = new Set();
  controlledModule.on('step', function() {
    if (!engagedConfigurator)
      for (let hardware of engagedHardwares) {
        updateLeds(hardware);
      }
  });
  this.matrixButtonPressed = function(event) {
    if (engagedConfigurator) {
      engagedConfigurator.matrixButtonPressed(event);
    } else {
      controlledModule.toggleStep(event.button);
      updateHardware(event.hardware);
    }
  };
  this.matrixButtonReleased = function(event) {
    if (engagedConfigurator) {} else {
      // controlledModule.clearStep(event.button);
      updateHardware(event.hardware);
    }
  };
  this.matrixButtonHold = function(event) {};
  this.selectorButtonPressed = function(event) {
    var hardware = event.hardware;
    if (engagedConfigurator) {
      engagedConfigurator.selectorButtonPressed(event);
    } else {
      if (event.data[0] == 1) {
        engagedConfigurator = configurators.event;
        configurators.event.engage({
          hardware: hardware
        });
      }
    }
  };
  this.selectorButtonReleased = function(event) {
    var hardware = event.hardware;
    if (event.data[0] == 1) {
      if (engagedConfigurator == configurators.event) {
        lastEngagedConfigurator = engagedConfigurator;
        engagedConfigurator = false;
        configurators.event.disengage({
          hardware: hardware
        });
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
    stepsBmp = controlledModule.getBitmap16();
    hardware.draw([0, stepsBmp, stepsBmp]);
  }
}