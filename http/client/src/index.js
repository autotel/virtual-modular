'use strict'
//environment.js
var Observable=require('onhandlers');
var environment=new(function(){
  var modules=this.modules=new Set();
  this.plugins={};
  var self=this;
  this.use=function(Proto){
    console.log("using",Proto.name);
    this.plugins[Proto.name]=new Proto(self);
  }
  this.addModule=function(properties){
    modules.add(properties)
  }
  this.connect=function(properties){
    properties.origin.connectTo(properties.destination);
  }
  return this;
})();

//index.js
environment.use(require('./socketMan.js'));