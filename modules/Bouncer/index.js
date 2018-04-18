'use strict';

var EventMessage = require('../../datatypes/EventMessage.js');
var NoteOnTracker = require('../moduleUtils/NoteOnTracker.js');

var InterfaceX16 = false;//require('./InterfaceX16');

/**
@constructor ModuleSingleton
singleton, only one per run of the program
every module needs to run at the beginning of the runtime to register it's interactor in the interactionManager

*/
var CLOCKTICKHEADER = 0x00;
var TRIGGERONHEADER = 0x01;
var TRIGGEROFFHEADER = 0x02;
var RECORDINGHEADER = 0xAA;
var CHORDCHANGEHEADER = 0x03;
var instancesCount = 0;
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

  this.color = [255, 0, 255];
  this.baseName = "Bouncer";

  var baseEventMessage=this.baseEventMessage=new EventMessage({value:[0,0,0,0]});
  getName.call(this);

  if (properties.name) this.name = properties.name;

  var noteOnTracker = new NoteOnTracker(this);

  this.interfaces.X16 =  InterfaceX16;

  this.eventReceived = function(evt) {
    var eventMessage=evt.eventMessage;
    // self.recordOutput(inEvt);
    self.handle('received',eventMessage);
    var recordEventMessage=eventMessage.clone();
    recordEventMessage.value.unshift(RECORDINGHEADER);
    self.output(recordEventMessage);
  }

  this.delete = function() {
    this.interfaces=false;
    noteOnTracker.empty(function(noteOff){
      // console.log("NOFF",noteOff.value);
      self.output(noteOff);
    });
    return true;
  }
}

module.exports = Bouncer;