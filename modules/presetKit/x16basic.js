"use strict";
var EventMessage=require('../../datatypes/EventMessage.js');
var EventPattern=require('../../datatypes/EventPattern.js');
var EventConfigurator=require('../x16utils/EventConfigurator.js');
var RecordMenu=require('../x16utils/RecordMenu.js');
/**
definition of a presetkit interactor for the x16basic controller hardware
*/
module.exports=function(environment){
  this.Instance=function(controlledModule){
    // this.controlledModule=controlledModule;
    environment.interactionMan.interfaces.x16basic.interactorBase.call(this,controlledModule);
    var engagedHardwares=new Set();
    var thisInteractor=this;
    //configurators setup
    var engagedConfigurator=false;
    var configurators={};
    configurators.event=new EventConfigurator(this,{values:[1,1,60,90]});
    configurators.record=new RecordMenu(this,{environment:environment,controlledModule:controlledModule});

    var lastEngagedConfigurator=configurators.event;
    // configurators.one=new BlankConfigurator(this,{
    //   name:"T",
    //   values:{
    //   }
    // });
    var availablePresetsBitmap=0;
    var highlightedBitmap=0;
    var selectedPresetNumber=false;
    controlledModule.on('extrigger',function(event){
      if(!engagedConfigurator)
      for (let hardware of engagedHardwares) {
        highlightedBitmap|=1<<event.preset;
        updateLeds(hardware);
        setTimeout(function(){
          var num=event.preset;
          highlightedBitmap&=~(1<<num);
          if(engagedHardwares.has(hardware)){
            updateLeds(hardware);
          }
        });
      }
    });
    controlledModule.on('kit changed',function(){
      updateAvailablePresetsBitmap();
    });

    this.matrixButtonPressed=function(event){
      selectedPresetNumber=event.button;
      var hardware=event.hardware;
      if(engagedConfigurator){
        engagedConfigurator.matrixButtonPressed(event);
      }else{
        //idea:
        // if(controlledModule.combos[event.data[2]])
        controlledModule.uiTriggerOn(selectedPresetNumber);
        if(controlledModule.kit[event.button])
        if(lastEngagedConfigurator==configurators.event){
          // configurators.event.baseEvent=controlledModule.kit[selectedPresetNumber].on;
          configurators.event.setFromEventPattern(controlledModule.kit[selectedPresetNumber],hardware);
        }
        updateHardware(hardware);
      }
    };
    this.matrixButtonReleased=function(event){
      if(engagedConfigurator){
        engagedConfigurator.matrixButtonReleased(event);
      }else{
        controlledModule.uiTriggerOff(event.button);
      }
    };
    this.matrixButtonHold=function(event){
      if(engagedConfigurator){
        engagedConfigurator.matrixButtonHold(event);
      }else{
      }
    };
    this.selectorButtonPressed=function(event){
      if(engagedConfigurator){
        engagedConfigurator.selectorButtonPressed(event);
      }else{
        if(event.button==1){
          lastEngagedConfigurator=engagedConfigurator=configurators.event;
          configurators.event.engage(event);
        }else if(event.button==2){
          lastEngagedConfigurator=engagedConfigurator=configurators.record;
          configurators.record.engage(event);
        }
      }
    };
    this.selectorButtonReleased=function(event){
      if(engagedConfigurator){
        engagedConfigurator.selectorButtonReleased(event);
        if(event.button==1&&engagedConfigurator==configurators.event){
          engagedConfigurator.disengage(event);
          engagedConfigurator=false;
          updateHardware(event.hardware);
        }else if(event.button==2&&engagedConfigurator==configurators.record){
          engagedConfigurator.disengage(event);
          engagedConfigurator=false;
          updateHardware(event.hardware);
        }
      }else{
      }
    };
    var updateAvailablePresetsBitmap=function(){
      availablePresetsBitmap=0;
      for(var a in controlledModule.kit){
        availablePresetsBitmap|=1<<a;
      }
    }
    this.encoderScrolled=function(event){
      if(engagedConfigurator){
        engagedConfigurator.encoderScrolled(event);
      }else{
        if(lastEngagedConfigurator==configurators.event){
          lastEngagedConfigurator.encoderScrolled(event);
          controlledModule.kit[selectedPresetNumber]=configurators.event.getEventPattern();
          updateAvailablePresetsBitmap ();
        }
      }

      updateHardware(event.hardware);
    };
    this.encoderPressed=function(event){
      if(engagedConfigurator){
        engagedConfigurator.encoderPressed(event);
      }else{
      }
    };
    this.encoderReleased=function(event){
      if(engagedConfigurator){
        engagedConfigurator.encoderReleased(event);
      }else{
      }
    };
    this.engage=function(event){
      engagedHardwares.add(event.hardware);
      updateHardware(event.hardware);
    };
    this.disengage=function(event){
      engagedHardwares.delete(event.hardware);
    }
    var updateHardware=function(hardware){
      hardware.sendScreenA(thisInteractor.name);
      updateLeds(hardware);
    }
    var updateLeds=function(hardware){
      var selectedPresetBitmap=1<<selectedPresetNumber;
      hardware.draw([
        highlightedBitmap | selectedPresetBitmap,
        highlightedBitmap | selectedPresetBitmap | availablePresetsBitmap,
                            selectedPresetBitmap | availablePresetsBitmap
      ]);
    }
  }
}