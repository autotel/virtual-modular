'use strict';
var EventMessage = require('../../datatypes/EventMessage.js');
var InterfaceX16 = require('./InterfaceX16');
// var clockSpec=require('../standards/clock.js');
var CLOCKTICKHEADER = 0x00;
var CLOCKABSOLUTEHEADER = 0x03;
var instanced = 0;
var name = function() {
  this.name = this.baseName + " " + instanced;
  instanced++;
}
var ClockGenerator = function(properties={bpm:60}) {
  var thisInstance = this;
  var myInterval = false;
  this.preventBus = true;

  var myEventMessage = new EventMessage({
    value: [CLOCKTICKHEADER, 12 /*ck per step*/ , 0 /* step number*/ ]
  });
  var step = this.step = {
    value: 0,
    microSteps: 12
  }

  this.baseName = "clockGenerator";
  name.call(this);
  if (properties.name) this.name = properties.name;
  this.interfaces.X16 =  InterfaceX16;

  function tickFunction() {
      step.value++;
      step.value %= step.microSteps;
      myEventMessage.value[1] = step.microSteps;
      myEventMessage.value[2] = step.value;
      thisInstance.output(myEventMessage);
      // thisInstance.handle('micro step'):
  }
  var metro=new MetronomePrototype();
  metro.onTick(tickFunction);
  this.metro=metro;


  if(properties.interval) metro.interval(properties.interval);
  if(properties.bpm) metro.bpm(properties.bpm * 4);

}

var microStepDivide=12;

function MetronomePrototype(props={}) {

  var interval=60;

  var microInterval=interval/microStepDivide;

  var currentStep=0;
  var currentMicroStep=0;

  this.clockMode="absolute";
  if(props.mode)this.clockMode=props.mode;

  var tMetro=this;
  var myIndex=0;
  //vars for anti drifting
  var absoluteMicroInterval=0;
  var absoluteMicroDrift=0;
  var timeAnchor=0;
  var microIterations=0;

  var forcedDrift=0;

  function _onTick(){};
  this.onTick=function(fn){
    _onTick=fn;
  }
  function tick(){
    _onTick();
    // console.log("ti");
    //todo: optionally send an absolute step message?.
  }
  function microTick(){
    currentMicroStep%=microStepDivide;
    tick();
    currentMicroStep++;
  };
  function stm(){
    var hrtime=process.hrtime();
    var now=(hrtime[1]/1000000)+(hrtime[0]*1000);
    //anti drifting funcs
    microIterations++;
    var elapsed=now-timeAnchor;
    var nextInterval=(microIterations*microInterval)-elapsed;

    //add user defined drift
    nextInterval+=forcedDrift;

    setTimeout(stm,nextInterval-absoluteMicroDrift);
    absoluteMicroInterval=(elapsed/microIterations);
    absoluteMicroDrift=microInterval-absoluteMicroInterval;
    // console.log("tick n "+currentMicroStep
    // +"\n  Tartget:"+microInterval
    // +"\n  Interval:"+absoluteMicroInterval
    // +"\n  drift:"+absoluteMicroDrift
    // +"\n  nextinterval:"+nextInterval);
    // operation functions
    microTick();
    // currentMicroStep++;
    // currentMicroStep%=microStepDivide;
  }
  function resetTimeAnchor(){
    var hrtime=process.hrtime();
    timeAnchor=(hrtime[1]/1000000)+(hrtime[0]*1000);
    microIterations=0;
  }
  function start(){
    // timeAnchor=new Date();
    resetTimeAnchor();
    stm();
  }
  this.drift=function(ms){
    forcedDrift+=ms;
  }
  start();
  this.interval=function(val){
    if(val){
      interval=val;
      microInterval=interval/microStepDivide;
      resetTimeAnchor();
    }
    return interval;
  }
  this.bpm=function(val){
    if(val){
      //60,000 / BPM = interval
      //bp/k=1/interval
      //bp=1/interval*k
      interval=60000/(val);
      microInterval=interval/microStepDivide;
      // console.log("cal",interval);
      resetTimeAnchor();
      return val;
    }else{
      return Math.floor((1/interval)*60000);
    }
  }
}
ClockGenerator.color = [60, 100, 100];
module.exports = ClockGenerator;