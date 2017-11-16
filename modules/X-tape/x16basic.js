"use strict";
var EventMessage=require('../../datatypes/EventMessage.js');
/**
definition of a monoSequencer interactor for the x16basic controller hardware
*/
module.exports=function(environment){
  //singleton section
  this.Instance=function(controlledModule){
    //instance section
    //inherit the interactor properties from the hardware defined interactorBase
    environment.interactionMan.interfaces.x16basic.interactorBase.call(this,controlledModule);
    /* in case there are animations that are not triggered by a user input, this is an example:

    we create a set of the engagedHardwares (actually it is the superInteractors where this moduleInterface is engaged)

    var engagedHardwares=new Set();
    controlledModule.on('step',function(event){
      //this avoids the animations to interrupt any other module that wants to be engaged
      for (let hardware of engagedHardwares) {
        playHeadBmp=1<<(event.step%16);
        updateLeds(hardware);
      }
    });

    see the comment *1
    */
    //these functions are called upon events.
    this.matrixButtonPressed=function(event){
      //the hardware that originated the event is at the event.hardware
      //most of the time we want the feedback of an action to happen only on that hardware
      var hardware=event.hardware;
    };
    this.matrixButtonReleased=function(event){};
    this.matrixButtonHold=function(event){};
    this.selectorButtonPressed=function(event){};
    this.selectorButtonReleased=function(event){};
    this.encoderScrolled=function(event){};
    this.encoderPressed=function(event){};
    this.encoderReleased=function(event){};
    /*1
    upon engagement and disengagement we add the hardwares that got engaged to the setM in this way, when the animation is triggered, it only produces hardware changes in hardwares that are actually focused in this module (moduleInterface).
    */
    this.engage=function(event){
      engagedHardwares.add(event.hardware);
      updateHardware(event.hardware);
    };
    this.disengage=function(event){
      engagedHardwares.delete(event.hardware);
    }
    var updateHardware=function(hardware){
      hardware.sendScreenA("tape");
      updateLeds(hardware);
    }
    var updateLeds=function(hardware){
      hardware.draw([1,2,4]);
    }
  }
}