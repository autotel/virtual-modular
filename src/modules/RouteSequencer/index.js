'use strict';
var EventMessage = require('../../datatypes/EventMessage.js');
var InterfaceX16 = require('./InterfaceX16');
var InterfaceHttp = require('./InterfaceHttp');
// var clockSpec=require('../standards/clock.js');
var headers = EventMessage.headers;

var testcount = 0;
var testGetName = function () {
  this.name = this.baseName + " " + testcount;
  testcount++;
}
/**
 @constructor
 the instance of the of the module, ment to be instantiated multiple times.
 require to moduleBase.call
 */


var RouteSequencer = function (properties) {
  var thisInstance = this;
  var myBitmap = 0;

  var noteOnTracker = [];

  var settings = this.settings = {
    // feedback:{
    //   value:0,
    //   valueNames:['no','yes'],
    // },
    sendClock:false
  }
  this.routeMode={
    value: 0,
    valueNames:['outputs','inputs'],
  }

  let clock = this.clock = {
    substep: 0,
    step: 0,
    substeps: 1
  }
  let sequenceBitmap = this.sequenceBitmap = {
    value: properties.bitmap || 0,
  }

  this.baseName = "RouteSequencer";
  testGetName.call(this);
  if (properties.name) this.name = properties.name;
  var self = this;

  this.interfaces.X16 = InterfaceX16;
  this.interfaces.Http = InterfaceHttp;

  var memory = new Set();
  var recMessages = {
    rate: new EventMessage({ value: [headers.changeRate, 12, -1] })
  }
  this.recordRate = function () {
    recMessages.rate.value[2] = settings.delayMicro.value;
    self.recordOutput(recMessages.rate);
  }
  this.recordingReceived = function (evt) {
    if (evt.eventMessage.value[0] == headers.record) {
      var event = evt.eventMessage;
      event.value.shift();
      memory.add(event);
    }
    //backpropagate rec messages
  }

  var outputs = self.getOutputs();
  var updateOutputs = function () {
    outputs = self.getOutputs();
  }

  var normalOutputFunction=this.output;

  var specialOutputFunction = function (eventMessage, overrideMute, properties={}) {
    updateOutputs();
    if ((!self.mute) || overrideMute) {
      self.enqueue(function () {
        var chan = 0;
        if (properties.destination) {
          if (self.outputs.has(properties.destination)) {
            properties.destination.messageReceived({ eventMessage: eventMessage.clone(), origin: self });
          }
        } else {
          outputs.forEach(function (tModule) {
            if (sequenceBitmap.value & (1 << (clock.step + chan * 4))) {
              var evMesClone=eventMessage.clone();
              tModule.messageReceived({ eventMessage: evMesClone, origin: self });
              self.handle('>message', { origin: self, destination: tModule, val: evMesClone, eventMessage: evMesClone });
            }
            chan++;
            chan %= 4;
          })
        }
      });
    }
  }

  this.output=function(eventMessage,overrideMute,properties={}){
    if(self.routeMode.value==0){
      specialOutputFunction(eventMessage,overrideMute,properties);
    }else{
      normalOutputFunction(eventMessage,overrideMute);
    }
  }

  this.on(">message", function (evt) {
    if (evt.eventMessage.value[0] == headers.triggerOn) {
      noteOnTracker[evt.eventMessage.value[1]] = evt;
    }
  });

  var stepFunction = function () {
    clock.step++;
    clock.step %= 4;
    self.handle('step');
  }

  this.messageReceived = function (evt) {
    if (evt.eventMessage.value[0] == headers.clockTick) {
      var clockBase = evt.eventMessage.value[1];
      var clockMicroStep = evt.eventMessage.value[2];
      if ((clockMicroStep / clock.substeps) % clockBase == 0) {

        clock.substep++;

        // console.log("T",clock);
        if (clock.substep >= clock.substeps) {

          clock.substep = 0;
          stepFunction();
        }
      }
      if (settings.sendClock){
        self.output(evt.eventMessage);
      }
    } else if (evt.eventMessage.value[0] == headers.triggerOff) {
      var tracked = noteOnTracker[evt.eventMessage.value[1]];
      if (tracked)
          self.output(evt.eventMessage, false, tracked);
    } else {

      self.output(evt.eventMessage);
    }
  }

  // this.onRemove = function () {
  //   noteOnTracker.empty(function (noff) {
  //     thisInstance.output(noff, true);
  //   });
  //   return true;
  // }

  this.handleStepsChange = function () {
    self.handle('~module', { steps: runningNotes.length });
  }

};

RouteSequencer.color = [125, 0, 233];
module.exports = RouteSequencer;
