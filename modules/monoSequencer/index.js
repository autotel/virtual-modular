'use strict';
var EventMessage=require('../../datatypes/eventMessage.js');
var moduleInstanceBase=require('../moduleInstanceBase');
var uix16Control=require('./x16basic');
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
    var thisInstance=this;
    moduleInstanceBase.call(this);
    this.baseName="monoSequencer";
    testGetName.call(this);
    this.step={value:0}
    var step=this.step;
    this.baseName="monosequencer";
    var myInteractor=new interactorSingleton.Instance(this);
    this.interactor=myInteractor;
    this.interactor.name=this.name;
    var patMem={};
    this.addEvent=function(step,event){
      patMem[step]=event;
      //console.log(patMem);
    }
    this.eventReceived=function(evt){
      if(evt.eventMessage.value[0]==0){
        //TODO: this is incorrect implementation of clock. The other data's shoudl be considered
        step.value++;
        step.value%=16;
        thisInstance.handle('step',{originator:evt,step:step.value});
        if(patMem[step.value]){
          //console.log("otp");
          thisInstance.output(patMem[step.value]);
        }else{
          //console.log("NS"+step.value);
        }
      }else{
        //console.log(evt.eventMessage);
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
    // console.log(".",myInteractor);
  }
})};