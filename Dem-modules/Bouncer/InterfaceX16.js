"use strict";
var EventMessage = require('../../datatypes/EventMessage.js');
var EventConfigurator = require('../x16utils/EventConfigurator.js');
var base = require('../../interaction/x16basic/interactorBase.js');
var RecordMenu = require('../x28utils/RecordMenu.js');

module.exports = function(controlledModule,environment) {
  base.call(this);
  var configurators = {};

  var lastEngagedConfigurator=false;
  var engagedConfigurator = false;
  var engagedHardwares = new Set();
  var lazyQueue=new environment.utils.LazyQueue();

  configurators.record = new RecordMenu(this, {
    environment: environment,
    controlledModule: controlledModule
  });

  var bitmap=0;
  controlledModule.on('received', function(evMes) {
    var newBitmap=1<<(evMes.value[2]%16);
    bitmap|=newBitmap
    updateLeds();
    var TFunc=function(newBitmap){
      this.do=function(){
        lazyQueue.enq(function(){
          bitmap&=~(newBitmap);
          updateLeds();
        });
      }
    }
    setTimeout(new TFunc(newBitmap).do,300);
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
      }else if (event.data[0] == 2) {
        // engagedConfigurator = configurators.time;
        // configurators.time.engage(event);
      }else if (event.button >= 8) {
        lastEngagedConfigurator = engagedConfigurator = configurators.record;
      }
      lastEngagedConfigurator = engagedConfigurator;
    }
  };
  this.selectorButtonReleased = function(event) {
    var hardware = event.hardware;
    if (event.data[0] == 1) {
      if (engagedConfigurator) {
        engagedConfigurator.disengage(event);
        engagedConfigurator=false;
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

  configurators.record.autoEngageWindow();
  var updateHardware = function(hardware) {
    updateLeds(hardware);
    updateScreen(hardware);
  }
  var updateScreen = function(hardware) {
    hardware.sendScreenA(controlledModule.name);
    // hardware.sendScreenB("n:"+currentStep);
  }
  var updateLeds = function(hardware) {
    if (!engagedConfigurator){
      var updateFn=function(hardware){
        hardware.draw([bitmap,0,bitmap]);
      }
      if(hardware){
        updateFn(hardware);
      }else{
        for (let hardware of engagedHardwares) {
          updateFn(hardware);
        }
      }
    }
  }
}