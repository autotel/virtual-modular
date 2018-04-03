"use strict";
var EventMessage = require('../../datatypes/EventMessage.js');
var EventConfigurator = require('../x16utils/EventConfigurator.js');
var base = require('../../interaction/x16basic/interactorBase.js');
var BlankConfigurator = require('../x16utils/BlankConfigurator.js');
// var RecordMenu = require('../x28utils/RecordMenu.js');

module.exports = function(controlledModule,environment) {
  base.call(this);
  var currentStep = 0;
  var configurators = {};




  var OpSetter=function(varn){
    var self=this;
    this.value=0;
    this.op=0;
    var opChangeFunction=function(thisVar, delta){
      console.log(self.value);
      self.op+=delta;
      if(self.op>=controlledModule.availOps){
        self.op=0;
      }else if(self.op<0){
        self.op=controlledModule.availOps-1;
      }
      controlledModule.opMap[varn]=self.op;
      controlledModule.triggerOperationChange();
    }
    var valChangeFunction=function(thisVar, delta){
      console.log(self.value);
      self.value+=delta;
      controlledModule.baseEventMessage.value[varn]=self.value;
      controlledModule.triggerValueChange();
    }
    var nameFunction=function(thisVar){
      if(!self.op) return "nothing"
      return controlledModule.opNames[self.op]+""+controlledModule.baseEventMessage.value[varn];
    }
    this.valu=function(){
      return {
        // value:0,
        nameFunction:nameFunction,
        changeFunction:valChangeFunction
      }
    }
    this.operator=function(){
      return {
        // value:0,
        nameFunction:nameFunction,
        changeFunction:opChangeFunction
      }
    }
  }
  var opSetters = [
    new OpSetter(0),
    new OpSetter(1),
    new OpSetter(2),
    new OpSetter(3),
  ];

  configurators.ops = new BlankConfigurator(this, {
    name: "operate",
    vars: {
      "fn head": opSetters[0].operator(),
      "ch/sub": opSetters[1].operator(),
      "num": opSetters[2].operator(),
      "prop": opSetters[3].operator(),
      "val fn head": opSetters[0].valu(),
      "val ch/sub": opSetters[1].valu(),
      "val num": opSetters[2].valu(),
      "val prop": opSetters[3].valu(),
    }
  });

  // configurators.record = new RecordMenu(this, {
  //   environment: environment,
  //   controlledModule: controlledModule
  // });

  var lastEngagedConfigurator=false;
  var engagedConfigurator = false;


  function hasEvent(button) {
    return 0 != (controlledModule.getBitmap16() & (1 << button));
  }
  var engagedHardwares = new Set();
  controlledModule.on('step', function(step) {
    // console.log("STPP");
    currentStep = step;
    if (!engagedConfigurator)
      for (let hardware of engagedHardwares) {
        updateLeds(hardware);
      }
  });
  this.matrixButtonPressed = function(event) {
    if (engagedConfigurator) {
      engagedConfigurator.matrixButtonPressed(event);
    }
  };
  this.matrixButtonReleased = function(event) {
  };
  this.selectorButtonPressed = function(event) {
    var hardware = event.hardware;
    if (engagedConfigurator) {
      engagedConfigurator.selectorButtonPressed(event);
    } else {
      if (event.data[0] == 1) {
        engagedConfigurator = configurators.ops;
        configurators.ops.engage(event);
      }else if (event.data[0] == 2) {
        // engagedConfigurator = configurators.time;
        // configurators.time.engage(event);
      }else if (event.button >= 8) {
        // engagedConfigurator = configurators.record;
      }
      if(engagedConfigurator){
        lastEngagedConfigurator = engagedConfigurator;
        engagedConfigurator.engage(event);
      }

    }
  };
  this.selectorButtonReleased = function(event) {
    var hardware = event.hardware;
    if (engagedConfigurator) {
      if (event.button == 1) {
        engagedConfigurator.disengage(event);
      }
      engagedConfigurator=false;
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
    event.hardware.draw([0,0,0]);
    // configurators.record.redraw(event.hardware);
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
  var updateLeds = function(hardware) {

  }
}