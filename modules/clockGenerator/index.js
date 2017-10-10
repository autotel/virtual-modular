'use strict';
var EventMessage=require('../../datatypes/eventMessage.js');
var moduleInstanceBase=require('../moduleInstanceBase');
var uix16Control=require('./x16basic');
module.exports=function(environment){return new (function(){
  var interactorSingleton=this.InteractorSingleton=new uix16Control(environment);
  var instanced=0;
  var name=function(){
    this.name=this.baseName+" "+instanced;
    instanced++;
  }
  this.Instance=function(properties){
    var thisInstance=this;
    moduleInstanceBase.call(this);
    this.baseName="clockGenerator";
    name.call(this);
    var myInteractor=this.interactor=new interactorSingleton.Instance(this);
    this.interactor.name=this.name;
    setInterval(function(){
      thisInstance.output(new EventMessage({value:[0,1,0]}));
    },200);
  }
})};