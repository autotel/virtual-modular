'use strict';
var onHandlers=require('onhandlers');
var EventMessage=require('../datatypes/EventMessage');
var headers = EventMessage.headers;

module.exports=function(properties,environment){
  onHandlers.call(this);
  var self=this;
  var outputs=this.outputs=new Set();
  var inputs=this.inputs=new Set();
  var recordOutputs=this.recordOutputs=new Set();
  var recordInputs=this.recordInputs=new Set();
  this.baseName="base";
  this.name="base";
  this.isModuleInstance=true;
  this.mute=false;
  this.interfaces={};
  this._instancedInterfaces={};
  //patching capabilities
  this.toggleOutput=function(what){
    var ret=outputs.has(what);
    if(ret){
      self.removeOutput(what);
    }else{
      self.addOutput(what);
    }
    return outputs.has(what);
  }

  this.addOutput=function(what){
    if(what){
      if(what===self){
        self.handle('+!connection',{origin:self, destination:what});
        console.error("can't patch a module to itself!");
      }else{
        if(what.isModuleInstance){
          console.log(self.name+"--->"+what.name);
          outputs.add(what);
          what.inputs.add(self);
          self.handle('+connection',{origin:self,destination:what});
        }else{
          // console.error(what);
          self.handle('+!connection',{origin:self, destination:what});
          throw ["Forbidden output: you tried to connect "+self.name+" to a "+what,what];
        }
      }
    }else{
      throw "Forbidden output: Attempted to connect "+self.name+" to "+what;
    }
  }
  this.removeOutput=function(what){
    var rpt=outputs.delete(what);
    what.inputs.delete(self);

    console.log(self.name+"-"+(rpt?"X":" ")+"->"+what.name);
    self.handle('-connection',{origin:self,destination:what});

  }
  this.addInput=function(what){
    try{
      what.addOutput(self);
    }catch(e){
      console.error("could not add input");
      console.log(e);
    }
  }

  this.enqueue=setImmediate;
  this.getOutputs=function(){
    return Array.from(outputs);
  }
  this.getInputs=function(){
    return Array.from(input);
  }
  this.output=function(eventMessage,overrideMute){
    if((!self.mute)||overrideMute){
      //outputs don't get executed right away, this avoids a crash in case there is a patching loop
      self.enqueue(function(){
        outputs.forEach(function(tModule){
          // console.log(eventMessage.value);
          tModule.messageReceived({eventMessage:eventMessage.clone(),origin:self});
          self.handle('>message',{origin:self,destination:tModule,val:eventMessage});
          // console.log("handle>",tModule.name);
        })
      });
    }
  }
  this.messageReceived=function(evt){
  }
  this.recordingReceived=function(evt){}
  this.removeInput=function(what){
    what.removeOutput(self)
  }

  /**
  Record patching capabilities (it is a layer of abstraction over normal output). recOutput=normalOutput+recording header
  A message to be recorded is an ordinary message, with 0xAA prepended. This means that modules with the ability to record incoming events, should take a special reception action when such is the header. Modules which do not have recording capabilities should discard these events.
  There is a parallel patcing of recording outputs, this is an interface nuance to allow easier management of recording events from all other events. in this way, it can still be implemented in modular hardware.

  */

  this.toggleRecordOutput=function(what){
    var ret=recordOutputs.has(what);
    if(ret){
      self.removeRecordOutput(what);
    }else{
      self.addRecordOutput(what);
    }
    return recordOutputs.has(what);
  }

  var recordStartedEm=new EventMessage({value:[headers.recordStatus,1,0,0]});
  var recordEndedEm=new EventMessage({value:[headers.recordStatus,0,0,0]});

  this.addRecordOutput=function(what){
    if(what){
      if(what.isModuleInstance){
        self.handle('+recopt',{origin:self,data:what});
        console.log(self.name+" rec> "+what.name);
        recordOutputs.add(what);
        what.recordInputs.add(self);
        self.addInput(what);
        self.enqueue(function(){
          what.recordingReceived({eventMessage:recordStartedEm,origin:self});
        });

      }else{
        // console.error(what);
        throw ["Forbidden output: you tried to connect "+self.name+" to a "+what,what];
        self.handle('fail + recopt',{origin:self,data:what});
      }
    }else{
      throw "Forbidden output: Attempted to connect "+self.name+" to "+what;
    }
  }
  this.removeRecordOutput=function(what){
    var rpt=recordOutputs.delete(what);
    what.recordInputs.delete(self);

    self.enqueue(function(){
      what.recordingReceived({eventMessage:recordEndedEm,origin:self});
    });
    console.log(self.name+" r"+(rpt?"X":" ")+"c> "+what.name);
    self.handle('-recopt',{origin:self,data:what});
  }
  this.addRecordInput=function(what){
    try{
      what.addRecordOutput(self);
    }catch(e){
      console.error("could not add input");
      console.log(e);
    }
  }
  this.recordOutput=function(eventMessage){
    // console.log("RECO");

    recordOutputs.forEach(function(tModule){
      // console.log("RECO ",eventMessage.value,">",tModule.name);

      var recordEventMessage=eventMessage.clone();
      recordEventMessage.value.unshift(headers.record);
      // console.log(recordEventMessage.value);
      tModule.recordingReceived({eventMessage:recordEventMessage,origin:self});
    });
  }
  // this.recordmessageReceived=function(evt){
  //   // console.log(evt);
  // }
  this.remove=function(){
    for(let output of outputs){
      self.removeOutput(output);
    }
    for(let recoutput of recordOutputs){
      self.removeRecordOutput(recoutput);
    }
    self.messageReceived=function(evt){
      console.log("deleted module",evt);
      if(evt.origin){
        self.removeInput(evt.origin);
        evt.origin.removeOutput(self);
        evt.origin.removeRecordOutput(self);
      }
    }
    self.handle('-module',{origin:self});
    if(self.onRemove){
      return self.onRemove();
    }
    return true;
  }
  self.handle('+module',{origin:self});
}
