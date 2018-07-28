'use strict'
//environment.js
var Observable=require('onhandlers');
var environment=new(function(){
  Observable.call(this);
  var environment=this;
  var Module=function(properties){
    var self=this;
    var environment=Module.environment;
    // Observable.call(this);
    this.properties=properties;
    this.reset=function(properties){
      this.properties=properties;
      environment.handle('modulereset',{module:self});
    };
    this.connectTo=function(to){
      if(to.properties){
        console.log(self.properties.name,"--->",to.properties.name);
        environment.handle('+connection',{origin:self,destination:to});
      }else{
        console.warn(self,"-!->",to);
      }
    }
    this.disconnectTo=function(to){
      if(to.properties){
        console.log(self.properties.name,"-X->",to.properties.name);
        environment.handle('-connection',{origin:self,destination:to});
      }else{
        console.warn(self,"X!->",to);
      }
    }
    // this.messageTo=function(to,message){
    //   self.handle('> message',{destination:to,value:message});
    // }
    environment.handle('+module',{module:self})
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
    environment.handle('-module',{module:what});
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
  this.changeModule=function(properties){
    //two modules must not have the same unique
    var exists=Module.getByUnique(properties.origin,false);
    if(exists){
      properties.module=exists;
      environment.handle('~module',properties);
      // exists.applyChanges(properties);
    }else{
      console.warn("module change error: uid "+properties.unique+" doesn't exist");
    }
  }
  this.removeModule=function(properties){
    //two modules must not have the same unique
    var exists=Module.getByUnique(properties.origin,false);
    if(exists){
      Module.delete(exists);
    }else{
      console.warn("module deletion error: uid "+properties.unique+" doesn't exist");
    }
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
  this.makeEventMessageEvent=function(properties){
    // console.log('msg',properties);
    var a = Module.getByUnique(properties.origin,true);
    var b = Module.getByUnique(properties.destination,true);
    if(a&&b){
      environment.handle('>message',{
        origin:a,
        destination:b,
        value:properties.val
      });
    }else{
      console.warn("message could not be attributed to any module",properties);
    }
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