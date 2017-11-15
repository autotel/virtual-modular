"use strict";
var EventMessage=require('../../datatypes/EventMessage.js');
var EventPattern=require('../../datatypes/EventPattern.js');
var EventConfigurator=require('../x16utils/EventConfigurator.js');
var BlankConfigurator=require('../x16utils/BlankConfigurator.js');
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
    var muteBmp=0;
    configurators.event=new EventConfigurator(this,{values:[1,1,60,90]});
    configurators.record=new RecordMenu(this,{environment:environment,controlledModule:controlledModule});
    var utilAction=false;
    configurators.util=new BlankConfigurator(this,{
      name:"utils",
      engageFunction:function(thisConfigurator){
        // utilAction=false;
        // thisConfigurator.select(0,false);
      },disengageFunction:function(thisConfigurator){
        utilAction=false;
        thisConfigurator.select(0,false);
      },
      variables:{
        "none":{nameFunction:function(){return "mute, dup";}},
        "mute":{
          nameFunction:function(thisVar){
            return "mute preset";
          },
          selectFunction:function(thisVar){
            utilAction=function(event){

              var muted=controlledModule.togglePresetMute(event.button);
              //draw muted bmp
              (muted?muteBmp|=1<<event.button:muteBmp&=~(1<<event.button));
              updateLeds(event.hardware);
              // console.log("ut");
            };
          }
        },
        "duplicate":{
          nameFunction:function(thisVar){
            var spv="[]";
            if(thisVar.sourcePreset){
              spv=thisVar.sourcePreset.on.value;
            }
            return "apply:"+JSON.stringify(spv);
          },
          selectFunction:function(thisVar){
            if(selectedPresetNumber!==false){
              thisVar.sourcePreset=new EventPattern().fromEventMessage(controlledModule.kit[selectedPresetNumber].on);
              // event.hardware.sendScreenB("apply:"+JSON.stringify(spv));
              utilAction=function(event){
                controlledModule.kit[event.button]=thisVar.sourcePreset;
                // console.log(controlledModule.kit[event.button]);
                var spv="false";
                if(thisVar.sourcePreset){
                  spv=thisVar.sourcePreset.on.value;
                }
                selectedPresetNumber=event.button;
                event.hardware.sendScreenB(""+selectedPresetNumber+"<"+JSON.stringify(spv));
              };
            }
          },
          sourcePreset:false
        },
        "duplicate[1]++":{
          nameFunction:function(thisVar){
            var spv="[]";
            if(thisVar.sourcePreset){
              spv=thisVar.sourcePreset.on.value;
            }
            return "apply:"+JSON.stringify(spv);
          },
          selectFunction:function(thisVar){
            console.log("selec");
            if(selectedPresetNumber!==false){
              thisVar.sourcePreset=new EventPattern().fromEventMessage(controlledModule.kit[selectedPresetNumber].on);
              // event.hardware.sendScreenB("apply:"+JSON.stringify(spv));
              utilAction=function(event){
                controlledModule.kit[event.button]=new EventPattern().fromEventMessage(thisVar.sourcePreset.on);
                // console.log(controlledModule.kit[event.button]);
                var spv="false";
                if(thisVar.sourcePreset){
                  spv=thisVar.sourcePreset.on.value;
                  spv[1]++;
                }
                selectedPresetNumber=event.button;
                event.hardware.sendScreenB(""+selectedPresetNumber+"<"+JSON.stringify(spv));
              };
            }
          },
          sourcePreset:false
        },
        "duplicate[2]++":{
          nameFunction:function(thisVar){
            var spv="[]";
            if(thisVar.sourcePreset){
              spv=thisVar.sourcePreset.on.value;
            }
            return "apply:"+JSON.stringify(spv);
          },
          selectFunction:function(thisVar){
            console.log("selec");
            if(selectedPresetNumber!==false){
              thisVar.sourcePreset=new EventPattern().fromEventMessage(controlledModule.kit[selectedPresetNumber].on);
              // event.hardware.sendScreenB("apply:"+JSON.stringify(spv));
              utilAction=function(event){
                controlledModule.kit[event.button]=new EventPattern().fromEventMessage(thisVar.sourcePreset.on);
                // console.log(controlledModule.kit[event.button]);
                var spv="false";
                if(thisVar.sourcePreset){
                  spv=thisVar.sourcePreset.on.value;
                  spv[2]++;
                }
                selectedPresetNumber=event.button;
                event.hardware.sendScreenB(""+selectedPresetNumber+"<"+JSON.stringify(spv));
              };
            }
          },
          sourcePreset:false
        }
      }
    });
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
      highlightedBitmap|=1<<event.preset;
      passiveUpdateLeds();
      setTimeout(function(){
        var num=event.preset;
        highlightedBitmap&=~(1<<num);
          passiveUpdateLeds();
      },500);
    });
    controlledModule.on('kit changed',function(){
      updateAvailablePresetsBitmap();
    });
    /* velocity, which seems unachievable by x16's processor
    var eventsVelocity=new Set();
    this.matrixButtonVelocity=function(event){
      // console.log(event);
      //if I receive a velocity, I store it for a short time, to be appended to the matrixButtonPress that must follow right after
      var eventVelocity={button:event.data[0],value:event.data[1]};
      eventsVelocity.add(eventVelocity);
      eventVelocity.timeout=setTimeout(function(){
        var evid=eventVelocity;
        eventsVelocity.delete(evid);
        // console.log("del");
      },20);
    };*/
    this.matrixButtonPressed=function(event){
      var hardware=event.hardware;
      if(utilAction){
        utilAction(event);
        updateLeds(hardware);
      }else if(engagedConfigurator){
        engagedConfigurator.matrixButtonPressed(event);
        if(engagedConfigurator==configurators.util){
          updateLeds(hardware);
        }else{
          // engagedConfigurator.matrixButtonPressed(event);
        }
      }else{
        selectedPresetNumber=event.button;
        /*velocity
        if(eventsVelocity.size){
          eventsVelocity.forEach(function(el){
            // console.log(el);
            if(el.button==event.data[0]){
              controlledModule.uiTriggerOn(selectedPresetNumber,el.value);
            }
          });
        }else{*/
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
          engagedConfigurator.engage(event);
        }else if(event.button==2){
          lastEngagedConfigurator=engagedConfigurator=configurators.record;
          engagedConfigurator.engage(event);
        }else if(event.button==3){
          lastEngagedConfigurator=engagedConfigurator=configurators.util;
          engagedConfigurator.engage(event);
        }
      }
    };
    this.selectorButtonReleased=function(event){
      if(engagedConfigurator){
        engagedConfigurator.disengage(event);
        engagedConfigurator=false;
        updateHardware(event.hardware);
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
        if(lastEngagedConfigurator){
          lastEngagedConfigurator.encoderScrolled(event);
          if(lastEngagedConfigurator==configurators.event){
            controlledModule.kit[selectedPresetNumber]=configurators.event.getEventPattern();
            updateAvailablePresetsBitmap ();
          }
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
    function passiveUpdateLeds(){
      if(!engagedConfigurator)
      for (let hardware of engagedHardwares) {
        updateLeds(hardware);
      }
    }
    var updateLeds=function(hardware){
      var selectedPresetBitmap=1<<selectedPresetNumber;
      hardware.draw([
        highlightedBitmap | selectedPresetBitmap,
        (highlightedBitmap | selectedPresetBitmap | availablePresetsBitmap) ^ muteBmp,
                            selectedPresetBitmap | availablePresetsBitmap
      ]);
    }
  }
}