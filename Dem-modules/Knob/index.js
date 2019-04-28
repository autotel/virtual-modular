'use strict';

var EventMessage = require('../../Polimod/datatypes/EventMessage.js');
var NoteOnTracker = require('../moduleUtils/NoteOnTracker.js');

const Base= require("../Base");

var headers = EventMessage.headers;
var instancesCount = 0;
var testGetName = function () {
  this.name = this.baseName + " " + instancesCount;
  instancesCount++;
}
/**
@constructor
the instance of the of the module, ment to be instantiated multiple times.
require to moduleBase.call
*/
var Knob = function (properties) {

  //maybe the Knob should allow layering of many operation layers, also adding timing operations
  Base.call(this,properties,environment);

  var self = this;
  this.preventBus = true;
  this.baseName = "Knob";

  

  

  
  
  this.triggerOperationChange = function () {
    // operationEventMessage.update();
    // self.recordOutput(operationEventMessage);
  }
  
  this.messageReceived = function (evt) {

  }

  this.onRemove = function () {
    return true;
  }
}

Knob.color = [255, 0, 255];
module.exports = Knob