'use strict';
var EventMessage=require('../../datatypes/eventMessage.js');
var CLOCKTICKHEADER = 0x00;
var TRIGGERONHEADER = 0x01;
var TRIGGEROFFHEADER = 0x02;
var RECORDINGHEADER = 0xAA;
var NoteOnTracker = function(ownerModule) {
  var trackedNotes = [];
  var currentMicroStep;
  var currentStep;
  var noteOffSuperImpose=new EventMessage({value:[TRIGGEROFFHEADER]});
  this.trackEventMessage = function(eventMessage, callback) {
    eventMessage.started = [currentStep, currentMicroStep];
    trackedNotes.push(eventMessage);
    if (eventMessage.value[0] == TRIGGERONHEADER) {
      let eventKey = [eventMessage.value[1], eventMessage.value[2]];
      trackedNotes[eventKey] = eventMessage;
      if (eventMessage.duration) {
        callback.call(eventMessage, false);
      } else {
        callback.call(eventMessage, "noteOnTracker error: noteon without duration");
      }
    } else {
      callback.call(eventMessage, false);
    }
  }
  this.clockFunction = function(_currentStep, _currentMicroStep) {
    currentStep = _currentStep
    currentMicroStep = _currentMicroStep
    for (var a in trackedNotes) {
      if (trackedNotes[a].value[0] == TRIGGERONHEADER) {
        if (currentStep - trackedNotes[a].started[0] >= trackedNotes[a].duration[0]) {
          if (currentMicroStep - trackedNotes[a].started[1] > trackedNotes[a].duration[1]) {
            ownerModule.output(trackedNotes[a].clone().superImpose(noteOffSuperImpose));
            delete trackedNotes[a];
          }
        }
      }else{
        delete trackedNotes[a];
      }
    }
  }
  this.setAllOff = function() {
    for (var a in trackedNotes) {
      // console.log("track",a);
      if (trackedNotes.value[0] == TRIGGERONHEADER) {
        ownerModule.output(trackedNotes[a].clone().superImpose(noteOffSuperImpose));
      }
      delete trackedNotes[a];
    }
    // console.log("tr",trackedNotes);
  }
  return this;
};
module.exports = NoteOnTracker;