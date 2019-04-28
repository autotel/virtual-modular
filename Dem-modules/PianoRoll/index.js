'use strict';
var EventMessage = require('../../Polimod/datatypes/EventMessage.js');

var TapeMem=require('./TapeMem.js');
var headers = EventMessage.headers;
const Base= require("../Base");

var instancesCount = 0;
var testGetName = function() {
  this.name = this.baseName + " " + instancesCount;
  instancesCount++;
}
var PianoRoll = function(properties,environment) {
  var self = this;
  Base.call(this,properties,environment);

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
  var quantize=this.quantize={
    portions:0,
    offset:0,
  };

  var clock=this.clock;

  
  


  function ramp(t, range) {
    if (t > 0) {
      return t % range;
    } else {
      return range - Math.abs(t % range);
    }
  }

  var rec={}
  memory.on('step',function(a){
    self.clock.playHead=Math.floor(a.playHead);
    self.clock.microStep=(a.playHead * a.microSteps);
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
    var eventMessage=evt.eventMessage;
    if (eventMessage.value[0] == headers.clockTick) {
      clock.microSteps=eventMessage.value[1];
      var microStep=eventMessage.value[2];
      self.handle('microstep',clock);
      if(quantize.portions){
        if((microStep + quantize.offset) % (clock.microSteps/quantize.portions) == 0)
          self.memory.tapeFrame(1/quantize.portions);
      }else{
        //TODO: get delta of microstep and that is the added microstep to memoryframe
        //just in case a clock skips a micro.
        self.memory.tapeFrame(1/clock.microSteps);
      }

    } else if (eventMessage.value[0] == headers.triggerOn) {
      console.log("jump",eventMessage.value[1],eventMessage.value[2]/clock.microSteps);
      self.memory.jumpToStep(eventMessage.value[1]+eventMessage.value[2]/clock.microSteps);
    } else if (eventMessage.value[0] == headers.triggerOff) {
    } else if (eventMessage.value[0] == headers.changeRate) {
    } else if (eventMessage.value[0] == headers.triggerOff + 1) {
    }
  }

  self.memory.eventTriggerFunction=function(triggeredEventsList){
    var duPrevent={};
    for(var evtn in triggeredEventsList){
      var evt=triggeredEventsList[evtn];
      if (duPrevent[evt.value.slice(0,3).join("-")]){
        // console.log(duPrevent);
      }else{
        duPrevent[evt.value.slice(0,3).join("-")] = true;
        // console.log(evt);
        self.output(evt);
        noteOnTracker.add(evt);
      }
    }
  }

}

PianoRoll.color = [50, 50, 120];
module.exports = PianoRoll
