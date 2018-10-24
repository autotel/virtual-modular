"use strict";
var RARROW = String.fromCharCode(199);
var EventMessage = require('../../datatypes/EventMessage.js');
var BlankConfigurator = require('../x16utils/BlankConfigurator.js');
var base = require('../../interaction/x16basic/interactorBase.js');

//instance section
module.exports = function (controlledModule) {
  base.call(this);
  var configurators = {};
  configurators.global = new BlankConfigurator(this, {
    name: "",
    vars: {
      "delay (micro)": controlledModule.settings.delayMicro,
      "f.back opearator": controlledModule.settings.feedback,
    }
  });
  configurators.global.vars['delay (micro)'].changeFunction = function (thisVar, delta) {
    thisVar.value += delta;
    stepsBmp = numbers[thisVar.value] || 0b111;
    passiveUpdateHardware();
  }
  configurators.global.vars['delay (micro)'].nameFunction = function (thisVar) {
    let ms = controlledModule.clock.microSteps;
    return thisVar.value+" ("+Math.round(100*thisVar.value/ms)/100+"*"+ms+")";
  }
  configurators.global.vars['f.back opearator'].nameFunction = function (thisVar) {
    if (thisVar.value == 0) {
      return "no feedback"
    } else {
      return "e[3]-" + thisVar.value + "; e[3]>0"
    }
  }
  configurators.global.vars['f.back opearator'].changeFunction = function (thisVar, delta) {
    thisVar.value += -delta;
    if (thisVar.value < 0) thisVar.value = 128;
    if (thisVar.value > 128) thisVar.value = 0;
  }



  this.outsideScroll = function (event) {
    configurators.global.vars["delay (micro)"].changeFunction(
      configurators.global.vars["delay (micro)"],
      event.delta);
    return configurators.global.vars["delay (micro)"].nameFunction(
      configurators.global.vars["delay (micro)"]);
  }


  var engagedConfigurator = false;
  var lastEngagedConfigurator = configurators.event;
  var stepsBmp = 0b0111100110010111;

  var numbers = [
    0b100101010100100,
    0b100011001001110,
    0b1110110000101110,
    0b1110010010001110,
    0b1010111010001000,
    0b1110011010001110,
    0b1110001011101110,
    0b1110100001000100,
    0b1110111010101110,
    0b1110101011101000,
    0b101101110110101,
    0b101010101010101,
    0b1101101101011111,
    0b1111010110011111,
  ]

  var engagedHardwares = new Set();

  this.matrixButtonPressed = function (event) {
    if (engagedConfigurator) {
      engagedConfigurator.matrixButtonPressed(event);
    } else {
      stepsBmp ^= 1 << event.button;
      console.log(stepsBmp.toString(2));
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
  var passiveUpdateHardware = function () {
    engagedHardwares.forEach(function (hardware) {
      updateLeds(hardware);
    })
  }
  var animf = 0;
  var updateLeds = function (hardware) {
    // stepsBmp = makeAnimationBitmap({x:2,y:2},animf);

    hardware.draw([0, stepsBmp, stepsBmp]);
    animf++;
    if (animf > 8) animf = 0;
  }
  // setInterval(function(){
  //   engagedHardwares.forEach(function(hardware){
  //     updateLeds(hardware);
  //   })
  // }, 700);
}