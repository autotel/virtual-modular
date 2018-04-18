"use strict";
var RARROW = String.fromCharCode(199);
var LARROW = String.fromCharCode(200);

var EventMessage = require('../../datatypes/EventMessage.js');
var base=require('../../interaction/x16basic/interactorBase.js');
module.exports = function(controlledModule) {
  // environment.interactionMan.interfaces.x16basic.interactorBase.call(this, controlledModule);
  var engagedHardwares = new Set();
  var playHeadBmp;
  var microStepsBmp;
  var shiftPressed=false;
  base.call(this);
  // controlledModule.on('micro step',function(event){
  // });
  //microStep event happens too often, instead I am setting an interval to updte the leds
  setInterval(function() {
    playHeadBmp = 1 << controlledModule.step.value;
    microStepsBmp = ~(0xffff << controlledModule.step.microSteps);
    for (let hardware of engagedHardwares) {
      updateLeds(hardware);
    }
  }, 20);
  this.matrixButtonPressed = function(event) {
    var hardware = event.hardware;
  };
  this.matrixButtonReleased = function(event) {};
  this.matrixButtonHold = function(event) {};
  var drifting=0;
  this.selectorButtonPressed = function(event) {
    if(event.button==0) shiftPressed=true;
  };
  this.selectorButtonReleased = function(event) {
    if(event.button==0 && shiftPressed){
      shiftPressed=false;
      drifting=0;
      controlledModule.metro.drift(drifting);
      event.hardware.sendScreenA("");
    }
  };
  var bpm=120;
  this.encoderScrolled = function(event) {
    if(shiftPressed){
      drifting+=event.delta;
      controlledModule.metro.drift(drifting);
      var string="";
      if(drifting>0){
        string="Drift";
        for(var a=0; a<Math.abs(drifting); a++){
          string+=RARROW;
        }
      }else if(drifting<0){
        for(var a=0; a<Math.abs(drifting); a++){
          string+=LARROW;
        }
        string+="Drift";
      }else{
        string="Drift";
      }
      event.hardware.sendScreenA(string);
    }else{
      bpm+=event.delta;
      controlledModule.metro.bpm(bpm*4);
      event.hardware.sendScreenA("BPM:"+bpm+"");
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
    hardware.sendScreenA("Clock Generator");
    updateLeds(hardware);
  }
  var updateLeds = function(hardware) {
    hardware.draw([
      playHeadBmp,
      playHeadBmp | microStepsBmp,
      playHeadBmp | microStepsBmp
    ]);
  }
}