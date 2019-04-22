"use strict";
var EventMessage = require('../../Polimod/datatypes/EventMessage.js');
var BlankConfigurator = require('../x16utils/BlankConfigurator.js');
var base=require('../../interaction/x16basic/interactorBase.js');

/**
definition of a monoSequencer interactor for the x16basic controller hardware
*/

//instance section
module.exports = function(controlledModule) {
  base.call(this);
  var configurators = {};
  configurators.global = new BlankConfigurator(this, {
    name: "",
    vars: {
      polyphony: controlledModule.polyphony,
    }
  });
  configurators.global.vars.polyphony.changeFunction=function(thisVar,delta){
    thisVar.value=parseInt(thisVar.value);
    if(thisVar.value+delta>=0){
      thisVar.value+=delta;
      controlledModule.triggerPolyphonyChange();
      passiveUpdateLeds();
    }
  }
  var engagedConfigurator = false;
  var lastEngagedConfigurator = configurators.event;
  var stepsBmp = 0;

  var engagedHardwares = new Set();

  var runningNotes=[];
  function runningNotesChange(evMes){
    runningNotes=controlledModule.getRunningNotes();
    passiveUpdateLeds();
  }
  controlledModule.on('non',runningNotesChange);
  controlledModule.on('noff',runningNotesChange);

  function passiveUpdateLeds() {
    if (!engagedConfigurator)
      for (var hardware of engagedHardwares) {
        updateLeds(hardware);
      }
  }

  this.matrixButtonPressed = function(event) {
    if (engagedConfigurator) {
      engagedConfigurator.matrixButtonPressed(event);
    } else {
      if(event.button<runningNotes.length){
        controlledModule.killNote(runningNotes[event.button]);
      }
    }
  };
  this.matrixButtonReleased = function(event) {
    if (engagedConfigurator) {} else {
      updateHardware(event.hardware);
    }
  };
  this.matrixButtonHold = function(event) {};
  this.selectorButtonPressed = function(event) {
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
  this.selectorButtonReleased = function(event) {
    var hardware = event.hardware;
    if (event.button == 2) {
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
    hardware.screenA(controlledModule.name);
    updateLeds(hardware);
  }
  var updateLeds = function(hardware) {
    var notesBmp=~(0xffff<<runningNotes.length)
    var containerBmp=~(0xffff<<controlledModule.polyphony.value)
    hardware.setMatrixMonoMap([containerBmp^notesBmp, containerBmp|notesBmp, containerBmp|notesBmp]);
  }
}