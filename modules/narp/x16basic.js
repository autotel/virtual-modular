"use strict";
var EventMessage = require('../../datatypes/EventMessage.js');
var EventConfigurator = require('../x16utils/EventConfigurator.js');
var BlankConfigurator = require('../x16utils/BlankConfigurator.js');
/**
definition of a monoSequencer interactor for the x16basic controller hardware
*/
module.exports = function(environment) {
  //singleton section
  var myInteractorBase = environment.interactionMan.interfaces.x16basic.interactorBase;
  var currentStep = 0;

  //instance section
  this.Instance = function(controlledModule) {
    myInteractorBase.call(this, controlledModule);
    var configurators = {};
    configurators.event = new EventConfigurator(this, {
      baseEvent: controlledModule.baseEventMessage
    });
    configurators.time = new BlankConfigurator(this, {
      name: "",
      vars: {
        "step ratio": controlledModule.stepDivision,
        "mode": {
          value: "momentary",
          changeFunction: function(thisVar, delta) {
            if (thisVar.value == "momentary") {
              thisVar.value = "toggle"
            } else {
              thisVar.value = "momentary"
            }
          },
          disengageFunction: function(thisVar) {
            if (thisVar.value == "momentary") {
              controlledModule.clearAll();
            }
          }
        },
        "note duration": controlledModule.noteDuration
      }
    });
    configurators.time.vars["step ratio"].changeFunction=function(thisVar,delta){
      if(delta>0){
        if(thisVar.value<2){
          thisVar.value*=2;
        }else{
          thisVar.value++
        }
      }else{
        if(thisVar.value<2){
          thisVar.value/=2;
        }else{
          thisVar.value--;
        }
      }
    };
    configurators.time.vars["note duration"].changeFunction=function(thisVar,delta){
      delta/=12;
      thisVar.value+=delta;
    };
    configurators.time.vars["note duration"].nameFunction=function(thisVar){
      return (Math.floor(thisVar.value*100)/100)+" steps";
    };

    var playMode = configurators.time.vars["mode"];

    var engagedConfigurator = false;
    var lastEngagedConfigurator = configurators.event;
    var stepsBmp = 0;

    function hasEvent(button) {
      return 0 != (controlledModule.getBitmap16() & (1 << button));
    }
    var engagedHardwares = new Set();
    controlledModule.on('step', function(step) {
      // console.log("STPP");
      currentStep = step;
      if (!engagedConfigurator)
        for (let hardware of engagedHardwares) {
          updateLeds(hardware);
        }
    });
    this.matrixButtonPressed = function(event) {
      if (engagedConfigurator) {
        engagedConfigurator.matrixButtonPressed(event);
      } else {
        if (playMode.value == "momentary") {
          controlledModule.setStep(event.button);
        } else {
          controlledModule.toggleStep(event.button);
        }
        updateHardware(event.hardware);
      }
    };
    this.matrixButtonReleased = function(event) {
      if (engagedConfigurator) {} else {
        if (playMode.value == "momentary") {
          controlledModule.clearStep(event.button);
        } else {}
        updateHardware(event.hardware);
      }
    };
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
          engagedConfigurator = configurators.time;
          configurators.time.engage(event);
        }
        lastEngagedConfigurator = engagedConfigurator;
      }
    };
    this.selectorButtonReleased = function(event) {
      var hardware = event.hardware;
      if (event.data[0] == 1) {
        if (engagedConfigurator == configurators.event) {
          engagedConfigurator = false;
          configurators.event.disengage(event);
        }
      }
      if (event.data[0] == 2) {
        if (engagedConfigurator == configurators.time) {
          engagedConfigurator = false;
          configurators.time.disengage(event);
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
      updateLeds(hardware);
      updateScreen(hardware);
    }
    var updateScreen = function(hardware) {
      hardware.sendScreenA(controlledModule.name);
      // hardware.sendScreenB("n:"+currentStep);
    }
    var updateLeds = function(hardware) {
      stepsBmp = controlledModule.getBitmap16();
      var headerBmp=0;
      if(stepsBmp>0){
        headerBmp=1<<controlledModule.baseEventMessage.value[2];
      }
      hardware.draw([headerBmp|stepsBmp, headerBmp, headerBmp|stepsBmp]);
    }
  }
}