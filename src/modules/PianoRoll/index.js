'use strict';
var EventMessage = require('../../datatypes/EventMessage.js');
var InterfaceX28 = require('./InterfaceX28');
var TapeMem=require('./TapeMem.js');
var headers = EventMessage.headers;

var instancesCount = 0;
var testGetName = function() {
  this.name = this.baseName + " " + instancesCount;
  instancesCount++;
}
var PianoRoll = function(properties,environment) {
  var self = this;
  
  var noteOnTracker = new Set();
  var noteLengthTracker=new(function(){
    this.tracker=[];
    this.add=function(what){
      what.started=clock.step
      this.tracker[what.value[1], what.value[2]]=what;
    }
    this.get=function(num1,num2){
      
    }
  })();
  this.memory=new TapeMem();
  this.memory.setLoopPoints(0,16);
  var memory=this.memory;


  this.clock={
    rate:1,
    playHead:0,
    microStep:0,
    microSteps:12
  }
  
  var clock=this.clock;

  this.baseName = "PianoRoll";
  testGetName.call(this);
  if (properties.name) this.name = properties.name;

  //defined as x16 because it probably is compatible
  this.interfaces.X16 = InterfaceX28;
  // this.interfaces.Http = InterfaceHttp;

  function ramp(t, range) {
    if (t > 0) {
      return t % range;
    } else {
      return range - Math.abs(t % range);
    }
  }

  var rec={}
  memory.on('step',function(a){
    if(rec.status){
      // console.log("REC",a);
      rec.duration++;
    }
  });

  this.recordingReceived=function(evt){
    var message=evt.eventMessage;
    if (message.value[0] == headers.record) {
      message.value.shift();
      self.memory.recordEvent(message);
    } else if (message.value[0]==headers.recordStatus){
      rec.status = message.value[1];
      if(rec.status){
        rec.duration=0;
        rec.started=memory.getPlayhead();
      }else{
        // console.log("recording ended:",rec);
      }
    }
  }

  this.messageReceived = function(evt) {
    if (evt.eventMessage.value[0] == headers.clockTick) {
      clock.microSteps=evt.eventMessage.value[1];
      var evtMicroStep=evt.eventMessage.value[2];
      if (evtMicroStep==0){
        clock.microStep=0;
        memory.quantizePlayheadPosition();
      }else{
        clock.microStep++;
      }
      self.handle('microstep',clock);
      self.memory.tapeFrame(1/clock.microSteps);
      // if(rec.status){
      //   rec.duration++;
      // }
    } else if (evt.eventMessage.value[0] == headers.triggerOn) {
    } else if (evt.eventMessage.value[0] == headers.triggerOff) {
    } else if (evt.eventMessage.value[0] == headers.changeRate) {
    } else if (evt.eventMessage.value[0] == headers.triggerOff + 1) {
    } 
  }

  self.memory.eventTriggerFunction=function(triggeredEventsList){
    var duPrevent={};
    for(var evtn in triggeredEventsList){
      var evt=triggeredEventsList[evtn];
      if (duPrevent[evt.value[1], evt.value[2], evt.value[3]]){
      }else{
        duPrevent[evt.value[1], evt.value[2], evt.value[3]] = true;
        // console.log(evt);
        self.output(evt);
        noteOnTracker.add(evt);
      }
    }
  }
  
}

PianoRoll.color = [50, 50, 120];
module.exports = PianoRoll