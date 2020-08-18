'use strict';
var NoteOnTracker = require('../moduleUtils/NoteOnTracker.js');
var EventMessage = require('../../Polimod/datatypes/EventMessage.js');
const Base= require("../Base");
function valueOrDefault(value,defaultVal){
  return (value===undefined)?defaultVal:value;
}
var headers = EventMessage.headers;

var Narp = function (properties, environment) {
  var self = this;
  Base.call(this,properties,environment);
  var myBitmap = this.bitmap = properties.bitmap||0;
  var currentStep = 0;

  if(!properties) properties={}
  this.properties=properties;
  
  properties.stepDivision = {
    value: valueOrDefault(properties.stepDivision,2)
  }
  let stepDivision= properties.stepDivision;
  properties.noteDuration = {
    value: valueOrDefault(properties.noteDuration,1)
  }
  let noteDuration= properties.noteDuration;
  properties.substep = {
    value: valueOrDefault(properties.substep,0)
  }
  let substep= properties.substep;

  var noteOnTracker = new NoteOnTracker(this);
  this.baseEventMessage=new EventMessage([1,0,0,-1]);
  
  if(properties.eventMessage){
    let intvalues=[];
    for(let n in properties.eventMessage){
      intvalues[n]=parseInt(properties.eventMessage[n]);
      if(isNaN(intvalues[n]))intvalues[n]=-1;
    }
    this.baseEventMessage.set(intvalues);
  }

  this.recordingUi = true;

  var recMessages = {
    set: new EventMessage({ value: [headers.triggerOn, -1, -1] }),
    clear: new EventMessage({ value: [headers.triggerOff, -1, -1] }),
    rate: new EventMessage({ value: [headers.changeRate, 12, -1] }),
  }

  this.recordStepDivision = function () {
    recMessages.rate.value[2] = stepDivision.value * 12;
    self.recordOutput(recMessages.rate);
  }

  
  // 

  var setStep = this.setStep = function (square, uiTriggered = false) {
    myBitmap |= 1 << square;
    if (self.recordingUi && uiTriggered) {
      recMessages.set.value[1] = square;
      self.recordOutput(recMessages.set);
      // console.log("RECO");
    }
    self.handle('~bitmap', { bmp: myBitmap, operation: "+" });
    self.handleStepsChange();
  }

  var clearStep = this.clearStep = function (square, uiTriggered = false) {
    myBitmap &= ~(1 << square);
    if (self.recordingUi && uiTriggered) {
      recMessages.clear.value[1] = square;
      self.recordOutput(recMessages.clear);
      // console.log("RECO");
    }
    self.handle('~bitmap', { bmp: myBitmap, operation: "-" });
    self.handleStepsChange();
  }

  var toggleStep = this.toggleStep = function (square, uiTriggered = false) {
    if (myBitmap & (1 << square)) {
      clearStep(square, uiTriggered);
    } else {
      setStep(square, uiTriggered);
    }
    return myBitmap;
  }

  var clearAll = this.clearAll = function () {
    myBitmap = 0;
    self.handle('~bitmap', { bmp: myBitmap, operation: "=" });
  }

  this.handleStepsChange = function () {
    var active = activeNumbers();
    self.handle('~module', { steps: active.length });
  }

  var generatedOutput = function (eventMessage, buttonNumber) {
    if (self.mute) return;
    eventMessage.life = Math.ceil(noteDuration.value);
    
    if(eventMessage.value[0]==EventMessage.headers.triggerOn){
      noteOnTracker.add(eventMessage);
    }
    self.output(eventMessage);
  }

  var headerBmp = 0;
  var stepFunction = function () {
    var active = activeNumbers();
    if (active.length) {
      currentStep %= active.length;
      var loneBit = myBitmap & (1 << active[currentStep]);
      headerBmp = loneBit;
      // console.log(currentStep);
      // console.log(loneBit.toString(2));
      if (loneBit) {
        var op = Math.log2(loneBit);
        // console.log(op);

        let outputMessage = self.baseEventMessage.clone();
        outputMessage.value[1] = self.baseEventMessage.value[1] + op;

        generatedOutput(outputMessage, op);

        self.handle('step', {
          step: currentStep,
          generated: op,
          bmp: loneBit,
        });
      }
      currentStep++;
    } else {
      headerBmp = 0;
    }
  }
  var activeNumbers = function () {
    var keepGoing = myBitmap;
    var ret = [];
    var count = 0;
    while (keepGoing > 0) {
      if (1 & keepGoing) {
        ret.push(count);
      }
      count++;
      keepGoing = keepGoing >> 1;
    }
    return ret;
  }
  this.messageReceived = function (evt) {
    if (evt.eventMessage.value[0] == headers.clockTick) {
      var clockBase = evt.eventMessage.value[1];
      var clockMicroStep = evt.eventMessage.value[2];
      if ((clockMicroStep / stepDivision.value) % clockBase == 0) {
        substep.value++;
        if (substep.value >= stepDivision.value) {
          substep.value = 0;
          stepFunction();
        }
      }
      noteOnTracker.each(function (noteOff, identifier) {
        noteOff.life -= 1 / clockBase;
        // console.log("LF",noteOff.life);
        if (noteOff.life <= 0) {
          self.output(noteOnTracker.noteOff(identifier));
        }
      });
    } else if (evt.eventMessage.value[0] == headers.triggerOn) {
      this.setStep(evt.eventMessage.value[1] % 16);
    } else if (evt.eventMessage.value[0] == headers.triggerOff) {
      this.clearStep(evt.eventMessage.value[1] % 16);
    } else if (evt.eventMessage.value[0] == headers.changeRate) {
      // console.log("CHANGERATEHEAER",evt.eventMessage.value);
      stepDivision.value = evt.eventMessage.value[2] / (evt.eventMessage.value[1] || 1);
    } 
  }
  this.getBitmaps16 = function () {
    return {
      steps: myBitmap,
      header: headerBmp & myBitmap
    };
  }

  // this.onRemove = function () {
  //   noteOnTracker.each(function (noteOff, identifier) {
  //     self.output(noteOff, false);
  //   });
  //   noteOnTracker.empty();
  //   clearAll();
  //   return true;
  // }
}

Narp.color = [100, 0, 190];
module.exports = Narp