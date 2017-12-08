'use strict';
var moduleInstanceBase=require('../moduleInstanceBase');
module.exports=function(environment){return new (function(){
  var instanced=0;
  var name=function(){
    this.name=this.baseName+" "+instanced;
    instanced++;
  }
  /**
  @constructor
  the instance of the of the module, ment to be instantiated multiple times.
  require to moduleBase.call
  */
  this.Instance=function(properties){
    moduleInstanceBase.call(this);
    this.baseName="bus";
    var self=this;
    name.call(this);
    this.interactor={
      type:"interactor",
      compatibilityTags:[]
    }

    this.eventReceived=function(evt){
      this.output(evt.eventMessage);
    }

    if(properties.name) this.name=properties.name
    environment.on('module created',function(evt){
      var module=evt.module;

      if(module.baseName!=="bus"){
        self.addOutput(module);
      }
    });
  }
})};