"use strict";
var EventMessage=require('../../datatypes/eventMessage.js');
module.exports=function(environment){
  this.Instance=function(controlledModule){
    environment.interactionMan.interfaces.x16basic.interactorBase.call(this,controlledModule);
    var engagedHardwares=new Set();
    controlledModule.on('step',function(event){
      for (let hardware of engagedHardwares) {
        playHeadBmp=1<<(event.step%16);
        updateLeds(hardware);
      }
    });
    this.matrixButtonPressed=function(event){
      var hardware=event.hardware;
    };
    this.matrixButtonReleased=function(event){};
    this.matrixButtonHold=function(event){};
    this.selectorButtonPressed=function(event){};
    this.selectorButtonReleased=function(event){};
    this.encoderScrolled=function(event){};
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
      hardware.sendScreenA("monosequencer");
      updateLeds(hardware);
    }
    var updateLeds=function(hardware){
      hardware.draw([1,2,4]);
    }
  }
}