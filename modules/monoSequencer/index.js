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
  /**
  @constructor
  the instance of the of the module, ment to be instantiated multiple times.
  require to moduleBase.call
  */
  this.Instance=function(){
    moduleInstanceBase.call(this);
    this.baseName="monosequencer";
    var myInteractor=new interactorSingleton.Instance(this);
    this.interactor=myInteractor;
    var patMem={};
    this.addEvent=function(step,event){
      patMem[step]=event;
      // console.log(patMem);
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