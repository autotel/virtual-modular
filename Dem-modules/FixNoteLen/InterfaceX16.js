"use strict";
var EventMessage = require('../../Polimod/datatypes/EventMessage.js');
var BlankConfigurator = require('../x16utils/BlankConfigurator.js');
var base = require('../../interaction/x16basic/interactorBase.js');


//instance section
module.exports = function (controlledModule) {
  base.call(this);
  var configurators = {};
  configurators.global = new BlankConfigurator(this, {
    name: "",
    vars: {
      "duration (micro)": controlledModule.settings.delayMicro,
    }
  });
  configurators.global.vars['duration (micro)'].changeFunction=function(thisVar, delta) {
    thisVar.value += delta;
    stepsBmp = numbers[thisVar.value] || 0b111;
    passiveUpdateHardware();
  }
  var engagedConfigurator = false;
  var lastEngagedConfigurator = configurators.global;
  var stepsBmp = 0b0111100110010111;

  var numbers=[
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
    0b1011111110011001,
    0b1111011110010111,
    0b1111001111111111,
    0b1101100110011001,
    0b1111111110111111,
    0b1111111110011001,
    0b1111111011011111,
    0b1011101010011011,
    0b1111101001011111,
    0b1111111010011111,
    0b1111111010011011,
    0b1111011010011111,
    0b1111011011011111,
    0b1111101010011011,
    0b1111111011011111,
    0b1111111010011011,
    0b1111111111101111,
    0b1011101110101011,
    0b1111101101101111,
    0b1111111110101111,
    0b1111111110101011
  ]

  var engagedHardwares = new Set();

  this.matrixButtonPressed = function (event) {
    if (engagedConfigurator) {
      engagedConfigurator.matrixButtonPressed(event);
    } else {
      stepsBmp^=1<<event.button;
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
      if (event.button == 2) {
        engagedConfigurator = configurators.global;
        configurators.global.engage(event);
      }
    }
  };
  this.selectorButtonReleased = function (event) {
    var hardware = event.hardware;
    if (event.button == 2) {
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
  this.outsideScroll = function(event) {
    controlledModule.settings.delayMicro.value += event.delta;
    var ret = "NoteLength:"+controlledModule.settings.delayMicro.value;
    stepsBmp = numbers[controlledModule.settings.delayMicro.value] || 0b111;
    passiveUpdateHardware();
    return (ret);
  }
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
    hardware.screenA(controlledModule.name);
    updateLeds(hardware);
  }
  var passiveUpdateHardware=function(){
    engagedHardwares.forEach(function (hardware) {
      updateLeds(hardware);
    })
  }
  var animf=0;
  var updateLeds = function (hardware) {
    // stepsBmp = makeAnimationBitmap({x:2,y:2},animf);

    hardware.setMatrixMonoMap([0, stepsBmp, stepsBmp]);
    animf++;
    if(animf>8) animf=0;
  }
  // setInterval(function(){
  //   engagedHardwares.forEach(function(hardware){
  //     updateLeds(hardware);
  //   })
  // }, 700);
}
