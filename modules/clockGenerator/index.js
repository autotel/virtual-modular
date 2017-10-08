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
    moduleInstanceBase.call(this);
    this.baseName="emptyModule";
    name.call(this);
    var myInteractor=this.interactor=new interactorSingleton.Instance(this);
    this.interactor.name=this.name;
  }
})};