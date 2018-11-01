"use strict";
var EventMessage = require('../../datatypes/EventMessage.js');
var BlankConfigurator = require('../x16utils/BlankConfigurator.js');
var base = require('../../interaction/x16basic/interactorBase.js');
var panton = require("../../interaction/x28basic/panton");

//instance section
module.exports = function (controlledModule) {

  /*
  what if this module disengaged the controllermode and did set the calculeitor in a pad performance mode, 
  so that the user can perform with lower latency midi output, and the same performance gets sent to this module
  */
  base.call(this);

  this.matrixButtonPressed = function (event) {
    if (controlledModule.outputHardwares.has(event.hardware)) {
      controlledModule.outputHardwares.delete(event.hardware)
    } else {
      controlledModule.outputHardwares.add(event.hardware)
    }
    updateLeds(event.hardware);
  };

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
    event.hardware.definePresetColour("dim", dimColor);
    updateHardware(event.hardware);
  };

  var updateHardware = function (hardware) {
    hardware.sendScreenA(controlledModule.name);
    updateLeds(hardware);
  }

  // controlledModule.on("midiOut", function () {
  //   controlledModule.outputHardwares.forEach(updateLeds);
  // });

  var count=0xDA;

  var updateLeds = function (hardware) {

    var yes = 0b0110100110010110;
    var no = 0b1001011001101001;
    var center = 0b0000011001100000;

    hardware.clear();
    if (controlledModule.outputHardwares.has(hardware)) {
      hardware.paintPresetColour("active", yes);
      // hardware.paintPresetColour("dimblue", center & (count % 0xFF) << 5);
      count++;
    } else {
      hardware.paintPresetColour("dim", no);
    }

  }
}