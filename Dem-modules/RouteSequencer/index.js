'use strict';
var EventMessage = require('../../Polimod/datatypes/EventMessage.js');
const Base= require("../Base");
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


var RouteSequencer = function (properties,environment) {
  Base.call(this,properties,environment);

  if(properties.preventBus) this.preventBus=true;

  var noteOnTracker = [];

  var settings = this.settings = {
    // feedback:{
    //   value:0,
    //   valueNames:['no','yes'],
    // },
    sendClock:properties.sendClock||false
  }
  this.routeMode={
    value: 0,
    valueNames:['outputs','inputs'],
  }
  if(properties.routeMode=="inputs") this.routeMode.value=1
  if(properties.routeMode=="outputs") this.routeMode.value=0

  let clock = this.clock = {
    substep: 0,
    step: 0,
    substeps: 1
  }
  let sequenceBitmap = this.sequenceBitmap = {
    value: properties.bitmap || 0,
  }

  this.baseName = "RouteSequencer";
  
  
  var self = this;

  
  

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
  var inputs = self.getInputs();
  var updateInputs=function(){
    inputs=self.getInputs();
  }

  var normalOutputFunction=this.output;

  var specialOutputFunction = function (_eventMessage, overrideMute, properties={}) {

    if ((!self.mute) || overrideMute) {
        var eventMessage=_eventMessage;


      self.enqueue(function(){
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
              self.handle('>message', { origin: self, destination: tModule, val: evMesClone});
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
  this.on("+connection",updateOutputs);
  this.on("-connection",updateOutputs);
  this.on(">message", function (evt) {
    if (evt.val.value[0] == headers.triggerOn) {
      noteOnTracker[evt.val.value[1]] = evt;
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
      if(self.routeMode.value==1){
        updateInputs();
        //-1 so that bus input is not counted
        var inputn=inputs.indexOf(evt.origin)-1;
        if (sequenceBitmap.value & (1 << (clock.step + inputn * 4))) {
          // console.log("input n",inputn);
          self.output(evt.eventMessage);
        }

      }else{
        self.output(evt.eventMessage);
      }
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
