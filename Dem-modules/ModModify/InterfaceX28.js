"use strict";
var EventMessage = require('../../datatypes/EventMessage.js');
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
      "modify": controlledModule.remapIndex,
    }
  });

  function HardwareLocals(hw){
    this.hardware=hw;
    this.currentOperatorModificationIndex=1;
    this.selectedButton=0;
    this.engagedConfigurator=false;
    this.lastEngagedConfigurator=false;
    this.shiftPressed=false;
    this.engaged=false;
  }
  var hardwareLocals = [];

  this.matrixButtonPressed = function (event) {
    var hin = event.hardware.instanceNumber;
    var thlocs=hardwareLocals[hin];

    if (thlocs.engagedConfigurator) {
      thlocs.engagedConfigurator.matrixButtonPressed(event);
    } else if(thlocs.shiftPressed){
      controlledModule.toggleModifierMute(event.button);
    }else{
      thlocs.selectedButton=event.button;
      updateHardware(event.hardware);
    }
  };
  this.matrixButtonReleased = function (event) {
    var hin = event.hardware.instanceNumber;
    var thlocs=hardwareLocals[hin];

    if (thlocs.engagedConfigurator) { } else {
      updateHardware(event.hardware);
    }
  };
  this.matrixButtonHold = function (event) { };
  this.selectorButtonPressed = function (event) {
    var hin = event.hardware.instanceNumber;
    var thlocs=hardwareLocals[hin];

    var hardware = event.hardware;
    if (thlocs.engagedConfigurator) {
      thlocs.engagedConfigurator.selectorButtonPressed(event);
    } else {
      if (event.data[0] == 2) {
        thlocs.engagedConfigurator = configurators.global;
        configurators.global.engage(event);
      }else if(event.button==0){
        thlocs.shiftPressed=true;
      }
    }
  };
  this.selectorButtonReleased = function (event) {
    var hin = event.hardware.instanceNumber;
    var thlocs=hardwareLocals[hin];

    var hardware = event.hardware;
    thlocs.lastEngagedConfigurator=false;
    if (event.data[0] == 2) {
      if (thlocs.engagedConfigurator == configurators.global) {
        thlocs.lastEngagedConfigurator = thlocs.engagedConfigurator;
        thlocs.engagedConfigurator.disengage(event);
        thlocs.engagedConfigurator = false;
        updateHardware(event.hardware);
      }
    }else if(event.button==0){
      thlocs.shiftPressed=false;
    }
  };
  this.encoderScrolled = function (event) {
    var hin = event.hardware.instanceNumber;
    var thlocs=hardwareLocals[hin];

    if (thlocs.engagedConfigurator) {
      thlocs.engagedConfigurator.encoderScrolled(event);
    } else {
      if (thlocs.lastEngagedConfigurator) {
        thlocs.lastEngagedConfigurator.encoderScrolled(event)
      }else{
        var modindex=1;
        if(thlocs.shiftPressed){
          modindex=0;
        }
        var thisModifier=controlledModule.modifiers[thlocs.selectedButton];
        thisModifier[modindex]+=event.delta;
        if(modindex==0){
          var maxval=0xFF;
          maxval=controlledModule.operators.length;
          if(thisModifier[modindex]>=maxval) thisModifier[modindex]=0;
          if(thisModifier[modindex]< 0) thisModifier[modindex]=maxval;
        }
        passiveUpdateScreen(thlocs);
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
    var hin=event.hardware.instanceNumber;
    if(!hardwareLocals[hin])hardwareLocals[hin]=new HardwareLocals(event.hardware);
    var thlocs=hardwareLocals[hin];
    if(thlocs) thlocs
    event.hardware.definePresetColour("active", hiColor);
    event.hardware.definePresetColour("dim",dimColor);
    hardwareLocals[hin].engaged=true;
    updateHardware(event.hardware);
  };
  this.disengage = function (event) {
    var hin=event.hardware.instanceNumber;
    hardwareLocals[hin].engaged=false;
  }
  var updateHardware = function (hardware) {
    var hin=hardware.instanceNumber;
    var thlocs=hardwareLocals[hin];
    updateScreen(hardware);
    updateLeds(hardware);
  }
  function updateScreen(hardware){
    var hin=hardware.instanceNumber;
    var thlocs=hardwareLocals[hin];
    if(!thlocs.engaged)return;
    hardware.sendScreenA(controlledModule.name);
    var curmod=controlledModule.modifiers[thlocs.selectedButton];
    hardware.sendScreenB(">"
      +thlocs.selectedButton
      +":"+controlledModule.operators[curmod[0]].name
      +""+curmod[1]);
  }

  var passiveUpdateScreen = function (caller) {
    console.log("blo");
    hardwareLocals.forEach(function (thlocs) {
      console.log("pup");
      if(thlocs.engaged &&thlocs.selectedButton==caller.selectedButton){
        updateScreen(thlocs.hardware);
      }
    })
  }
  var passiveUpdateHardware = function () {
    console.log("blo");
    hardwareLocals.forEach(function (thlocs) {
      console.log("pup");
      if(thlocs.engaged){
        updateHardware(thlocs.hardware);
      }
    })
  }
  var animf = 0;
  var updateLeds = function (hardware) {
    var hin=hardware.instanceNumber;
    var thlocs=hardwareLocals[hin]
    if(!thlocs.engaged) return;

    var selbmp=1<<thlocs.selectedButton;
    hardware.clear();
    var mutedBitmap=0;
    controlledModule.modifiers.map(function(mod,i){ if(mod[0]==0) mutedBitmap|=1<<i });
    hardware.paintPresetColour("gray", mutedBitmap);
    hardware.paintPresetColour("dimblue", 0xFFFF^mutedBitmap);

    if (thlocs.selectedButton!==false) {
      hardware.paintPresetColour("active", selbmp);
    }

  }
  // setInterval(function(){
  //   hardwareLocals.forEach(function(hardware){
  //     updateLeds(hardware);
  //   })
  // }, 700);
}
