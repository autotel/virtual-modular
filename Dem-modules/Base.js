var onHandlers=require('onhandlers');

module.exports=function(properties,environment){
  if(!environment) throw new Error("environment is required when extending module base");
  onHandlers.call(this);
  const EventMessage=environment.datatypes.requires(["EventMessage"])[0];
  const headers = EventMessage.headers;
  this.isModuleInstance=true;
  var outputs=this.outputs=new Set();
  var inputs=this.inputs=new Set();
  var recordOutputs=this.recordOutputs=new Set();
  var recordInputs=this.recordInputs=new Set();
  this.interactors={};
  this.baseName="base";
  this.mute=false;
  //patching capabilities
  this.toggleOutput=function(what){
    var ret=outputs.has(what);
    if(ret){
      this.removeOutput(what);
    }else{
      this.addOutput(what);
    }
    return outputs.has(what);
  }

  this.addOutput=function(what){
    if(what){
      if(what===this){
        this.handle('+!connection',{origin:this, destination:what});
        console.error("can't patch a module to itself!");
      }else{
        if(what.isModuleInstance){
          console.log(this.name+"--->"+what.name);
          outputs.add(what);
          what.inputs.add(this);
          this.handle('+connection',{origin:this,destination:what});
        }else{
          // console.error(what);
          this.handle('+!connection',{origin:this, destination:what});
          throw ["Forbidden output: you tried to connect "+this.name+" to a "+what,what];
        }
      }
    }else{
      throw "Forbidden output: Attempted to connect "+this.name+" to "+what;
    }
  }
  this.removeOutput=function(what){
    var rpt=outputs.delete(what);
    what.inputs.delete(this);

    console.log(this.name+"-"+(rpt?"X":" ")+"->"+what.name);
    this.handle('-connection',{origin:this,destination:what});

  }
  this.addInput=function(what){
    try{
      what.addOutput(this);
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
    return Array.from(inputs);
  }
  let self=this;
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
    what.removeOutput(this)
  }

  /**
  Record patching capabilities (it is a layer of abstraction over normal output). recOutput=normalOutput+recording header
  A message to be recorded is an ordinary message, with 0xAA prepended. This means that modules with the ability to record incoming events, should take a special reception action when such is the header. Modules which do not have recording capabilities should discard these events.
  There is a parallel patcing of recording outputs, this is an interface nuance to allow easier management of recording events from all other events. in this way, it can still be implemented in modular hardware.

  */

  this.toggleRecordOutput=function(what){
    var ret=recordOutputs.has(what);
    if(ret){
      this.removeRecordOutput(what);
    }else{
      this.addRecordOutput(what);
    }
    return recordOutputs.has(what);
  }

  var recordStartedEm=new EventMessage({value:[headers.recordStatus,1,0,0]});
  var recordEndedEm=new EventMessage({value:[headers.recordStatus,0,0,0]});

  this.addRecordOutput=function(what){
    if(what){
      if(what.isModuleInstance){
        this.handle('+recopt',{origin:this,data:what});
        console.log(this.name+" rec> "+what.name);
        recordOutputs.add(what);
        what.recordInputs.add(this);
        this.addInput(what);
        this.enqueue(function(){
          what.recordingReceived({eventMessage:recordStartedEm,origin:this});
        });

      }else{
        // console.error(what);
        this.handle('fail + recopt',{origin:this,data:what});
        throw ["Forbidden output: you tried to connect "+this.name+" to a "+what,what];
      }
    }else{
      throw "Forbidden output: Attempted to connect "+this.name+" to "+what;
    }
  }
  this.removeRecordOutput=function(what){
    var rpt=recordOutputs.delete(what);
    what.recordInputs.delete(this);

    this.enqueue(function(){
      what.recordingReceived({eventMessage:recordEndedEm,origin:this});
    });
    console.log(this.name+" r"+(rpt?"X":" ")+"c> "+what.name);
    this.handle('-recopt',{origin:this,data:what});
  }
  this.addRecordInput=function(what){
    try{
      what.addRecordOutput(this);
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
      tModule.recordingReceived({eventMessage:recordEventMessage,origin:this});
    });
  }
  // this.recordmessageReceived=function(evt){
  //   // console.log(evt);
  // }
  this.remove=function(){
    for(let output of outputs){
      this.removeOutput(output);
    }
    for(let recoutput of recordOutputs){
      this.removeRecordOutput(recoutput);
    }
    this.messageReceived=function(evt){
      console.log("deleted module",evt);
      if(evt.origin){
        this.removeInput(evt.origin);
        evt.origin.removeOutput(this);
        evt.origin.removeRecordOutput(this);
      }
    }
    this.handle('-module',{origin:this});
    if(this.onRemove){
      return this.onRemove();
    }
    return true;
  }
  
  if(properties.autoconnect){
    environment.on('+module', function(evt) {
      var module = evt.module;
      console.log("looking if \""+properties.autoconnect+"\"",module[properties.autoconnect]);
      if (module[properties.autoconnect]) {
        self.addOutput(module);
      }
    });
  }

  this.handle('+module',{origin:this});
  let addition={}
  
  // console.log("MDIS",this.constructor.name);
  if(!this.constructor.instances)this.constructor.instances=0;
  if(properties.name)this.name=properties.name;
  if(!this.name)this.name=this.constructor.name+this.constructor.instances;
  this.constructor.instances++;
  addition[this.name]=this;
  if(this.constructor.color)this.color=this.constructor.color;
  environment.modules.add(addition);
  // console.log("MDIS",this.name);
  return this;
}
