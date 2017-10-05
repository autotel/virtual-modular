'use strict';
var moduleBase=require('../moduleBase');
var uix16Control=require('./x16-basic');
module.exports=function(environment){
  moduleBase.call(this);
  this.baseName="monosequencer";
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
  environment.interactionMan.addModule(new uix16Control(environment));
};