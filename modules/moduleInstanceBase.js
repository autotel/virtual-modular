'use strict';
var onHandlers=require('onHandlers');

module.exports=function(){
  onHandlers.call(this);
  var thisModule=this;
  var outputs=this.outputs=new Set();
  this.baseName="base";
  this.name="base";
  this.isModuleInstance=true;

  this.toggleOutput=function(what){
    var ret=outputs.has(what);
    if(ret){
      thisModule.removeOutput(what);
    }else{
      thisModule.addOutput(what);
    }
    return outputs.has(what);
  }
  this.addOutput=function(what){
    if(what){
      if(what.isModuleInstance){
        console.log(thisModule.name+"--->"+what.name);
        outputs.add(what);
      }else{
        // console.error(what);
        throw ["Forbidden output: you tried to connect "+thisModule.name+" to a "+what,what];
      }
    }else{
      throw "Forbidden output: Attempted to connect "+thisModule.name+" to "+what;
    }
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
    var rpt=outputs.delete(what);
    console.log(thisModule.name+"-"+(rpt?"X":" ")+"->"+what.name);
  }
  this.removeInput=function(what){
    what.removeOutput(thisModule)
  }
  this.eventReceived=function(evt){
    // console.log(evt);
  }
  this.output=function(eventMessage){
    outputs.forEach(function(module){
      module.eventReceived({eventMessage:eventMessage.clone(),origin:thisModule});
    });
  }
  this.remove=function(){

  }
}
