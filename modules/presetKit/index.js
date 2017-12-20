'use strict';
var CLOCKTICKHEADER = 0x00;
var TRIGGERONHEADER = 0x01;
var TRIGGEROFFHEADER = 0x02;
var RECORDINGHEADER = 0xAA;
var EventMessage=require('../../datatypes/EventMessage.js');
// var EventPattern=require('../../datatypes/EventPattern.js');
var NoteOnTracker=require('../moduleUtils/NoteOnTracker.js');
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
    this.color=[90,70 ,30];
    var self=this;
    //get my unique name
    name.call(this);

    this.recordingUi=true;

    if(properties.name) this.name=properties.name;
    var myInteractor=this.interactor=new interactorSingleton.Instance(this);
    this.interactor.name=this.name;

    this.x16Interface=myInteractor;
    var kit= this.kit={};

    if(properties.kit){
      for(var n in properties.kit){
        this.kit[n%16]=new EventMessage({value:properties.kit[n]});
      }
      self.handle('kit changed');
    }

    var noteOnTracker=new NoteOnTracker(this);

    this.uiTriggerOn=function(presetNumber,velo){
      // console.log("tr",kit[presetNumber]);
      // if(presetNumber!==undefined)
      var fbVelo=100;
      if(velo){
        // console.log("velo");
        fbVelo=velo;
      }
      if(kit[presetNumber]){
        // console.log(self.mute);
        if(self.mute) return;
        if(!kit[presetNumber].mute){
          noteOnTracker.add(kit[presetNumber],presetNumber);
          kit[presetNumber].value[3]=fbVelo;
          self.output(kit[presetNumber]);
          if(self.recordingUi){
            self.recordOutput(new EventMessage({value:[TRIGGERONHEADER,0,presetNumber,fbVelo]}));
          }
        }
      }
    }

    this.uiTriggerOff=function(presetNumber){
      // console.log("koff=",noteOnTracker[presetNumber]);
      noteOnTracker.ifNoteOff(presetNumber,function(noteOff){
        self.output(noteOff,true);
        if(self.recordingUi){
          self.recordOutput(new EventMessage({value:[TRIGGEROFFHEADER,0,presetNumber,100]}));
        }
      });
    }

    this.triggerOn=function(presetNumber,originalMessage){
      // console.log("ton",presetNumber,originalMessage);
      self.handle("extrigger",{preset:presetNumber});
      if(self.mute) return;
      presetNumber%=16;
      if(kit[presetNumber]){
        if(!kit[presetNumber].mute){
          var outputMessage=kit[presetNumber].clone().underImpose(originalMessage);
          noteOnTracker.add(kit[presetNumber],presetNumber);
          self.output(outputMessage);
        }
      }
    }

    this.triggerOff=function(presetNumber){
      presetNumber%=16;
      self.handle("extrigger",{preset:presetNumber});
      noteOnTracker.ifNoteOff(presetNumber,function(noteOff){
        self.output(noteOff,true);
      });
    }

    this.stepMicro=function(){}
    var recordHead=0;
    this.recordEvent=function(evM){
      self.handle('kit changed');
      kit[recordHead]=new EventMessage(evM);
      // console.log("rec",kit[recordHead]);
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
      var evM=event.eventMessage;
      // console.log(evM);
      self.handle('receive',event);
      if(evM.value[0]==CLOCKTICKHEADER){
        self.stepMicro(evM.value[1],evM.value[2]);
      }else if(evM.value[0]==TRIGGERONHEADER){
        //nton
        self.triggerOn(evM.value[2],evM);
      }else if(evM.value[0]==TRIGGEROFFHEADER){
        //ntoff
        self.triggerOff(evM.value[2]);
      }else if(evM.value[0]==RECORDINGHEADER){
        evM.value.shift();
        // console.log("rec",evm);
        this.recordEvent(evM);
      }
    }

  }
})};