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
    var myInterval=false;
    var myEventMessage=new EventMessage({value:[clockSpec[0].incrementalTick,12/*ck per step*/,0/* step number*/]});
    moduleInstanceBase.call(this);
    var cpm=this.cpm={value:120*8,updated:120*8};
    var step=this.step={value:0,microSteps:12}
    if(properties.cpm)this.cpm.value=properties.cpm;
    this.baseName="clockGenerator";
    name.call(this);
    if(properties.name) this.name=properties.name;
    var myInteractor=this.interactor=new interactorSingleton.Instance(this);
    this.interactor.name=this.name;
    function resetInterval(){
      clearInterval(myInterval);
      cpm.updated=cpm.value;
      myInterval=setInterval(function(){
        if(cpm.value!=cpm.updated) resetInterval();
        step.value++;
        step.value%=step.microSteps;
        myEventMessage.value[1]=step.microSteps;
        myEventMessage.value[2]=step.value;
        thisInstance.output(myEventMessage);
        // thisInstance.handle('micro step');
      },(60000)/(cpm.value*step.microSteps));
    }
    resetInterval();
  }
})};