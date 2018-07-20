'use strict';
var EventMessage = require('../../datatypes/EventMessage.js');
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


var Chord = function (properties) {
  var thisInstance = this;
  this.preventBus=true;
  this.baseName = "Chord";
  testGetName.call(this);
  if (properties.name) this.name = properties.name;
  var self = this;
  this.interfaces.X16 = InterfaceX16;

  var noteOnTracker={}
  
  this.bitmap=0;
  this.offset={value:-8}

  function eachChordGrade(cb){
    for(var b=0; b<16; b++){
      if(self.bitmap & 1<<b){
        cb(b + self.offset.value);
      }
    }  
  }

  this.messageReceived = function (evt) {
    if (evt.eventMessage.value[0] == headers.clockTick) {
    } else if (evt.eventMessage.value[0] == headers.triggerOn) {
      var incomingNote=evt.eventMessage.value[1];
      eachChordGrade(function(num){
        var newMes=evt.eventMessage.clone();
        if (!noteOnTracker[incomingNote, evt.eventMessage.value[2]]) noteOnTracker[incomingNote, evt.eventMessage.value[2]]=[];
        noteOnTracker[incomingNote,evt.eventMessage.value[2]].push(newMes);
        newMes.value[1]=incomingNote+num;
        self.output(newMes);
      });
    } else if (evt.eventMessage.value[0] == headers.triggerOff) {
      if(noteOnTracker[incomingNote, evt.eventMessage.value[2]]){
        for (var trackedNoteOn of noteOnTracker[incomingNote, evt.eventMessage.value[2]]){
          trackedNoteOn.value[0]=EventMessage.headers.triggerOff;
          self.output(trackedNoteOn);
        }
        delete noteOnTracker[incomingNote, evt.eventMessage.value[2]];      
      }
      // console.log(noteOnTracker);
    }
  }

  this.getBitmap16 = function () {
    return myBitmap;
  }
  this.delete = function () {
    noteOnTracker.empty(function (noff) {
      thisInstance.output(noff, true);
    });
    return true;
  }

  this.handleStepsChange = function () {
    self.handle('~ module', { steps: runningNotes.length });
  }

};

Chord.color = [210, 0, 233];
module.exports = Chord;