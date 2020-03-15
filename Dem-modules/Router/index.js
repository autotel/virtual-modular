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


var Router = function (properties,environment) {
  Base.call(this,properties,environment);
  this.preventBus=true;
  var noteOnTracker = [];

  var settings = this.settings = {
    routerNum:{
      value:properties.routerNum||2
    }
  }
  
  let routeBitmap = this.routeBitmap = {
    value: properties.bitmap || 0b1000010000100001,
  }

  /** @param {EventMessage} evt */
  function getOutputsOf(evt){
    const definer=evt.value[settings.routerNum.value] % 4;
    const bitmap=routeBitmap.value;
    const ret=[];
    for(let opt=0; opt<4; opt++){
      const shift = definer*4;
      //console.log((bitmap>>shift).toString(2),(1<<opt).toString(2))
      ret[opt]=((bitmap>>shift) & 1<<opt) > 0;
    }
    return ret;
  }

  
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
    /*if (evt.eventMessage.value[0] == headers.record) {
      var event = evt.eventMessage;
      event.value.shift();
      memory.add(event);
    }*/
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

  var specialOutputFunction = function (eventMessage, overrideMute, properties={}) {
    let chan=0;
    const outputList=getOutputsOf(eventMessage);
    if ((!self.mute) || overrideMute) {
      outputs.forEach(function (tModule) {
        if (outputList[chan]) {
          var evMesClone=eventMessage.clone();
          tModule.messageReceived({ eventMessage: evMesClone, origin: self });
          self.handle('>message', { origin: self, destination: tModule, val: evMesClone});
        }
        chan++;
        chan %= 4;
      })
    }
  }

  this.output=function(eventMessage,overrideMute,properties={}){
    //if(self.routeMode.value==0){
      specialOutputFunction(eventMessage,overrideMute,properties);
    //}else{
      //normalOutputFunction(eventMessage,overrideMute);
    //}
  }
  this.on("+connection",updateOutputs);
  this.on("-connection",updateOutputs);
  this.on(">message", function (evt) {
    if (evt.val.value[0] == headers.triggerOn) {
      noteOnTracker[evt.val.value[1]] = evt;
    }
  });

  this.messageReceived = function (evt) {
    if (evt.eventMessage.value[0] == headers.triggerOff) {
      var tracked = noteOnTracker[evt.eventMessage.value[1]];
      if (tracked)
          self.output(evt.eventMessage, false, tracked);
    } else {
      self.output(evt.eventMessage);
    }
  }

  this.handleStepsChange = function () {
    self.handle('~module', { steps: runningNotes.length });
  }

};

Router.color = [125, 0, 233];
module.exports = Router;
