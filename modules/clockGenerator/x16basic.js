"use strict";
var EventMessage=require('../../datatypes/EventMessage.js');
module.exports=function(environment){
  this.Instance=function(controlledModule){
    environment.interactionMan.interfaces.x16basic.interactorBase.call(this,controlledModule);
    var engagedHardwares=new Set();
    var playHeadBmp;
    var microStepsBmp;

    controlledModule.on('micro step',function(event){
      playHeadBmp=1<<controlledModule.step.value;
      microStepsBmp=~(0xffff<<controlledModule.step.microSteps);
    });
    setInterval(function(){
      for (let hardware of engagedHardwares) {
        updateLeds(hardware);
      }
    },20);
    this.matrixButtonPressed=function(event){
      var hardware=event.hardware;
    };
    this.matrixButtonReleased=function(event){};
    this.matrixButtonHold=function(event){};
    this.selectorButtonPressed=function(event){};
    this.selectorButtonReleased=function(event){};
    this.encoderScrolled=function(event){
      controlledModule.bpm.value+=event.data[1];
      event.hardware.sendScreenA("BPM"+controlledModule.bpm.value);
    };
    this.encoderPressed=function(event){};
    this.encoderReleased=function(event){};
    this.engage=function(event){
      engagedHardwares.add(event.hardware);
      updateHardware(event.hardware);
    };
    this.disengage=function(event){
      engagedHardwares.delete(event.hardware);
    }
    var updateHardware=function(hardware){
      hardware.sendScreenA("Clock Generator");
      updateLeds(hardware);
    }
    var updateLeds=function(hardware){
      hardware.draw([
        playHeadBmp,
        playHeadBmp|microStepsBmp,
        playHeadBmp|microStepsBmp
      ]);
    }
  }
}