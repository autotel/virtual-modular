'use strict'
//environment.js
var Observable=require('onhandlers');
var environment=new(function(){
  Observable.call(this);
  var Module=function(properties){
    var self=this;
    var environment=Module.environment;
    this.properties=properties;
    this.connectTo=function(to){
      if(to.properties){
        console.log(self.properties.name,"--->",to.properties.name);
        environment.handle('+ connection',{origin:self,destination:to});
      }else{
        console.warn(self,"-!->",to);
      }
    }
    this.disconnectTo=function(to){
      if(to.properties){
        console.log(self.properties.name,"-X->",to.properties.name);
        environment.handle('- connection',{origin:self,destination:to});
      }else{
        console.warn(self,"X!->",to);
      }
    }
    environment.handle('+ module',{module:self})
    Module.list.push(this);
  }
  Module.list=[];
  Module.getByUnique=function(uiq){
    for(var mod of Module.list){
      if(mod.properties.unique===uiq){
        // console.log("FOUND!",mod);
        return mod;
      }
    }
    console.log("sprite unique not found",uiq);
    return false;
  }
  Module.environment=this;
  var modules=this.modules=new Set();
  this.plugins={};
  var self=this;
  this.use=function(Proto){
    console.log("using",Proto.name);
    this.plugins[Proto.name]=new Proto(self);
  }
  this.addModule=function(properties){
    modules.add(new Module(properties))
  }
  this.connect=function(properties){
    // console.log("connect",properties);
    Module.getByUnique(properties.origin)
        .connectTo(Module.getByUnique(properties.destination));
  }
  this.disconnect=function(properties){
    // console.log("connect",properties);
    Module.getByUnique(properties.origin)
        .disconnectTo(Module.getByUnique(properties.destination));
  }
  this.start=function(){
    console.log("START");
    self.handle('start');
  }
  return this;
})();

//index.js
environment.use(require('./SocketMan.js'));
environment.use(require('./ui'));
environment.start();