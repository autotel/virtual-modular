"use strict";
var EventMessage=require('../../datatypes/EventMessage.js');
var EventConfigurator=require('../x16utils/EventConfigurator.js');
var DataVisualizer=require('./visualizer.js');
/**
definition of a monoSequencer interactor for the x16basic controller hardware
*/
module.exports=function(environment,parentInteractor){
  var controlledModule=parentInteractor.controlledModule;
  var configurators={};
  var engagedConfigurator=false;
  var lastEngagedConfigurator=false;
  configurators.event=new EventConfigurator(this,{baseEvent:controlledModule.baseEventMessage});
  var visualizer=new DataVisualizer(controlledModule);
  var stepsBmp=0;
  var engagedHardwares=this.engagedHardwares=new Set();
  var self=this;
  var refreshInterval=false;
  var needUpdateSequence=false;

  var momentaryBitmap=false;

  parentInteractor.on('interaction',function(event){
    if (engagedHardwares.has(event.hardware)){
      if(typeof self[event.type]==='function'){
        // console.log("sequence view, event "+event.type);
        self[event.type](event);
      }else{
        console.log("unhandled interaction",event);
      }
    }
  });
  controlledModule.on('event recorded',function(){
    needUpdateSequence=true;
  });

  function eachEngagedHardware(cb){
    for(let hardware of engagedHardwares){
      cb(hardware);
    }
  }

  this.matrixButtonPressed=function(event){
    if(engagedConfigurator){
      engagedConfigurator.matrixButtonPressed(event);
    }else{
      eachEngagedHardware(updateHardware);
    }
  };
  this.matrixButtonReleased=function(event){
    if(engagedConfigurator){
    }else{
      eachEngagedHardware(updateHardware);
    }
  };

  this.selectorButtonPressed=function(event){
    if(engagedConfigurator){
      engagedConfigurator.selectorButtonPressed(event);
    }else{
      if(event.button==1){
        lastEngagedConfigurator=engagedConfigurator=configurators.event;
        engagedConfigurator.engage(event);
      }
    }
  };
  this.selectorButtonReleased=function(event){
    var hardware=event.hardware;
    if(engagedConfigurator){
      engagedConfigurator.disengage(event);
      engagedConfigurator=false;
    }
  };
  this.bottomButtonPressed=function(event){
    if(event.button=="right"){
      momentaryBitmap=0b0000010010000100;
      visualizer.pageRight();
    }else{
      momentaryBitmap=0b0000001000010010;
      visualizer.pageRight();
    }
  }
  this.bottomButtonReleased=function(event){
    console.log(event);
    momentaryBitmap=false;
  }

  this.encoderScrolled=function(event){
    if(engagedConfigurator){
      engagedConfigurator.encoderScrolled(event);
    }else{
      if(lastEngagedConfigurator){
        lastEngagedConfigurator.encoderScrolled(event)
      }
    }
  };
  this.engage=function(event){

    visualizer.setTape(controlledModule.getCurrentTape());

    engagedHardwares.add(event.hardware);
    updateHardware(event.hardware);
    refreshInterval=setInterval(function(){
      if(needUpdateSequence){
        needUpdateSequence=false;
        visualizer.updateBitmap();
      }
      if(!engagedConfigurator){
        eachEngagedHardware(updateLeds);
      }
    },1000/20);
  };
  this.disengage=function(event){
    engagedHardwares.delete(event.hardware);
    clearInterval(refreshInterval);
  }
  var updateHardware=function(hardware){
    updateScreen(hardware);
    updateLeds(hardware);
  }
  var updateScreen=function(hardware){
    hardware.sendScreenA(controlledModule.name.substring(0,5)+"> sequence");
  }
  var updateLeds=function(hardware){
    if(momentaryBitmap){
      hardware.draw([momentaryBitmap,0,0]);
    }else{
      var eventsBmp=visualizer.eventsBitmap;
      var headerBmp=1<<((controlledModule.clock.step/visualizer.stepsPerButton.value)+visualizer.timeRange.start[0]);
      //TODO: this function is taking way too much time
      // controlledModule.eachMemoryEvent(function(timeIndex,eventIndex){
      //   console.log(timeIndex);
      //   eventsBmp|=1<<(timeIndex[0]/2);
      // });
      hardware.draw([headerBmp,headerBmp|eventsBmp,eventsBmp]);
      // hardware.draw([selectedTapeBitmap,selectedTapeBitmap|tapesBitmap,selectedTapeBitmap|tapesBitmap]);
    }
  }
}
/**/