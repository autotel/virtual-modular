'use strict';
var onHandlers=require('onHandlers');

module.exports=function(){
  onHandlers.call(this);
  var thisModule=this;
  var outputs=this.outputs=new Set();
  this.baseName="base";
  this.addOutput=function(what){
    //TODO: check that output is actually a module
    outputs.add(what);
  }
  this.addInput=function(what){
    try{
      what.addOutput(thisModule);
    }catch(e){
      console.error("could not add input");
      console.log(e);
    }
  }
  this.removeOutput=function(what){
    outputs.delete(what);
  }
  this.removeInput=function(what){
    what.removeOutput(thisModule)
  }
  this.output=function(eventMessage){
    outputs.forEach(callbackFn,thisModule);
  }
}
