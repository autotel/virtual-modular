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
      console.log(self.name,"-->",to.name);
    }
    environment.handle('+ module',self)
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
    properties.origin.connectTo(properties.destination);
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