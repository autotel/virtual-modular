"use strict";
var EventMessage = require('../../Polimod/datatypes/EventMessage.js');
var EventConfigurator = require('../x16utils/EventConfigurator.js');
var BlankConfigurator = require('../x16utils/BlankConfigurator.js');

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
  configurators.global = new BlankConfigurator(this, {
    name: "",
    vars: {
      "step div": {
        value: controlledModule.clock.subSteps,
        changeFunction:function(thisVar,delta){
          thisVar.value+=delta;
          if(thisVar.value<-4){
            thisVar.value-=delta;
          }else if(thisVar.value<1){
            controlledModule.clock.subSteps=Math.pow(2,thisVar.value);//go by 12 divisible numbers: Math.floor( Math.pow(2,-1)/(1/12) )/12
          }else{
            controlledModule.clock.subSteps=thisVar.value;
          }
          console.log(controlledModule.clock);
        },
        nameFunction:function(thisVar){
          return "to "+controlledModule.clock.subSteps;
        }
      },
      "duration": controlledModule.settings.duration
    }
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
        configurators.event.engage(event);
      }
      if (event.data[0] == 2) {
        engagedConfigurator = configurators.global;
        configurators.global.engage(event);
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
    }if (event.data[0] == 2) {
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
    stepsBmp = controlledModule.getBitmap16();
    hardware.draw([0, stepsBmp, stepsBmp]);
  }
}