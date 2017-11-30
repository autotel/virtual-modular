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
  configurators.event=new EventConfigurator(this,{baseEvent:controlledModule.baseEventMessage});
  var visualizer=new DataVisualizer(controlledModule);
  var stepsBmp=0;
  var engagedHardwares=new Set();
  var self=this;
  var refreshInterval=false;
  parentInteractor.on('interaction',function(event){
    if (engagedHardwares.has(event.hardware)){
      if(typeof self[event.type]==='function'){
        console.log("sequence view, event "+event.type);
        self[event.type](event);
      }else{
        console.log("undlandled interaction");
      }
    }
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
      if(event.data[0]==1){
        engagedConfigurator=configurators.event;
        eachEngagedHardware(function(hardware){
          configurators.event.engage({hardware:hardware});
        });
      }
    }
  };
  this.selectorButtonReleased=function(event){
    var hardware=event.hardware;
    if(event.data[0]==1){
      if(engagedConfigurator==configurators.event){
        lastEngagedConfigurator=engagedConfigurator;
        engagedConfigurator=false;
        eachEngagedHardware(function(hardware){
          configurators.event.disengage({hardware:hardware});
        });
      }
    }
  };
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
    engagedHardwares.add(event.hardware);
    updateHardware(event.hardware);
    refreshInterval=setInterval(function(){
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
    var eventsBmp=visualizer.eventsBitmap;
    var headerBmp=1<<((controlledModule.clock.step/visualizer.eventsPerSquare.value)+visualizer.timeRange.start[0]);
    //TODO: this function is taking way too much time
    // controlledModule.eachMemoryEvent(function(timeIndex,eventIndex){
    //   console.log(timeIndex);
    //   eventsBmp|=1<<(timeIndex[0]/2);
    // });
    hardware.draw([headerBmp,headerBmp|eventsBmp,eventsBmp]);
    // hardware.draw([selectedTapeBitmap,selectedTapeBitmap|tapesBitmap,selectedTapeBitmap|tapesBitmap]);
  }
}