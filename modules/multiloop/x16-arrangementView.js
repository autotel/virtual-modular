"use strict";
var EventMessage=require('../../datatypes/EventMessage.js');
var EventConfigurator=require('../x16utils/EventConfigurator.js');
var DataVisualizer=require('./visualizer.js');
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
    myInteractorBase.call(this,controlledModule);
    var configurators={};
    configurators.event=new EventConfigurator(this,{baseEvent:controlledModule.baseEventMessage});
    var visualizer=new DataVisualizer(controlledModule);
    var selectedTape=0;
    var tapesAmount=1;
    var engagedConfigurator=false;
    var lastEngagedConfigurator=configurators.event;
    var stepsBmp=0;
    function hasEvent(button){
      return 0!=(controlledModule.getBitmap16()&(1<<button));
    }
    var engagedHardwares=new Set();
    setInterval(function(){
      if(!engagedConfigurator)
      for (let hardware of engagedHardwares) {
        updateLeds(hardware);
      }
    },1000/20);
    this.matrixButtonPressed=function(event){
      if(engagedConfigurator){
        engagedConfigurator.matrixButtonPressed(event);
      }else{
        // controlledModule.toggleStep(event.button);
        // updateHardware(event.hardware);
        if(event.button>=tapesAmount){
          var newTape=controlledModule.addNewTape();
          controlledModule.selectTape(newTape);
          selectedTape=controlledModule.getTapeNum(newTape);
          tapesAmount=controlledModule.tapeCount();
        }else{
          let thereIs=controlledModule.getNumTape(event.button);
          console.log(thereIs);
          if(thereIs){
            controlledModule.selectTape(thereIs);
            selectedTape=event.button;
          }
        }
        updateHardware(event.hardware);
      }
    };
    this.matrixButtonReleased=function(event){
      if(engagedConfigurator){
      }else{
        // controlledModule.clearStep(event.button);
        updateHardware(event.hardware);
      }
    };
    this.matrixButtonHold=function(event){};
    this.selectorButtonPressed=function(event){
      var hardware=event.hardware;
      if(engagedConfigurator){
        engagedConfigurator.selectorButtonPressed(event);
      }else{
        if(event.data[0]==1){
          engagedConfigurator=configurators.event;
          configurators.event.engage({hardware:hardware});
        }
      }
    };
    this.selectorButtonReleased=function(event){
      var hardware=event.hardware;
      if(event.data[0]==1){
        if(engagedConfigurator==configurators.event){
          lastEngagedConfigurator=engagedConfigurator;
          engagedConfigurator=false;
          configurators.event.disengage({hardware:hardware});
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
      updateScreen(hardware);
      updateLeds(hardware);
    }
    var updateScreen=function(hardware){
      hardware.sendScreenA(controlledModule.name);
    }
    var updateLeds=function(hardware){
      var eventsBmp=visualizer.eventsBitmap;
      var headerBmp=1<<(controlledModule.clock.step/visualizer.eventsPerSquare.value);
      var selectedTapeBitmap=1<<selectedTape;
      var tapesBitmap=~(0xffff<<tapesAmount);
      //TODO: this function is taking way too much time
      // controlledModule.eachMemoryEvent(function(timeIndex,eventIndex){
      //   console.log(timeIndex);
      //   eventsBmp|=1<<(timeIndex[0]/2);
      // });
      // hardware.draw([headerBmp,headerBmp|eventsBmp,eventsBmp]);
      hardware.draw([selectedTapeBitmap,selectedTapeBitmap|tapesBitmap,selectedTapeBitmap|tapesBitmap]);
    }
  }
}