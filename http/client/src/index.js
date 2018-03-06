'use strict'
//environment.js
var Observable=require('onhandlers');
var environment=new(function(){
  Observable.call(this);
  var environment=this;
  var Module=function(properties){
    var self=this;
    var environment=Module.environment;
    this.properties=properties;
    this.reset=function(properties){
      this.properties=properties;
      environment.handle('module reset',{module:self});
    };
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
  Module.getByUnique=function(uiq,force){
    for(var mod of Module.list){
      if(mod.properties.unique===uiq){
        return mod;
      }
    }
    console.log("sprite unique not found.",uiq);
    if(force){
      environment.addModule({
        type:'placeholder',
        unique:uiq,
        name:'?'+uiq
      });
      return Module.getByUnique(uiq);
    }
    return false;
    // return false;
  }
  Module.delete=function(what){
    environment.handle('- module',{module:what});
    console.log("DEL",what);
    what.properties.unique=undefined;
    var iof = Module.list.indexOf(what)
    if(iof!==-1){
      Module.list.splice(iof,1);
    } else {
      console.warn("!DEL");
    }
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
    //two modules must not have the same unique
    var exists=Module.getByUnique(properties.unique,false);
    if(exists){
      Module.delete(exists);
    }
    modules.add(new Module(properties))

  }
  this.connect=function(properties){
    // console.log("connect",properties);
    Module.getByUnique(properties.origin,true)
        .connectTo(Module.getByUnique(properties.destination,true));
  }
  this.disconnect=function(properties){
    // console.log("connect",properties);
    Module.getByUnique(properties.origin,true)
        .disconnectTo(Module.getByUnique(properties.destination,true));
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