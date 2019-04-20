'use strict';
var EventMessage=require('../../datatypes/EventMessage');
var headers=EventMessage.headers;




var Fifo = require('fifo');

var NoteLogger = function( _settings) {
  var self = this;
  var clock = this.clock = {
    step: 0,
    microSteps: 12,
    microStep: 0,
    historicStep: 0
  };
  var settings = {
    memoryLength: 2048
  }
  for (var a in _settings) {
    settings = _settings[a];
  }
  var fifo = Fifo();
  fifo.lastEntry=null;
  var trackedNotes = [];

  function addToMemory(eventMessage) {
    // console.log("ADDDD",eventMessage.value[1]);
    fifo.lastEntry=fifo.push(eventMessage);
    while (fifo.length > settings.memoryLength) {
      fifo.shift();
    };
  }
  this.addEvent = function(eventMessage) {
    // console.log("ADDD2");
    var timeNow = [self.clock.historicStep, self.clock.microStep];
    var eventKey = [eventMessage.value[1], eventMessage.value[2]];
    if (eventMessage.value[0] == headers.triggerOn) {
      eventMessage.starts = timeNow;
      trackedNotes[eventKey] = eventMessage;
    } else if (eventMessage.value[0] == headers.triggerOff) {
      var trackedNote = trackedNotes[eventKey];
      if (trackedNote) {
        //started looks like: [step,microStep]
        var started = trackedNote.starts;
        trackedNote.duration = [self.clock.historicStep - started[0], self.clock.microStep - started[1]];
        // console.log("THRKNTSTART",tr);
        while(trackedNote.duration[1]<=0){
          trackedNote.duration[1]+=self.clock.microSteps;
        }
        console.log(trackedNote.duration);
        addToMemory(trackedNote);
        delete trackedNotes[eventKey];
        // console.log("TRASH",trackedNotes);
        // console.log("DURAT",trackedNote.duration);
      } else {
        console.warn("received a noteoff for a note that was not being tracked");
      }
    } else {
      eventMessage.starts = timeNow;
      addToMemory(eventMessage);
    }
    // console.log("STARTEEED",eventMessage.starts);
  }

  /**
  returns number indexed array of the last n events
   @param timeIndexed can be boolean or a number if you want to have the events %arized to a value
  */
  this.getLastNEvents = function(n, timeIndexed = false) {
    var ret = [];
    var modularize = !(isNaN(timeIndexed) || timeIndexed === true);
    var currNode = fifo.lastEntry;
    for (let a = 0; a < n; a++) {
      if (timeIndexed) {
        var timeIndex=[self.clock.historicStep, self.clock.microStep];
        if (modularize) {
          timeIndex=[self.clock.historicStep % timeIndexed, self.clock.microStep]
        }
        if(!ret[timeIndex]) ret[timeIndex]=[];
        ret[timeIndex].push(currNode.value)
      } else {
        ret.push(currNode.value);
      }
      currNode = fifo.prev(currNode);
    }
    ret.push(currNode.value);
    return ret;
  }
  /**
  function to check if  @param eventMessage has length and start time in case it's a note on event
  */
  function isMemEventComplete(eventMessage) {
    // console.log("EVALUTUA",eventMessage);
    // (eventMessage.starts!==undefined && eventMessage.duration!==undefined)
    // console.log("EVALUTUB",eventMessage);

    if (eventMessage.value[0] == headers.triggerOn) {
      return (eventMessage.starts!==undefined && eventMessage.duration!==undefined);
    } else {
      return true;
    }
  }
  /**
  @returns the time of the last event. optionally can be @param modularize. If there have not been any events, it @returns false. timeIndexed cannot be a boolean If @param callback is provided, it will run it in case there is a last event.
  */
  this.lastEventTime = function(modularize = false, callback) {
    if(fifo.last())
    var ref=fifo.last().starts;
    // console.log("RREF",ref);
    // console.log("FFREFFE",ref);
    if(!ref) return;
    var ret = [ref[0],ref[1]];
    if (ret) {
      // if (ret.starts) {
        if (modularize) {
          ret[0] %= modularize[0];
          ret[1] %= modularize[1];
        }
        // console.log("RTSTARTE",ret);
        if (callback) callback(ret);
        return ret;
      // } else {
        // console.warn("nstarted!", ret);
      // }
    }
    return false;
  }

  /**
  returns time-indexed ([step,microStep]) of events between the current time minus @param timaRangeStart and current time. @param modularize can be used to get the events %ized. if it's defined just as "true", the time range will be used as modulus. if @param callbackfn will be called for each event instead of returning them in array.
  Be careful because the callback is called with the copy of the eventMessage itself, and therefore any changes you do to them will be reflected in the memory
  */
  this.getLastTimeEvents = function(timeRangeStart, modularize = false, callbackfn = false) {
    // console.log(timeRangeStart);
    // console.log("GLSTEV");
    if (modularize) {
      if (isNaN(modularize) || modularize === true) modularize = timeRangeStart;
    }
    var breakCondition = false;
    var ret = [];
    var currNode = fifo.lastEntry;
    while (!breakCondition) {
      // console.log("!BRKCON");
      if (isMemEventComplete(currNode.value)) {
        var tStart = [currNode.value.starts[0], currNode.value.starts[1]];
        // console.log("EVAL!",tStart[0],"vs",timeRangeStart[0]);
        if (tStart[0] == timeRangeStart[0]) {
          breakCondition = tStart[1] < timeRangeStart[1];
        } else if (tStart[0] < timeRangeStart[0]) {
          breakCondition = true;
        }else{
          if (modularize) {
            tStart[0] %= modularize[0];
            tStart[1] %= modularize[1];
          }
          if (callbackfn) {
            callbackfn(currNode.value);
          } else {
            if(!ret[tStart]) ret[tStart]=[];
            ret[tStart].push(currNode.value);
          }
        }

      }else{
        throw ("bad event",currNode.value);
      }
      currNode = fifo.prev(currNode);
      // console.log("CURRNO", currNode);
      breakCondition |= currNode === null;
      if(currNode === null)console.log("BRKCON c");
    }
    if (!callbackfn) return ret;
  }
  /** */
  this.clockFunction = function(_currentHistoricStep, _currentMicroStep) {
    self.clock.microStep = _currentMicroStep;
    self.clock.historicStep = _currentHistoricStep;
  }
  /***/
  this.setExternalClock = function(externalClock) {
    self.clock = externalClock;
    self.clockFunction = function() {};
  }
}
module.exports = NoteLogger;