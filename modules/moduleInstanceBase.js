'use strict';
var onHandlers=require('onHandlers');
/**
events with header 0xAA are received as events to record.
*/
var RECORDINGHEADER = 0xAA;
module.exports=function(){
  onHandlers.call(this);
  var thisModule=this;
  var outputs=this.outputs=new Set();
  var recordOutputs=this.recordOutputs=new Set();
  this.baseName="base";
  this.name="base";
  this.isModuleInstance=true;
  this.mute=false;
  //patching capabilities
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
  this.removeOutput=function(what){
    var rpt=outputs.delete(what);
    console.log(thisModule.name+"-"+(rpt?"X":" ")+"->"+what.name);
  }
  this.addInput=function(what){
    try{
      what.addOutput(thisModule);
    }catch(e){
      console.error("could not add input");
      console.log(e);
    }
  }
  this.output=function(EventMessage){
    outputs.forEach(function(module){
      module.eventReceived({EventMessage:EventMessage.clone(),origin:thisModule});
    });
  }
  this.eventReceived=function(evt){
    // console.log(evt);
  }
  this.removeInput=function(what){
    what.removeOutput(thisModule)
  }

  /**
  Record patching capabilities (it is a layer of abstraction over normal output). recOutput=normalOutput+recording header
  A message to be recorded is an ordinary message, with 0xAA prepended. This means that modules with the ability to record incoming events, should take a special reception action when such is the header. Modules which do not have recording capabilities should discard these events.
  There is a parallel patcing of recording outputs, this is an interface nuance to allow easier management of recording events from all other events. in this way, it can still be implemented in modular hardware.

  */

  this.toggleRecordOutput=function(what){
    var ret=recordOutputs.has(what);
    if(ret){
      thisModule.removeRecordOutput(what);
    }else{
      thisModule.addRecordOutput(what);
    }
    return recordOutputs.has(what);
  }

  this.addRecordOutput=function(what){
    if(what){
      if(what.isModuleInstance){
        console.log(thisModule.name+"rec>"+what.name);
        recordOutputs.add(what);
      }else{
        // console.error(what);
        throw ["Forbidden output: you tried to connect "+thisModule.name+" to a "+what,what];
      }
    }else{
      throw "Forbidden output: Attempted to connect "+thisModule.name+" to "+what;
    }
  }
  this.removeRecordOutput=function(what){
    var rpt=recordOutputs.delete(what);
    console.log(thisModule.name+"r"+(rpt?"X":" ")+"c>"+what.name);
  }
  this.addRecordInput=function(what){
    try{
      what.addRecordOutput(thisModule);
    }catch(e){
      console.error("could not add input");
      console.log(e);
    }
  }
  this.recordOutput=function(eventMessage){
    recordOutputs.forEach(function(module){
      var recordEventMessage=eventMessage.clone();
      recordEventMessage.value.unshift(RECORDINGHEADER);
      module.eventReceived({EventMessage:recordEventMessage,origin:thisModule});
    });
  }
  // this.recordEventReceived=function(evt){
  //   // console.log(evt);
  // }
  this.remove=function(){
  }
}
