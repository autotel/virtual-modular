"use strict";
var EventMessage = require('../../Polimod/datatypes/EventMessage.js');
var BlankConfigurator = require('../x16utils/BlankConfigurator.js');
var base = require('../../interaction/x16basic/interactorBase.js');
var panton = require("../../interaction/x28basic/panton");

//instance section
module.exports = function (controlledModule) {
  base.call(this);
  var configurators = {};
  configurators.global = new BlankConfigurator(this, {
    name: "",
    vars: {
      "offset": controlledModule.offset,
      "modify": controlledModule.remapIndex,
    }
  });

  var engagedConfigurator = false;
  var lastEngagedConfigurator = configurators.event;
  var engagedHardwares = new Set();
  configurators.global.vars.offset.changeFunction = function (thisVar, delta) {
    thisVar.value += delta;
    if (thisVar.value > 0) thisVar.value = 0;
    if (thisVar.value < -15) thisVar.value = -15
    passiveUpdateHardware();
  }
  this.matrixButtonPressed = function (event) {
    if (engagedConfigurator) {
      engagedConfigurator.matrixButtonPressed(event);
    } else {
      controlledModule.bitmap ^= 1 << event.button;
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
  var dimColor = [
    Math.floor(controlledModule.color[0] / 3),
    Math.floor(controlledModule.color[1] / 3),
    Math.floor(controlledModule.color[2] / 3),
  ];
  var hiColor = [
    Math.floor(controlledModule.color[0] / 3),
    Math.floor(controlledModule.color[1] / 3),
    Math.floor(controlledModule.color[2] / 2),
  ];
  this.engage = function (event) {

    event.hardware.definePresetColour("active", hiColor);
    event.hardware.definePresetColour("dim",dimColor);

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
    // controlledModule.bitmap = makeAnimationBitmap({x:2,y:2},animf);
    var centerBitmap = 1 << -controlledModule.offset.value;
    // hardware.draw([0, controlledModule.bitmap, controlledModule.bitmap]);
    // hardware.drawColor(centerBitmap, [(t ? 127 : 60), (t ? 60 : 0), (t ? 60 : 0)]);
    hardware.clear();

    hardware.paintPresetColour("dim", controlledModule.bitmap);
    var ov = centerBitmap & controlledModule.bitmap;
    if (ov) {
      hardware.paintPresetColour("active", ov);
    } else {
      hardware.paintPresetColour("dimblue", centerBitmap);
    }

    // var t = centerBitmap & controlledModule.bitmap;
    // animf++;
    // if (animf > 8) animf = 0;
  }
  // setInterval(function(){
  //   engagedHardwares.forEach(function(hardware){
  //     updateLeds(hardware);
  //   })
  // }, 700);
}
