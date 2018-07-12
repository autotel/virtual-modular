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
      "offset": controlledModule.offset,
    }
  });
  var engagedConfigurator = false;
  var lastEngagedConfigurator = configurators.event;
  var engagedHardwares = new Set();

  this.matrixButtonPressed = function (event) {
    if (engagedConfigurator) {
      engagedConfigurator.matrixButtonPressed(event);
    } else {
      controlledModule.bitmap^=1<<event.button;
      // console.log(controlledModule.bitmap.toString(2));
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
  var passiveUpdateHardware=function(){
    engagedHardwares.forEach(function (hardware) {
      updateLeds(hardware);
    })
  }
  var animf=0;
  var updateLeds = function (hardware) {
    // controlledModule.bitmap = makeAnimationBitmap({x:2,y:2},animf);
    
    hardware.draw([0, controlledModule.bitmap, controlledModule.bitmap]);
    animf++;
    if(animf>8) animf=0;
  }
  // setInterval(function(){
  //   engagedHardwares.forEach(function(hardware){
  //     updateLeds(hardware);
  //   })
  // }, 700);
}