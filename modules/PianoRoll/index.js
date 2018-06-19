'use strict';
var EventMessage = require('../../datatypes/EventMessage.js');
var InterfaceX16 = require('./InterfaceX28');
var TapeMem=require('./TapeMem.js');

var CLOCKTICKHEADER = 0x00;
var TRIGGERONHEADER = 0x01;
var TRIGGEROFFHEADER = 0x02;
var CHANGERATEHEADER = 0x04;
var RECORDINGHEADER = 0xAA;

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
  this.clock={
    rate:1,
    loopStart:0,
    loopEnd:16,
    step:0,
    playHead:0,
    microStep:0,
    microSteps:12
  }
  var clock=this.clock;

  this.baseName = "PianoRoll";
  testGetName.call(this);
  if (properties.name) this.name = properties.name;

  this.interfaces.X16 = InterfaceX16;
  // this.interfaces.Http = InterfaceHttp;

  function ramp(t, range) {
    if (t > 0) {
      return t % range;
    } else {
      return range - Math.abs(t % range);
    }
  }
  var teststep=0;
  this.eventReceived = function(evt) {
    if (evt.eventMessage.value[0] == CLOCKTICKHEADER) {
      clock.microSteps=evt.eventMessage.value[1];
      var evtMicroStep=evt.eventMessage.value[2];
      if (evtMicroStep==0){
        clock.step=ramp(clock.step+1,clock.loopEnd-clock.loopStart);
        clock.playHead=clock.step+clock.loopStart;
        clock.microStep=0;
        self.handle('microstep', clock);
        self.handle('step',clock);

        // console.log("STEP EXT", teststep++, "------------------------------------");
        // console.log(clock);
      }else{
        clock.microStep++;
        self.handle('microstep',clock);
      }
      self.memory.tapeFrame(1/clock.microSteps);
      
    } else if (evt.eventMessage.value[0] == TRIGGERONHEADER) {
    } else if (evt.eventMessage.value[0] == TRIGGEROFFHEADER) {
    } else if (evt.eventMessage.value[0] == CHANGERATEHEADER) {
    } else if (evt.eventMessage.value[0] == TRIGGEROFFHEADER + 1) {
    } else if (evt.eventMessage.value[0] == RECORDINGHEADER) {
      evt.eventMessage.value.shift();
      self.memory.recordEvent(evt.eventMessage);
    } else {}
  }
  self.memory.eventTriggerFunction=function(triggeredEventsList){
    for(var evtn in triggeredEventsList){
      var evt=triggeredEventsList[evtn];
      // console.log(evt);
      self.output(evt);
      noteOnTracker.add(evt);
    }
  }
  this.delete = function() {
    console.warn(self.name,"delete noteoffing due");
    clearAll();
    return true;
  }
}

PianoRoll.color = [50, 50, 120];
module.exports = PianoRoll