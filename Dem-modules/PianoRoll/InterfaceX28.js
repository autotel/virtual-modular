"use strict";
var EventMessage = require('../../Polimod/datatypes/EventMessage.js');
var EventConfigurator = require('../x16utils/EventConfigurator.js');
var base = require('../../interaction/x16basic/interactorBase.js');
var BlankConfigurator = require('../x16utils/BlankConfigurator.js');
// var headers = EventMessage.headers;

var UARROW=String.fromCharCode(197);
var DARROW=String.fromCharCode(198);
var RARROW=String.fromCharCode(199);
var LARROW=String.fromCharCode(200);

var RecordMenu = require('../x28utils/RecordMenu.js');

module.exports = function(controlledModule,environment) {
  base.call(this);
  var self=this;
  var configurators = {};
  var shiftMode=false;

  var sequenceView=new controlledModule.memory.View();

  function getContextFilter(){
    if(shiftMode){
      return [0]
    }else{
      return [0,1,2]
    }
  }
  configurators.event = new EventConfigurator(this, {
    // baseEvent: new EventMessage({ value: [headers.triggerOn,0,-1,-1]})
    preset:1
  });


  var memPlayHead = controlledModule.memory.getPlayhead();
  configurators.time = new BlankConfigurator(this, {
    name: "",
    vars: {
      "loop start": {
        value: memPlayHead.start,
        changeFunction(thisvar,delta){
          thisvar.value = memPlayHead.start;
          thisvar.value+=delta;
          if(thisvar.value<0) thisvar.value=0;
          controlledModule.memory.setLoopDisplacement(thisvar.value);
          redrawSequenceOnNextUpdate=true;
        },
       },
      "loop len": {
        value: memPlayHead.end,
        changeFunction(thisvar,delta){
          thisvar.value = memPlayHead.end-memPlayHead.start;
          thisvar.value += delta;
          if (thisvar.value < 1) thisvar.value = 1;
          controlledModule.memory.setLoopLength(thisvar.value);
          redrawSequenceOnNextUpdate = true;
        }
      },
      "shift playhead":{
        value:0,
        changeFunction(thisvar,delta){
          var clock=controlledModule.clock;
          if(!shiftMode) delta*=clock.microSteps;
          thisvar.value+=delta;
          controlledModule.memory.jog(delta / clock.microSteps);
        },
        nameFunction(thisVar) {
          let micros = controlledModule.clock.microSteps;
          if (shiftMode) {
            return thisVar.value + "/" + micros +" steps";
          } else {
            return "" + DARROW +" micro "+thisVar.value / 12 + " steps";
          }
        }
      },
      "quantize": {
        value: controlledModule.quantize.portions,
        changeFunction(thisVar,delta){
          thisVar.value+=delta;
          if(thisVar.value)
            while(
              controlledModule.clock.microSteps/thisVar.value
              !== Math.floor(controlledModule.clock.microSteps/thisVar.value)
            ){
              thisVar.value++;
            }
          if(thisVar.value<0) thisVar.value=controlledModule.clock.microSteps-1;
          thisVar.value%=controlledModule.clock.microSteps;
          controlledModule.quantize.portions=thisVar.value;
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

  controlledModule.memory.on('step', function(clock) {
    stepOnScreen = clock.step-clock.start;
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
        // console.log(listOfEventsInView);
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
        controlledModule.memory.addEvent(configurators.event.getEventMessage(),event.button+memPlayHead.start);
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
    memPlayHead=controlledModule.memory.getPlayhead();

    // var playhead=sequenceView.getPlayhead();

    var firstStep=memPlayHead.start;
    var lastStep=memPlayHead.end;

    listOfEventsInView = controlledModule.memory.getStepRange(firstStep, lastStep+firstStep);

    var offsetView=firstStep;
    var quantizeView=1;

    var relist = {};

    for (var stindex in listOfEventsInView) {
      var viewIndex = Math.floor(stindex * quantizeView) / quantizeView;
      // viewIndex-=offsetView;
      if (!relist[viewIndex]) relist[viewIndex] = [];
      if (!isNaN(viewIndex)) {
        relist[viewIndex] = relist[viewIndex].concat(listOfEventsInView[stindex]);
      }
    }

    listOfEventsInView = relist;
    // console.log(listOfEventsInView);

    let list = listOfEventsInView;
    let currentEventMessage=configurators.event.getEventMessage();
    var baseBmp = 0;
    var fBmp=0;
    for(var step in list){
      var viewStep = step;
      if(buttonHasEvent(step))  baseBmp|=1<<viewStep;
      for(var evt of list[step]){
        if (evt.compareValuesTo){
          if (evt.compareValuesTo(currentEventMessage, getContextFilter())){
            fBmp |= 1 << viewStep;
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
