'use strict';
var EventMessage=require('../../datatypes/EventMessage.js');
var EventPattern=require('../../datatypes/EventPattern.js');

var moduleInstanceBase=require('../moduleInstanceBase');
var uix16Control=require('./x16basic');
/**
@constructor ModuleSingleton
singleton, only one per run of the program
every module needs to run at the beginning of the runtime to register it's interactor in the interactionManager
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
    var myInteractor=this.interactor=new interactorSingleton.Instance(this);
    this.interactor.name=this.name;

    this.kit={};

    this.noteOnTracker={}

    this.uiTriggerOn=function(presetNumber){
      // console.log("tr",thisInstance.kit[presetNumber]);
      if(thisInstance.kit[presetNumber]){
        if(thisInstance.noteOnTracker[presetNumber]===undefined)thisInstance.noteOnTracker[presetNumber]=[];
        thisInstance.noteOnTracker[presetNumber].push( new EventPattern().from(thisInstance.kit[presetNumber].on) );
        thisInstance.output(thisInstance.kit[presetNumber].on);
      }
    }

    this.uiTriggerOff=function(presetNumber){
      for(var a in thisInstance.noteOnTracker[presetNumber] ){
        if(thisInstance.noteOnTracker[presetNumber][a])
        thisInstance.output(thisInstance.noteOnTracker[presetNumber][a].off);
      }
      for(var a in thisInstance.noteOnTracker[presetNumber] ){
        delete thisInstance.noteOnTracker[presetNumber][a];
      }
    }

    this.triggerOn=function(presetNumber,optionalNote,optionalVelocity){
      thisInstance.handle("extrigger",{preset:presetNumber});
      if(thisInstance.kit[presetNumber]){
        if(thisInstance.noteOnTracker[presetNumber]===undefined)thisInstance.noteOnTracker[presetNumber]=[];
        thisInstance.noteOnTracker[presetNumber].push( new EventPattern().from(thisInstance.kit[presetNumber].on) );
        thisInstance.output(thisInstance.kit[presetNumber].on);
      }
    }

    this.triggerOff=function(presetNumber,optionalNote,optionalVelocity){
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

    this.eventReceived=function(event){
      var evM=event.EventMessage;
      thisInstance.handle('receive',event);
      if(evM.value[0]==0){
        thisInstance.stepMicro(evM.value[1],evM.value[2]);
      }else if(evM.value[0]==1){
        //nton
        thisInstance.triggerNoteOn(evM.value[1],evM.value[2],evM.value[3]);
      }else if(evM.value[0]==2){
        //ntoff
        thisInstance.triggerNoteOff(evM.value[1],evM.value[2],evM.value[3]);
      }
    }

  }
})};