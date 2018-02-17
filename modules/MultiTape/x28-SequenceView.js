"use strict";
var EventMessage=require('../../datatypes/EventMessage.js');
var TimeIndex=require('../../datatypes/TimeIndex');

var EventConfigurator=require('../x16utils/EventConfigurator.js');
var TapeCanvas=require('./TapeCanvas.js');
/**
definition of a monoSequencer interactor for the x16basic controller hardware
*/
module.exports=function(environment,parentInteractor){
  var controlledModule=parentInteractor.controlledModule;
  var configurators={};
  var engagedConfigurator=false;
  var lastEngagedConfigurator=false;
  configurators.event=new EventConfigurator(this,{baseEvent:controlledModule.baseEventMessage});
  var tapeCanvas=new TapeCanvas(controlledModule);
  var stepsBmp=0;
  var engagedHardwares=this.engagedHardwares=new Set();
  var self=this;
  var refreshInterval=false;
  var needUpdateSequence=false;
  var currentTape=false;

  var currentlySelectedEvents=false;

  var momentaryBitmap=false;
  var myColor=controlledModule.color;
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
      var buttonEvents=tapeCanvas.sequenceButtonCall(event.button,function(currentEvents,timeIndex){
        if(event.tied){
          console.log("TIED");
          if(currentlySelectedEvents){
            console.log("DUR",timeIndex);
            //dummy duration, should actually be timeIndex-currentEvent.start
            //but currentEvent.start donesnt exist
            //adn if result is negative, the start of event is shifted
            currentlySelectedEvents[0].duration=timeIndex;
            // TimeIndex.add(currentlySelectedEvents[0].start,timeIndex);
          }
        }else{
          if(currentEvents){
            currentTape.clearStep(timeIndex);
            currentlySelectedEvents=currentEvents;
          }else{
            var newEvent=currentTape.addEvent(timeIndex,configurators.event.getEventMessage());
            newEvent.duration=[2,0];
            currentlySelectedEvents=[newEvent];
          }
        }

      });
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
      tapeCanvas.pageRight();
    }else{
      momentaryBitmap=0b0000001000010010;
      tapeCanvas.pageRight();
    }
  }
  this.bottomButtonReleased=function(event){
    // console.log(event);
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

    currentTape=controlledModule.getCurrentTape();
    tapeCanvas.setTape(currentTape);
    engagedHardwares.add(event.hardware);
    updateHardware(event.hardware);
    refreshInterval=setInterval(function(){
      if(needUpdateSequence){
        needUpdateSequence=false;
        tapeCanvas.updateBitmap();
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
    hardware.sendScreenA(controlledModule.name.substring(0,5)+">sequence");
  }
  var updateLeds=function(hardware){
    if(momentaryBitmap){
      // hardware.draw([momentaryBitmap,0,0]);
      hardware.drawColor(momentaryBitmap,myColor,false);
    }else{
      var eventsBmp=tapeCanvas.eventsBitmap;
      var headerBmp=1<<((controlledModule.clock.step/tapeCanvas.stepsPerButton.value)+tapeCanvas.timeRange.start[0]);
      //TODO: this function is taking way too much time
      // controlledModule.eachMemoryEvent(function(timeIndex,eventIndex){
      //   console.log(timeIndex);
      //   eventsBmp|=1<<(timeIndex[0]/2);
      // });
      hardware.drawColor(eventsBmp,myColor,false);
      hardware.drawColor(headerBmp,[255,255,255]);

      // hardware.draw([selectedTapeBitmap,selectedTapeBitmap|tapesBitmap,selectedTapeBitmap|tapesBitmap]);
    }
  }
}
/**/