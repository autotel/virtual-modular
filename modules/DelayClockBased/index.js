'use strict';
var EventMessage = require('../../datatypes/EventMessage.js');
var InterfaceX16 = require('./InterfaceX16');
var NoteOnTracker = require('../moduleUtils/NoteOnTracker.js');
// var clockSpec=require('../standards/clock.js');
var headers=EventMessage.headers;

var testcount = 0;
var testGetName = function() {
  this.name = this.baseName + " " + testcount;
  testcount++;
}
/**
@constructor
the instance of the of the module, ment to be instantiated multiple times.
require to moduleBase.call
*/
var DelayClockBased = function(properties) {

  var thisInstance = this;
  var myBitmap = 0;
  var settings=this.settings={
    delayMicro:{
      value: 0,
    },
    // feedback:{
    //   value:0,
    //   valueNames:['no','yes'],
    // },
  }
  let clock = this.clock = {
    subSteps: 1,
    subStep: 0,
    step:0
  }

  this.baseName = "DelayClockBased";
  testGetName.call(this);
  if (properties.name) this.name = properties.name;
  var self = this;


  this.interfaces.X16 =  InterfaceX16;

  var memory=new Set();
  var recMessages={
    rate:new EventMessage({value:[headers.changeRate,12,-1]})
  }
  this.recordRate=function(){
    recMessages.rate.value[2]=settings.delayMicro.value;
    self.recordOutput(recMessages.rate);
  }
  this.recordingReceived = function(evt){
    if (evt.eventMessage.value[0] == headers.record) {
      var event = evt.eventMessage;
      event.value.shift();
      memory.add(event);
    }
  }
  this.messageReceived = function(evt) {
    if (evt.eventMessage.value[0] == headers.clockTick) {
      memory.forEach(function (evt) {
        if (!evt.wait) evt.wait = settings.delayMicro.value;
        evt.wait--;
        if (evt.wait <= 0) {
          self.output(evt);
          memory.delete(evt);
        }
      })
    } else if (evt.eventMessage.value[0] == headers.changeRate) {
      clock.subSteps = evt.eventMessage.value[2] / (evt.eventMessage.value[1] || 1);
    } else {
      memory.add(evt.eventMessage);
    }
  }

  this.getBitmap16 = function() {
    return myBitmap;
  }
  this.delete = function() {
    noteOnTracker.empty(function(noff){
      thisInstance.output(noff, true);
    });
    return true;
  }

  this.handleStepsChange=function(){
    self.handle('~ module',{steps:runningNotes.length});
  }

};

DelayClockBased.color = [210, 0, 233];
module.exports=DelayClockBased;