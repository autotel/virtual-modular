'use strict';

var EventMessage = require('../../Polimod/datatypes/EventMessage.js');
var NoteOnTracker = require('../moduleUtils/NoteOnTracker.js');

var InterfaceX16 = false;//require('./InterfaceX16');

/**
@constructor ModuleSingleton
singleton, only one per run of the program
every module needs to run at the beginning of the runtime to register it's interactor in the interactionManager

*/
var headers = EventMessage.headers;

const Base= require("../Base");

var instances = 0;
var getName = function() {
  this.name = this.baseName + " " + instancesCount;
  instancesCount++;
}
/**
@constructor
the instance of the of the module, ment to be instantiated multiple times.
require to moduleBase.call
*/
var Bouncer = function(properties,environment) {
  this.preventBus=true;
  //maybe the operator should allow layering of many operation layers, also adding timing operations

  var self = this;

  Base.call(this,properties,environment);
  this.name=this.constructor.name+instances++;
  if (properties.name) this.name = properties.name;

  var baseEventMessage=this.baseEventMessage=new EventMessage({value:[0,0,0,0]});


  if (properties.name) this.name = properties.name;

  var noteOnTracker = new NoteOnTracker(this);

  
  this.bounce = function (eventMessage) {
    self.outputs.forEach(function (tModule) {
      var recordEventMessage = eventMessage.clone();
      recordEventMessage.value.unshift(headers.record);
      tModule.recordingReceived({ eventMessage: recordEventMessage, origin: self });
    });
  }

  this.messageReceived = function(evt) {
    // var eventMessage=evt.eventMessage;
    self.handle('received',evt.eventMessage);
    // var recordEventMessage=eventMessage.clone();
    // recordEventMessage.value.unshift(headers.record);
    self.bounce(evt.eventMessage);
  }

  // this.onRemove = function() {
  //   this.interfaces=false;
  //   noteOnTracker.empty(function(noteOff){
  //     self.output(noteOff);
  //   });
  //   return true;
  // }
}
Bouncer.color = [255, 0, 255];
module.exports = Bouncer;