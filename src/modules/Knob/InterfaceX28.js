"use strict";
var EventMessage = require('../../datatypes/EventMessage.js');
var EventConfigurator = require('../x16utils/EventConfigurator.js');
var base = require('../../interaction/x16basic/interactorBase.js');
var BlankConfigurator = require('../x16utils/BlankConfigurator.js');
// var RecordMenu = require('../x28utils/RecordMenu.js');

module.exports = function (controlledModule, environment) {
  base.call(this);
  var currentStep = 0;
  var configurators = {};

  var value=0;
  this.outsideScroll = function (event) {
    let delta = event.delta;
    value+=delta;
    return (value);
  }


  var OpSetter = function (varn) {
    var self = this;
    this.value = 0;
    this.op = 0;
    var opChangeFunction = function (thisVar, delta) {
      console.log(self.value);
      self.op += delta;
      if (self.op >= controlledModule.availOps) {
        self.op = 0;
      } else if (self.op < 0) {
        self.op = controlledModule.availOps - 1;
      }
      controlledModule.opMap[varn] = self.op;
      controlledModule.handle('~');
    }
    var valChangeFunction = function (thisVar, delta) {
      console.log(self.value);
      self.value += delta;
      controlledModule.baseEventMessage.value[varn] = self.value;
      controlledModule.handle('~');
    }
    var nameFunction = function (thisVar) {
      if (!self.op) return "nothing"
      return controlledModule.opNames[self.op] + "" + controlledModule.baseEventMessage.value[varn];
    }
    this.valu = function () {
      return {
        // value:0,
        nameFunction: nameFunction,
        changeFunction: valChangeFunction
      }
    }
    this.operator = function () {
      return {
        // value:0,
        nameFunction: nameFunction,
        changeFunction: opChangeFunction
      }
    }
  }

  var lastEngagedConfigurator = false;
  var engagedConfigurator = false;

  var engagedHardwares = new Set();
  
  this.matrixButtonPressed = function (event) {
    
    if (engagedConfigurator) {
      engagedConfigurator.matrixButtonPressed(event);
    }
  };

  this.matrixButtonReleased = function (event) {
  };

  this.selectorButtonPressed = function (event) {
    var hardware = event.hardware;
    if (engagedConfigurator) {
      engagedConfigurator.selectorButtonPressed(event);
    } else {

    }
  };
  this.selectorButtonReleased = function (event) {
    var hardware = event.hardware;
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
    event.hardware.draw([0, 0, 0]);

    engagedConfigurator = configurators.ops;
    configurators.ops.engage(event);

    // configurators.record.redraw(event.hardware);
  };
  this.disengage = function (event) {
    engagedHardwares.delete(event.hardware);
  }
  var updateHardware = function (hardware) {
    updateLeds(hardware);
    updateScreen(hardware);
  }
  var updateScreen = function (hardware) {
    hardware.sendScreenA(controlledModule.name);
    // hardware.sendScreenB("n:"+currentStep);
  }
  var updateLeds = function (hardware) {

  }
}