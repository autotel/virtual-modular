'use strict';
var EventMessage=require('../../Polimod/datatypes/EventMessage.js');
var headers = EventMessage.headers;
var NoteOnTracker = function(ownerModule) {
  var trackedNotes = {};
  var currentMicroStep;
  var currentStep;
  var noteOffSuperImpose=new EventMessage({value:[headers.triggerOff,-1,-1,-1,-1]});
  this.trackEventMessage = function(eventMessage, callback) {
    eventMessage.started = [currentStep, currentMicroStep];
    // trackedNotes.push(eventMessage);
    if (eventMessage.value[0] == headers.triggerOn) {
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
      if (trackedNotes[a].value[0] == headers.triggerOn) {
        if (trackedNotes[a].started[0] + trackedNotes[a].duration[0] <= currentStep ) {
          //TODO: microstep precise length if (currentMicroStep - trackedNotes[a].started[1] >= trackedNotes[a].duration[1]) {
            let off=trackedNotes[a].clone().superImpose(noteOffSuperImpose);
            // console.log("STOP",off);
            ownerModule.output(off,true);
            delete trackedNotes [a];
          // }
        }else{
          // console.log("KEEP",Array.from(trackedNotes).length);
          // console.log(`${trackedNotes[a].started[0] + trackedNotes[a].duration[0]} <= ${currentStep} `);
        }
      }else{
        delete trackedNotes [a];
      }
    }
  }
  this.setAllOff = function() {
    for (var a in trackedNotes) {
      // console.log("track",a);
      if (trackedNotes.value[0] == headers.triggerOn) {
        ownerModule.output(trackedNotes[a].clone().superImpose(noteOffSuperImpose),true);
      }
      delete trackedNotes[a];
    }
    // console.log("tr",trackedNotes);
  }
  return this;
};
module.exports = NoteOnTracker;
