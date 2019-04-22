"use strict";
var EventMessage = require('../../Polimod/datatypes/EventMessage.js');
var EventConfigurator = require('../x16utils/EventConfigurator.js');
var base = require('../../interaction/x16basic/interactorBase.js');
var BlankConfigurator = require('../x16utils/BlankConfigurator.js');

var RecordMenu = require('../x28utils/RecordMenu.js');

/**
definition of a monoSequencer interactor for the x16basic controller hardware
*/
module.exports = function(controlledModule,environment) {
  base.call(this);
  var currentStep = 0;
  var configurators = {};
  configurators.event = new EventConfigurator(this, {
    baseEvent: controlledModule.baseEventMessage
  });
  configurators.record = new RecordMenu(this, {
    environment: environment,
    controlledModule: controlledModule
  });
  configurators.time = new BlankConfigurator(this, {
    name: "",
    vars: {
      "step ratio": {
        value:controlledModule.stepDivision.value,
      },
      "mode": {
        value: "toggle",
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
      "note duration": controlledModule.noteDuration,
      "probability":controlledModule.probability,
    }
  });
  configurators.time.vars["step ratio"].changeFunction = function(thisVar, delta) {

    thisVar.value=controlledModule.stepDivision.value

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
    controlledModule.stepDivision.value=thisVar.value;
    controlledModule.recordStepDivision();
  };

  configurators.time.vars["note duration"].changeFunction = function(thisVar, delta) {
    delta /= 12;
    thisVar.value += delta;
  };
  configurators.time.vars["note duration"].nameFunction = function(thisVar) {
    return (Math.floor(thisVar.value * 100) / 100) + " steps";
  };

  
  this.outsideScroll = function (event) {
    configurators.time.vars["step ratio"].changeFunction(
      configurators.time.vars["step ratio"],
      event.delta);
    return ("steps:"+configurators.time.vars["step ratio"].value);
  }

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
        controlledModule.setStep(event.button,true);
      } else {
        controlledModule.toggleStep(event.button,true);
      }
      updateHardware(event.hardware);
    }
  };
  this.matrixButtonReleased = function(event) {
    if (engagedConfigurator) {} else {
      if (playMode.value == "momentary") {
        controlledModule.clearStep(event.button,true);
      } else {}
      updateHardware(event.hardware);
    }
  };
  this.selectorButtonPressed = function(event) {
    var hardware = event.hardware;
    if (engagedConfigurator) {
      engagedConfigurator.selectorButtonPressed(event);
    } else if (event.button == 1) {
      lastEngagedConfigurator = engagedConfigurator = configurators.event;
    }else if (event.button == 2) {
      lastEngagedConfigurator = engagedConfigurator = configurators.time;
    }else if (event.button >= 8) {
      lastEngagedConfigurator = engagedConfigurator = configurators.record;
    }
    if(engagedConfigurator){
      engagedConfigurator.engage(event);
      lastEngagedConfigurator = engagedConfigurator;
    }
  };
  this.selectorButtonReleased = function(event) {
    var hardware = event.hardware;
    if (engagedConfigurator){
      engagedConfigurator.disengage(event);
      engagedConfigurator = false;
      updateHardware(hardware);
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
  configurators.record.autoEngageWindow();
  var updateHardware = function(hardware) {
    updateLeds(hardware);
    updateScreen(hardware);
  }
  var updateScreen = function(hardware) {
    hardware.screenA(controlledModule.name);
    // hardware.screenB("n:"+currentStep);
  }
  var updateLeds = function(hardware) {
    let bmp = controlledModule.getBitmaps16();
    hardware.setMatrixMonoMap([bmp.header | bmp.steps, bmp.header, bmp.header | bmp.steps]);
  }
}