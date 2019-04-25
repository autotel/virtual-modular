'use strict';
var EventMessage = require('../../Polimod/datatypes/EventMessage.js');
var InterfaceX16 = require('./InterfaceX16');
var NoteOnTracker = require('../moduleUtils/NoteOnTracker.js');
// var clockSpec=require('../standards/clock.js');
var headers = EventMessage.headers;

var testcount = 0;
var testGetName = function () {
  this.name = this.baseName + " " + testcount;
  testcount++;
}
/**
 @constructor
 the instance of the of the module, ment to be instantiated multiple times.
 require to moduleBase.call
 */


var Alteration = function (properties) {
  Base.call(this,properties,environment);
  this.name=this.constructor.name+instances++;
  if (properties.name) this.name = properties.name;
  var self = this;
  var myBitmap = 0;
  var settings = this.settings = {
    delayMicro: {
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
    step: 0
  }
            // ___---___---______---___---___---___
  this.alterations=[ 0,-1, 0,-1, 0, 0,-1, 0,-1, 0,-1, 0];
  var noteOnTracker = new NoteOnTracker(this);


  this.interfaces.X16 = InterfaceX16;

  var recMessages = {
    rate: new EventMessage({ value: [headers.changeRate, 12, -1] }),
    trigger: new EventMessage({ value: [headers.triggerOn, 36, -1] }),
  }
  this.recordRate = function () {
    recMessages.rate.value[2] = settings.delayMicro.value;
    self.recordOutput(recMessages.rate);
  }
  this.recordingReceived = function (evt) {
    if (evt.eventMessage.value[0] == headers.record) {
      var event = evt.eventMessage;
      event.value.shift();
    }
    //backpropagate rec messages
  }
  this.uiTrigger=function(num){
    var uiMessage = recMessages.trigger.clone();
    uiMessage.value[1]=num;
    var generatedMessage=uiMessage.clone();
    transformEventMessage(generatedMessage)
    // console.log("UITR", generatedMessage);
    console.log("On", num);

    //for recording
    noteOnTracker.add(uiMessage, ["REC",num]);
    self.recordOutput(uiMessage);
    //for output
    noteOnTracker.add(generatedMessage, ["UI", num]);
    self.output(generatedMessage);
  }
  this.uiTriggerOff=function(num){
    console.log("OFF",num);
    noteOnTracker.ifNoteOff(["UI", num], function (noteOff) {
      console.log("OFF",noteOff);
      self.output(noteOff);
    });
    noteOnTracker.ifNoteOff(["REC", num], function (noteOff) {
      console.log("OFF",noteOff);
      let nnoff = noteOff.clone();
      nnoff.value[0] = headers.triggerOff;
      self.recordOutput(nnoff);
    });
  }
  this.messageReceived = function (evt) {
    if (evt.eventMessage.value[0] == headers.clockTick) {
      
    } else if (evt.eventMessage.value[0] == headers.changeRate) {
      clock.subSteps = evt.eventMessage.value[2] / (evt.eventMessage.value[1] || 1);
    } else if (evt.eventMessage.value[0] == headers.triggerOn) {
      var gradeNumber=evt.eventMessage.value[1];
      var timbrNum=evt.eventMessage.value[2];
      transformEventMessage(evt.eventMessage);
      noteOnTracker.add(evt.eventMessage, ["EX", gradeNumber, timbrNum]);
      self.output(evt.eventMessage);

    } else if (evt.eventMessage.value[0] == headers.triggerOff) {
      var timbrNum=evt.eventMessage.value[2];
      var gradeNumber=evt.eventMessage.value[1];
      noteOnTracker.ifNoteOff(["EX", gradeNumber, timbrNum], function (noteOff) {
        self.output(noteOff);
      });
    }
  }
  var numberTransformFunction=function(input){
    var base=Math.floor(input/12)*12;
    var wrIn = input%12;
    var grade = self.alterations[wrIn] + wrIn;
    console.log(input,base,grade);
    return base+grade;
  }
  var transformEventMessage=function(eventMessage){
    eventMessage.value[1]=numberTransformFunction(eventMessage.value[1]);
  }
  this.getBitmap16 = function () {
    return myBitmap;
  }
  // this.onRemove = function () {
  //   noteOnTracker.empty(function (noff) {
  //     thisInstance.output(noff, true);
  //   });
  //   return true;
  // }

  this.handleStepsChange = function () {
    self.handle('~module', { steps: runningNotes.length });
  }

};

Alteration.color = [160, 200, 20];
module.exports = Alteration;