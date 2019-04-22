"use strict";
var EventMessage = require('../../Polimod/datatypes/EventMessage.js');
var BlankConfigurator = require('../x16utils/BlankConfigurator.js');
var base = require('../../interaction/x16basic/interactorBase.js');

/**
definition of a monoSequencer interactor for the x16basic controller hardware
*/

//instance section
module.exports = function (controlledModule) {

  base.call(this);
  var sequence = controlledModule.monosequence;
  var view = { step: 0 }
  var configurators = {};
  configurators.global = new BlankConfigurator(this, {
    name: "",
    vars: {
      "clear": controlledModule.settings.reset,
      "step ratio": {
        value: controlledModule.clock.subSteps,
      },
      "sequence length": sequence.length,
    }
  });
  configurators.global.vars["step ratio"].changeFunction = function (thisVar, delta) {
    thisVar.value = controlledModule.clock.subSteps
    if (delta > 0) {
      if (thisVar.value < 2) {
        thisVar.value *= 2;
      } else {
        thisVar.value++
      }
    } else {
      if (thisVar.value < 2) {
        thisVar.value /= 2;
      } else {
        thisVar.value--;
      }
    }
    controlledModule.clock.subSteps = thisVar.value;
    controlledModule.recordStepDivision();
  };

  var engagedConfigurator = false;
  var lastEngagedConfigurator = configurators.event;
  var stepsBmp = 0;

  var engagedHardwares = new Set();

  this.matrixButtonPressed = function (event) {
    if (engagedConfigurator) {
      engagedConfigurator.matrixButtonPressed(event);
    } else {
      sequence.toggleStep(event.button + view.step);
      updateHardware(event.hardware);
    }
  };
  this.matrixButtonReleased = function (event) {
    if (engagedConfigurator) { } else {
      updateHardware(event.hardware);
    }
  };
  this.matrixButtonHold = function (event) { };
  this.selectorButtonPressed = function (event) {
    var hardware = event.hardware;
    if (engagedConfigurator) {
      engagedConfigurator.selectorButtonPressed(event);
    } else {
      if (event.data[0] == 2) {
        engagedConfigurator = configurators.global;
        configurators.global.engage(event);
      } else if (event.data[0] > 3) {
        view.step = (event.data[0] - 4) * 16;
        updateLeds(event.hardware);
      }
    }
  };
  this.selectorButtonReleased = function (event) {
    var hardware = event.hardware;
    if (event.data[0] == 2) {
      if (engagedConfigurator == configurators.global) {
        lastEngagedConfigurator = engagedConfigurator;
        engagedConfigurator.disengage(event);
        engagedConfigurator = false;
      }
    }
  };
  this.encoderScrolled = function (event) {
    if (engagedConfigurator) {
      engagedConfigurator.encoderScrolled(event);
    } else {
      if (lastEngagedConfigurator) {
        lastEngagedConfigurator.encoderScrolled(event)
      }
    }
  };
  this.encoderPressed = function (event) { };
  this.encoderReleased = function (event) { };
  this.engage = function (event) {
    engagedHardwares.add(event.hardware);
    updateHardware(event.hardware);
  };
  this.disengage = function (event) {
    engagedHardwares.delete(event.hardware);
  }
  var updateHardware = function (hardware) {
    hardware.sendScreenA(controlledModule.name);
    updateLeds(hardware);
  }
  var updateLeds = function (hardware) {
    if (engagedConfigurator) return;
    stepsBmp = (sequence.getBitmap() >> (view.step)) & 0xFFFF;
    // console.log(sequence.playhead.value);
    var playheadBmp = 0;

    if (sequence.playhead.value >= view.step && sequence.playhead.value < view.step + 16) {
      playheadBmp = (0x1 << Math.abs(sequence.playhead.value - view.step)) & 0xFFFF
    }
    hardware.draw([stepsBmp | playheadBmp, playheadBmp, stepsBmp | playheadBmp]);
  }
  var passiveUpdateLeds = function () {
    // console.log("PUL");
    engagedHardwares.forEach(function (hardware) {
      updateLeds(hardware);
    })
  }
  sequence.on('step', passiveUpdateLeds);
}