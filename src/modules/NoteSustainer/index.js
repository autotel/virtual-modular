"use strict";

var EventMessage = require('../../datatypes/EventMessage.js');
var InterfaceX16 = require('./InterfaceX16');

var headers = EventMessage.headers;
var CHANGEPOLYPHONYHEADER = headers.changeRate;
var KILLNOTESHEADER = headers.choke;

var testcount = 0;
/**
@constructor
the instance of the of the module, ment to be instantiated multiple times.
require to moduleBase.call
*/
var NoteSustainer = function(properties) {

  var thisInstance = this;
  var myBitmap = 0;
  var polyphony = this.polyphony={value:1};

  let runningNotes = [];

  this.getRunningNotes=function(){
    return runningNotes;
  }
  this.baseName = "Note sust";

  this.name = this.baseName + " " + testcount;
  testcount++;

  if (properties.name) this.name = properties.name;
  var self = this;

  this.interfaces.X16 =  InterfaceX16;

  var recMessages={
    kill:new EventMessage({value:[KILLNOTESHEADER,0,0]}),
    polyphony:new EventMessage({value:[CHANGEPOLYPHONYHEADER,0,0]})
  }
  this.triggerPolyphonyChange=function(){
    recMessages.polyphony.value[1]=polyphony.value;
    self.recordOutput(recMessages.rate);
    self.handle('~ module',{polyphony:polyphony.value});
    polyphonyConstrainCheck();
  }

  this.messageReceived = function(evt) {
    if (evt.eventMessage.value[0] == headers.clockTick && (evt.eventMessage.value[2] % evt.eventMessage.value[1] == 0)) {
    } else if (evt.eventMessage.value[0] == headers.triggerOn) {
      addNote(evt.eventMessage.clone());
      self.output(evt.eventMessage);
    } else if (evt.eventMessage.value[0] == headers.triggerOff) {
    } else if (evt.eventMessage.value[0] == CHANGEPOLYPHONYHEADER) {
      polyphony.value=evt.eventMessage.value[1];
    } else  if (evt.eventMessage.value[0] == KILLNOTESHEADER) {
      killAllNotes();
    }
  }

  this.onRemove = function() {
    killAllNotes();
    return true;
  }

  var killNote=this.killNote=function(note){
    var shut=runningNotes.indexOf(note);
    if(shut>-1){
      shut=runningNotes.splice(shut,1)[0];
      shut.value[0]=headers.triggerOff;
      self.output(shut);
      self.handle('noff',shut);
      return shut;
    }else{
      console.warn("note kill requested, it was not in the runningNotes",note);
    }
  }

  function killOldestNote(){
    var shut=runningNotes.shift();
    if(shut){
      shut.value[0]=headers.triggerOff;
      self.output(shut);
      self.handle('noff',shut);
    }
    return shut;
  }
  function killAllNotes(){
    while(killOldestNote());
  }
  function polyphonyConstrainCheck(){
    if(polyphony.value<0) polyphony.value=0;
    while(runningNotes.length>polyphony.value){
      // console.log("NOTEOFF");
      killOldestNote();
    }
  }
  function addNote(eventMessage){
    runningNotes.push(eventMessage);
    self.handle('non',eventMessage);
    polyphonyConstrainCheck();
  }
};

NoteSustainer.color = [210, 0, 233];
module.exports=NoteSustainer;