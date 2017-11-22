'use strict';
var NoteOnTracker=function(ownerModule) {
  var trackedNotes = [];
  this.trackEventMessage = function(eventMessage, callback) {
    eventMessage.started = currentMicroStep;
    trackedNotes.push(eventMessage);
    if (eventMessage.value[0] == TRIGGERONHEADER) {
      eventKey = [eventMessage.value[1], eventMessage.value[2]];
      trackedNotes[eventKey] = eventMessage;
      if (!isNaN(eventMessage.duration)) {
        callback.call(eventMessage, false);
      } else {
        callback.call(eventMessage, "error: noteon without duration");
      }
    } else {
      callback.call(eventMessage, false);
    }
  }
  this.clockFunction = function(currentsStep, currentMicroStep) {
    for (var a in trackedNotes) {
      if (trackedNotes.value[0] == TRIGGERONHEADER) {
        if (currentMicroStep - trackedNotes[a].started > trackedNotes[a].duration) {
          ownerModule.output(trackedNotes[a].clone().superImpose(noteOffSuperImpose));
        }
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
module.exports=NoteOnTracker;