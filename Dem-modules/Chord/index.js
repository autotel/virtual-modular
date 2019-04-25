'use strict';
var EventMessage = require('../../Polimod/datatypes/EventMessage.js');
var InterfaceX28 = require('./InterfaceX28');
var NoteOnTracker = require('../moduleUtils/NoteOnTracker.js');
// var clockSpec=require('../standards/clock.js');
var headers = EventMessage.headers;

/**
 @constructor
 the instance of the of the module, ment to be instantiated multiple times.
 require to moduleBase.call
 */


var Chord = function (properties) {
  var self = this;
  this.preventBus=true;
  this.baseName = "Chord";
  if (properties.name) this.name = properties.name;
  this.interfaces.X16 = InterfaceX28;

  Base.call(this,properties,environment);
  this.name=this.constructor.name+instances++;
  if (properties.name) this.name = properties.name;

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
