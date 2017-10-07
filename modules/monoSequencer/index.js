'use strict';
var moduleBase=require('../moduleBase');
var uix16Control=require('./x16basic');

module.exports=(function(environment){
  //register the sequencer and it's compatible controllers

  environment.interactionMan.registerInteractor(uix16Control);

  this.create=function(){
    moduleBase.call(this);
    this.baseName="monosequencer";

    var myInteractor=new uix16Control.Instance(this);

    var patMem={};
    this.addEvent=function(step,event){
      patMem[step]=event;
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
});