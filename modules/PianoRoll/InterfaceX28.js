"use strict";
var EventMessage = require('../../datatypes/EventMessage.js');
var EventConfigurator = require('../x16utils/EventConfigurator.js');
var base = require('../../interaction/x16basic/interactorBase.js');
var BlankConfigurator = require('../x16utils/BlankConfigurator.js');
var TRIGGERONHEADER = 0x01;

var RecordMenu = require('../x28utils/RecordMenu.js');


/**
definition of a monoSequencer interactor for the x16basic controller hardware
*/
module.exports = function(controlledModule,environment) {
  base.call(this);
  var self=this;
  var configurators = {};
  var shiftMode=false;
  function getContextFilter(){
    if(shiftMode){
      return [0]
    }else{
      return [0,1,2]
    }
  }
  configurators.event = new EventConfigurator(this, {
    // baseEvent: new EventMessage({ value: [TRIGGERONHEADER,0,-1,-1]})
    preset:1
  });
  configurators.time = new BlankConfigurator(this, {
    name: "",
    vars: {
      "loop start": { 
        value: controlledModule.clock.loopStart,
        changeFunction(thisvar,delta){
          thisvar.value+=delta;
          if(thisvar.value<0) thisvar.value=0;
          controlledModule.clock.loopStart=thisvar.value;
        }
       },
      "loop end": { 
        value: controlledModule.clock.loopEnd,
        changeFunction(thisvar,delta){
          thisvar.value+=delta;
          if(thisvar.value<0) thisvar.value=0;
          controlledModule.clock.loopEnd=thisvar.value;
        }
      }
    }
  });
  var engagedConfigurator=false;
  var semiEngagedConfigurator=false;
  var stepOnScreen=0;
  var engagedHardwares = new Set();
  var redrawSequenceOnNextUpdate=false;

  function buttonHasEvent(button) {
    if (!listOfEventsInView[button]) return false;
    return listOfEventsInView[button].length;
  }

  controlledModule.on('step', function(clock) {
    stepOnScreen = clock.playHead-clock.loopStart;
    // console.log("step",stepOnScreen);
    if (!engagedConfigurator)
      for (let hardware of engagedHardwares) {
        updateLeds(hardware);
      }
  });
  
  this.matrixButtonPressed = function(event) {
    if (engagedConfigurator) {
      engagedConfigurator.matrixButtonPressed(event);
    } else {
      var bhe = buttonHasEvent(event.button);
      var thereWasEvent=false;
      if (bhe > 0){
        var listOfEventsInButton = listOfEventsInView[event.button];
        console.log(listOfEventsInView);
        //Potentially show a list of all the events in the step?
        if (shiftMode) {
          var rmev = listOfEventsInButton[listOfEventsInButton.length - 1];
          configurators.event.setFromEventMessage(rmev);
          controlledModule.memory.removeEvent(rmev, event.button);
          thereWasEvent = true;
        } else {
          for (var evm of listOfEventsInButton){
            if (evm.compareValuesTo(configurators.event.getEventMessage(), getContextFilter())){
              controlledModule.memory.removeEvent(evm, event.button);
              thereWasEvent=true;
            }
          }
        }
      }
      if(!thereWasEvent){
        controlledModule.memory.addEvent(configurators.event.getEventMessage(),event.button);
      }
    }
  };
  this.matrixButtonReleased = function(event) {
    if (engagedConfigurator) {} else {
      updateHardware(event.hardware);
    }
  };
  this.selectorButtonPressed = function(event) {
    var hardware = event.hardware;
    if (engagedConfigurator) {
      engagedConfigurator.selectorButtonPressed(event);
    } else if (event.data[0] == 0) {
      shiftMode=true;
      redrawSequenceOnNextUpdate=true;
    } else if (event.data[0] == 1) {
      engagedConfigurator = configurators.event;
    } else if (event.data[0] == 2) {
      engagedConfigurator = configurators.time;
    }else if (event.button >= 8) {
      engagedConfigurator = configurators.record;
    }
    if(!shiftMode){
      if(engagedConfigurator) engagedConfigurator.engage(event);
      semiEngagedConfigurator = engagedConfigurator;
    }
  };
  this.selectorButtonReleased = function(event) {
    var hardware = event.hardware;
    if (event.data[0] == 0) {
      shiftMode = false;
      redrawSequenceOnNextUpdate = true;
    } else if (engagedConfigurator){
      engagedConfigurator.disengage(event);
      engagedConfigurator = false;
      updateHardware(hardware);
    }
  };
  this.encoderScrolled = function(event) {
    if(semiEngagedConfigurator==configurators.event){
      redrawSequenceOnNextUpdate=true;
    }
    if (engagedConfigurator) {
      engagedConfigurator.encoderScrolled(event);
    } else {
      if (semiEngagedConfigurator) {
        semiEngagedConfigurator.encoderScrolled(event)
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
  var sequenceBitmap = 0;
  var focusSequenceBitmap=0;
  var listOfEventsInView={};
  var updateSequence=function(){
    listOfEventsInView=controlledModule.memory.getStepRange(0, 16, 1);
    let list = listOfEventsInView;
    let currentEventMessage=configurators.event.getEventMessage();
    var baseBmp = 0;
    var fBmp=0;
    for(var step in list){
      if(buttonHasEvent(step))  baseBmp|=1<<step;
      for(var evt of list[step]){
        if (evt.compareValuesTo){
          if (evt.compareValuesTo(currentEventMessage, getContextFilter())){
            fBmp |= 1 << step;
          }
        }
      }
    }
    sequenceBitmap=baseBmp;
    focusSequenceBitmap=fBmp;
    redrawSequenceOnNextUpdate=false;
  }

  controlledModule.memory.on('changed', function (evt) {
    redrawSequenceOnNextUpdate=true
    if(evt.added){
      if(evt.added.length) configurators.event.setFromEventMessage(evt.added[evt.added.length-1]);
    }
  });
  var updateLeds = function(hardware) {

    if (redrawSequenceOnNextUpdate){
      updateSequence();
    }
    var playheadBitmap=0;
    // console.log(self.name,"redraw");
    if(stepOnScreen >= 0 && stepOnScreen < 16){
      playheadBitmap = 1 << stepOnScreen;
    }
    hardware.draw([0, focusSequenceBitmap, focusSequenceBitmap| sequenceBitmap]);
    //TODO: fix blinking on the hardware
    // hardware.clear();
    // hardware.drawColor(sequenceBitmap, [0, 0, 127],true);
    // hardware.drawColor(focusSequenceBitmap, [64, 127, 200]);
    hardware.drawColor(playheadBitmap, [255,255,255]);
  }
}