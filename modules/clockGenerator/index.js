'use strict';
var EventMessage=require('../../datatypes/EventMessage.js');
var moduleInstanceBase=require('../moduleInstanceBase');
var uix16Control=require('./x16basic');
var clockSpec=require('../standards/clock.js');

module.exports=function(environment){return new (function(){
  var interactorSingleton=this.InteractorSingleton=new uix16Control(environment);
  var instanced=0;
  var name=function(){
    this.name=this.baseName+" "+instanced;
    instanced++;
  }
  this.Instance=function(properties){
    var thisInstance=this;
    // clocks per step
    // the step
    var myEventMessage=new EventMessage({value:[clockSpec[0].incrementalTick,12/*ck per step*/,0/* step number*/]});
    moduleInstanceBase.call(this);
    this.baseName="clockGenerator";
    name.call(this);
    if(properties.name) this.name=properties.name;
    var myInteractor=this.interactor=new interactorSingleton.Instance(this);
    this.interactor.name=this.name;
    setInterval(function(){
      thisInstance.output(myEventMessage);
      myEventMessage.value[2]++;
      myEventMessage.value[2]%=myEventMessage.value[1];
    },200/12);
  }
})};