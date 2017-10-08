"use strict";
var EventMessage=require('../../datatypes/eventMessage.js');
/**
definition of a monoSequencer interactor for the x16basic controller hardware
*/
module.exports=function(environment){
  //singleton section
  var myInteractorBase=environment.interactionMan.interfaces.x16basic.interactorBase;
  if(!myInteractorBase){
    throw "there is not x16Basic entryInteractor";
  }else{
  }
  //instance section
  this.Instance=function(controlledModule){
    var stepsBmp=0x0000;
    var playHeadBmp=0x0000;
    function hasEvent(button){
      return 0!=(stepsBmp&(1<<button));
    }
    var engagedHardwares=new Set();
    controlledModule.on('step',function(event){
      for (let hardware of engagedHardwares) {
        playHeadBmp=1<<(event.step%16);
        updateLeds(hardware);
      }
    });
    myInteractorBase.call(this,controlledModule);
    this.compatibilityTags=["x16v0"];
    this.matrixButtonPressed=function(event){
      if(hasEvent(event.button)){
        controlledModule.clearStep(event.button);
      }else{
        controlledModule.addEvent(event.button,new EventMessage({value:[0x00,0x00,0x00]}));
      }
      updateHardware(event.hardware);
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
      stepsBmp=controlledModule.getBitmap16();
      hardware.draw([playHeadBmp,playHeadBmp|stepsBmp,stepsBmp]);
    }
  }
}