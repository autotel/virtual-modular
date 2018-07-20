"use strict";
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
      "step length": {value:controlledModule.clock.substeps},
    }
  });
  configurators.global.vars['step length'].changeFunction=function(thisVar, delta) {
    thisVar.value += delta;
    if (thisVar.value < -4) {
      thisVar.value -= delta;
    } else if (thisVar.value < 1) {
      controlledModule.clock.substeps = Math.pow(2, thisVar.value);//go by 12 divisible numbers: Math.floor( Math.pow(2,-1)/(1/12) )/12
    } else {
      controlledModule.clock.substeps = thisVar.value;
    }
  }
  configurators.global.vars['step length'].nameFunction = function (thisVar) {
    return "to " + controlledModule.clock.substeps;
  }
  var engagedConfigurator = false;
  var lastEngagedConfigurator = configurators.event;
  var stepsBmp = controlledModule.sequenceBitmap;

  var engagedHardwares = new Set();

  this.matrixButtonPressed = function (event) {
    if (engagedConfigurator) {
      engagedConfigurator.matrixButtonPressed(event);
    } else {
      stepsBmp.value^=1<<event.button;
      console.log(stepsBmp.value.toString(2));
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
  var passiveUpdateLeds=function(){
    engagedHardwares.forEach(function (hardware) {
      updateLeds(hardware);
    })
  }
  controlledModule.on('step', passiveUpdateLeds);
  var animf=0;
  var updateLeds = function (hardware) {
    // stepsBmp = makeAnimationBitmap({x:2,y:2},animf);
    var playHeadBmp = 0x1111 << controlledModule.clock.step;
    hardware.draw([playHeadBmp, stepsBmp.value, stepsBmp.value]);
    animf++;
    if(animf>8) animf=0;
  }
  // setInterval(function(){
  //   engagedHardwares.forEach(function(hardware){
  //     updateLeds(hardware);
  //   })
  // }, 700);
}