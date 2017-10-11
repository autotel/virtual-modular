"use strict";
var EventMessage=require('../../datatypes/EventMessage.js');
/**
definition of a monoSequencer interactor for the x16basic controller hardware
*/
module.exports=function(environment){
  this.Instance=function(controlledModule){
    /**
    plan for the midi io module:
    you can select each one of the outputs, and then select a filter function that dictates what midi input events are routed to each output.
    -should midi input be mapped to their corresponfing EventMessages according to my internal standard?
    */
    var selectedOutputNumber=false;
    environment.interactionMan.interfaces.x16basic.interactorBase.call(this,controlledModule);
    var engagedHardwares=new Set();
    controlledModule.on('step',function(event){
      //this avoids the animations to interrupt any other module that wants to be engaged
      for (let hardware of engagedHardwares) {
        playHeadBmp=1<<(event.step%16);
        updateLeds(hardware);
      }
    });
    this.matrixButtonPressed=function(event){
      if(event.button<controlledModule.outputs.size)
      selectedOutputNumber=event.button;
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
      hardware.sendScreenA("Midi IO");
      if(controlledModule.outputs.size<=selectedOutputNumber) selectedOutputNumber=false;
      if(selectedOutputNumber!==false){
        hardware.sendScreenB(Array.from(controlledModule.outputs)[selectedOutputNumber].name);
      }else{
        hardware.sendScreenB("");
      }
      updateLeds(hardware);
    }
    var updateLeds=function(hardware){
      var bmp=~(0xFFFF<<controlledModule.outputs.size);
      var selectedBitmap=(selectedOutputNumber!==false? (1<<selectedOutputNumber) : 0);
      hardware.draw([selectedBitmap,bmp,bmp]);
    }
  }
}