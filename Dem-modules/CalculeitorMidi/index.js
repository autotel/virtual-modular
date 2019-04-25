'use strict';
var EventMessage = require('../../Polimod/datatypes/EventMessage.js');
const Base= require("../Base");
let instances=0;
var CalculeitorMidi = function (properties,environment) {
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