'use strict';
var CLOCKTICKHEADER = 0x00;
var TRIGGERONHEADER = 0x01;
var TRIGGEROFFHEADER = 0x02;
var RECORDINGHEADER = 0xAA;
var EventMessage=require('../../datatypes/EventMessage.js');
var EventPattern=require('../../datatypes/EventPattern.js');

var moduleInstanceBase=require('../moduleInstanceBase');
var uix16Control=require('./x16basic');

/**
@constructor ModuleSingleton
singleton, only one per run of the program
every module needs to run at the beginning of the runtime to register it's interactor in the interactionManager

 # module interpretation of eventMessages:
[header,A,presetNumber,optionalVelocity]
 * Header
  * 0: clock. Is not yet used
  * 1: trigger preset [presetNumber] on
  * 2: send note off for all the note on that have been triggered using the same [presetNumber]. Note it is not a sinonym of triggering a noteOff for the preset [presetNumber]: the preset may have been changed between the note on and note off. In this way we minimize the possibility of hanging notes.
  * 0xAA: store the following eventMessage in the next available preset, shift()ing the value of the eventMessage
 * A: ignored. If there were functions that use clock, this would indicate the micro-steps per step
 * presetNumber: indicates what presset to trigger, or preset to set off
*/
module.exports=function(environment){return new (function(){
  var interactorSingleton=this.InteractorSingleton=new uix16Control(environment);
  var instanced=0;
  var name=function(){
    this.name=this.baseName+" "+instanced;
    instanced++;
  }
  /**
  @constructor
  the instance of the of the module, ment to be instantiated multiple times.
  require to moduleBase.call
  */
  this.Instance=function(properties){
    moduleInstanceBase.call(this);
    this.baseName="preset kit";
    var thisInstance=this;
    //get my unique name
    name.call(this);

    this.recordingUi=true;

    if(properties.name) this.name=properties.name;
    var myInteractor=this.interactor=new interactorSingleton.Instance(this);
    this.interactor.name=this.name;

    var kit= this.kit={};

    if(properties.kit){
      for(var n in properties.kit){
        this.kit[n%16]=new EventPattern({on:{value:properties.kit[n]}});
      }
      thisInstance.handle('kit changed');
    }

    this.noteOnTracker={}

    this.uiTriggerOn=function(presetNumber,velo){
      // console.log("tr",kit[presetNumber]);
      // if(presetNumber!==undefined)
      var fbVelo=100;
      if(velo){
        // console.log("velo");
        fbVelo=velo;
      }
      if(kit[presetNumber]){
        if(!kit[presetNumber].mute){
          if(thisInstance.noteOnTracker[presetNumber]===undefined) thisInstance.noteOnTracker[presetNumber]=[];
          thisInstance.noteOnTracker[presetNumber].push( new EventPattern().fromEventMessage(kit[presetNumber].on) );
          kit[presetNumber].on.value[3]=fbVelo;
          thisInstance.output(kit[presetNumber].on);
          if(thisInstance.recordingUi){
            thisInstance.recordOutput(new EventMessage({value:[TRIGGERONHEADER,0,presetNumber,fbVelo]}));//(new EventMessage({value:[TRIGGERONHEADER,0,presetNumber,-1]}));
          }
        }
      }
    }

    this.uiTriggerOff=function(presetNumber){
      // console.log("koff=",thisInstance.noteOnTracker[presetNumber]);
      for(var a in thisInstance.noteOnTracker[presetNumber] ){
        if(thisInstance.noteOnTracker[presetNumber][a]){
          thisInstance.output(thisInstance.noteOnTracker[presetNumber][a].off);
          if(thisInstance.recordingUi){
            thisInstance.recordOutput(new EventMessage({value:[TRIGGEROFFHEADER,0,presetNumber,100]}));
          }
        }
      }
      // for(var a in thisInstance.noteOnTracker[presetNumber] ){
        delete thisInstance.noteOnTracker[presetNumber];
      // }
    }

    this.triggerOn=function(presetNumber,originalMessage){
      presetNumber%=16;
      thisInstance.handle("extrigger",{preset:presetNumber});
      if(kit[presetNumber]){
        var outputMessage=kit[presetNumber].on.clone().underImpose(originalMessage);
        if(thisInstance.noteOnTracker[presetNumber]===undefined)thisInstance.noteOnTracker[presetNumber]=[];
        thisInstance.noteOnTracker[presetNumber].push( new EventPattern().fromEventMessage(outputMessage) );
        thisInstance.output(outputMessage);
      }
    }

    this.triggerOff=function(presetNumber){
      presetNumber%=16;
      // console.log("ntoff");
      thisInstance.handle("extrigger",{preset:presetNumber});
      for(var a in thisInstance.noteOnTracker[presetNumber] ){
        if(thisInstance.noteOnTracker[presetNumber][a])
        thisInstance.output(thisInstance.noteOnTracker[presetNumber][a].off);
      }
      for(var a in thisInstance.noteOnTracker[presetNumber] ){
        delete thisInstance.noteOnTracker[presetNumber][a];
      }
    }

    this.stepMicro=function(){}
    var recordHead=0;
    this.recordEvent=function(evM){
      thisInstance.handle('kit changed');
      kit[recordHead]=new EventPattern().fromEventMessage(evM);
      console.log("rec",kit[recordHead]);
      recordHead++;
      recordHead%=16;
    }
    this.togglePresetMute=function(presetNumber){
      if(kit[presetNumber]){
        kit[presetNumber].mute=!kit[presetNumber].mute===true;
        return kit[presetNumber].mute;
      }else{
        return false;
      }
    }
    this.eventReceived=function(event){
      var evM=event.EventMessage;
      // console.log(evM);
      thisInstance.handle('receive',event);
      if(evM.value[0]==CLOCKTICKHEADER){
        thisInstance.stepMicro(evM.value[1],evM.value[2]);
      }else if(evM.value[0]==TRIGGERONHEADER){
        //nton
        thisInstance.triggerOn(evM.value[2],evM);
      }else if(evM.value[0]==TRIGGEROFFHEADER){
        //ntoff
        thisInstance.triggerOff(evM.value[2]);
      }else if(evM.value[0]==RECORDINGHEADER){
        evM.value.shift();
        // console.log("rec",evm);
        this.recordEvent(evM);
      }
    }

  }
})};