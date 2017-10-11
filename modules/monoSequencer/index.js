'use strict';
var EventMessage=require('../../datatypes/EventMessage.js');
var moduleInstanceBase=require('../moduleInstanceBase');
var uix16Control=require('./x16basic');
var clockSpec=require('../standards/clock.js');
/**
@constructor ModuleSingleton
singleton, only one per run of the program
every module needs to run at the beginning of the runtime to register it's interactor in the interactionManager
*/

module.exports=function(environment){return new (function(){
  var interactorSingleton=this.InteractorSingleton=new uix16Control(environment);
  // environment.interactionMan.registerModuleInteractor(uix16Control);
  var testcount=0;
  var testGetName=function(){
    this.name=this.baseName+" "+testcount;
    testcount++;
  }
  /**
  @constructor
  the instance of the of the module, ment to be instantiated multiple times.
  require to moduleBase.call
  */
  this.Instance=function(properties){
    var noteOnTracker=new Set();
    var thisInstance=this;
    moduleInstanceBase.call(this);
    this.baseName="monoSequencer";
    testGetName.call(this);
    this.step={value:0}
    var step=this.step;
    var myInteractor=new interactorSingleton.Instance(this);
    this.interactor=myInteractor;
    this.interactor.name=this.name;
    var patMem={};
    this.addEvent=function(step,event){
      patMem[step]=event;
      //console.log(patMem);
    }
    this.eventReceived=function(evt){
      if(evt.EventMessage.value[0]==clockSpec[0].incrementalTick&&(evt.EventMessage.value[2]%evt.EventMessage.value[1]==0)){
        for(var noff of noteOnTracker){
          thisInstance.output(noff);
          noteOnTracker.delete(noff);
        }
        //TODO: this is incorrect implementation of clock. The other data's shoudl be considered
        step.value++;
        step.value%=16;
        thisInstance.handle('step',{originator:evt,step:step.value});
        if(patMem[step.value]){
          //console.log("otp");
          thisInstance.output(patMem[step.value]);
          var noff=patMem[step.value].clone();
          noff.value[0]=2;
          noteOnTracker.add(noff);
        }else{
          //console.log("NS"+step.value);
        }
      }else{
        //console.log(evt.EventMessage);
      }
    }
    this.clearStep=function(step){
      delete patMem[step];
    }
    this.getBitmap16=function(){
      var ret=0;
      for(var a=0; a<16; a++){
        if(patMem[a]){
          ret|=1<<a;
        }
      }
      return ret;
    }
    this.delete=function(){
      for(var noff of noteOnTracker){
        thisInstance.output(noff);
        noteOnTracker.delete(noff);
      }
    }
  }
})};