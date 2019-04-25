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


var CalculeitorMidi = function (properties) {
  this.preventBus = true;
  this.baseName = "CalculeitorMidi";
  this.color = CalculeitorMidi.color;
  Base.call(this,properties,environment);
  this.name=this.constructor.name+instances++;
  if (properties.name) this.name = properties.name;
  var self = this;

  var defaultMessage = new EventMessage({
    value: [0, 36, 0, 90]
  });


  var outputHardwares = this.outputHardwares = new Set();

  this.interfaces.X16 = InterfaceX28;

  var noteOnTracker = {}

  function sendMidi(midiOut){
    self.handle("midiOut");
    outputHardwares.forEach(function(hardware){
      // console.log("HW",hardware);
      hardware.sendMidi(midiOut);
    });
  }

  this.messageReceived = function (evt) {
    if (self.mute) return;
    evt.eventMessage.underImpose(defaultMessage);
    var midiOut = EventMessage.toMidi(evt.eventMessage);
    if (midiOut)
      sendMidi(midiOut);
    else
      console.warn("midiout is ", midiOut);
  }


};

CalculeitorMidi.color = [120, 100, 130];
module.exports = CalculeitorMidi;