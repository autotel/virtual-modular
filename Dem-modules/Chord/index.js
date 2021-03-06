'use strict';
var EventMessage = require('../../Polimod/datatypes/EventMessage.js');
const Base= require("../Base");

let headers = EventMessage.headers;
let instances=0;

var Chord = function (properties,environment) {
  var self = this;
  this.preventBus=true;
  this.baseName = "Chord";
  
  this.color=Chord.color;

  Base.call(this,properties,environment);
  
  

  var noteOnTracker={}

  this.bitmap=0;
  this.offset={value:-8}
  this.remapIndex={
    value:1,
    valueNames:["none","note","chan"],
  }

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
      var incomingTimbr=evt.eventMessage.value[2];
      var incomingValue=evt.eventMessage.value[self.remapIndex.value];
      eachChordGrade(function(num){
        var newMes=evt.eventMessage.clone();
        if (!noteOnTracker[incomingNote, incomingTimbr]) noteOnTracker[incomingNote, incomingTimbr]=[];
        noteOnTracker[incomingNote,incomingTimbr].push(newMes);
        newMes.value[self.remapIndex.value]=incomingValue+num;
        self.output(newMes);
      });
    } else if (evt.eventMessage.value[0] == headers.triggerOff) {
      var incomingNote=evt.eventMessage.value[1];
      var incomingTimbr=evt.eventMessage.value[2];
      if(noteOnTracker[incomingNote, incomingTimbr]){
        for (var trackedNoteOn of noteOnTracker[incomingNote, incomingTimbr]){
          trackedNoteOn.value[0]=EventMessage.headers.triggerOff;
          self.output(trackedNoteOn);
        }
        delete noteOnTracker[incomingNote, incomingTimbr];
      }
      // console.log(noteOnTracker);
    }
  }

  this.getBitmap16 = function () {
    return myBitmap;
  }
  // this.onRemove = function () {
  //   noteOnTracker.empty(function (noff) {
  //     self.output(noff, true);
  //   });
  //   return true;
  // }

  this.handleStepsChange = function () {
    self.handle('~module', { steps: runningNotes.length });
  }

};

Chord.color = [210, 0, 233];
module.exports = Chord;
