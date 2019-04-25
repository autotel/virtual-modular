'use strict';
var NoteOnTracker = require('../moduleUtils/NoteOnTracker.js');
var EventMessage = require('../../Polimod/datatypes/EventMessage.js');
const Base= require("../Base");


// var InterfaceHttp = require('./HttpGui');
// var clockSpec=require('../standards/clock.js');
var headers = EventMessage.headers;
/**
@constructor ModuleSingleton
singleton, only one per run of the program
every module needs to run at the beginning of the runtime to register it's interactor in the interactionManager

*/

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
var Noise = function (properties, environment) {
  var self = this;
  var myBitmap = this.bitmap = 0;
  Base.call(this,properties,environment);
  var patMem = new Set();
  var currentStep = 0;
  var stepDivision = this.stepDivision = {
    value: 2
  }
  var probability = this.probability={
    value:1,
    nameFunction(thisVar){
      return thisVar.value*100+"%";
    },
    changeFunction(thisVar,delta){
      thisVar.value+=delta*0.01;
      thisVar.value = Math.round(thisVar.value * 100) / 100;
    }
  }

  var noteDuration = this.noteDuration = {
    value: 1
  }

  var noteOnTracker = new NoteOnTracker(this);
  var substep = 0;

  this.baseName = "Noise";
  testGetName.call(this);
  if (properties.name) this.name = properties.name;

  var baseEventMessage = this.baseEventMessage = new EventMessage({
    value: [headers.triggerOn, 0, -1, -1]
  });


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
    patMem.add(square);
    if (self.recordingUi && uiTriggered) {
      recMessages.set.value[1] = square;
      self.recordOutput(recMessages.set);
      // console.log("RECO");
    }
    self.handleStepsChange();
  }

  var clearStep = this.clearStep = function (square, uiTriggered = false) {
    patMem.delete(square);
    if (self.recordingUi && uiTriggered) {
      recMessages.clear.value[1] = square;
      self.recordOutput(recMessages.clear);
      // console.log("RECO");
    }
    self.handleStepsChange();
  }

  var toggleStep = this.toggleStep = function (square, uiTriggered = false) {
    if (patMem.has(square)) {
      clearStep(square, uiTriggered);
    } else {
      setStep(square, uiTriggered);
    }
    return myBitmap;
  }

  var clearAll = this.clearAll = function () {
    patMem.clear();
    self.handleStepsChange();
  }

  this.handleStepsChange = function () {
    activeNumbers();
    self.handle('~module', { steps: patMem.size });
  }

  var generatedOutput = function (eventMessage) {
    if (self.mute) return;
    eventMessage.life = Math.ceil(noteDuration.value);
    noteOnTracker.add(eventMessage);
    self.output(eventMessage);
  }

  var headerBmp = 0;
  var stepFunction = function () {
    var active = patMem.size;
    
    if (active) {
      
      var selectedNumber=0;
      
      var avail=Array.from(patMem);
      
      if (probability.value<1)
        if (Math.random() > probability.value){
          headerBmp=0;
          return;
        }

      selectedNumber=avail[Math.floor(Math.random()*avail.length)];
      // console.log(avail);
      // console.log(selectedNumber);

      let outputMessage = baseEventMessage.clone();
      outputMessage.value[1] = baseEventMessage.value[1] + selectedNumber;

      generatedOutput(outputMessage);

      self.handle('step', {
        step: currentStep,
        generated: selectedNumber
      });

      headerBmp=1<<selectedNumber;
      currentStep++;
    } else {
      headerBmp = 0;
    }
  }
  var activeNumbers = function () {
    myBitmap=0;
    patMem.forEach(function(index,value){
      myBitmap|=1<<index;
    });
    self.handle('~bitmap', { bmp: myBitmap });
    
  }
  this.messageReceived = function (evt) {
    if (evt.eventMessage.value[0] == headers.clockTick) {
      var clockBase = evt.eventMessage.value[1];
      var clockMicroStep = evt.eventMessage.value[2];
      if ((clockMicroStep / stepDivision.value) % clockBase == 0) {
        substep++;
        if (substep >= stepDivision.value) {
          substep = 0;
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

Noise.color = [100, 80, 190];
module.exports = Noise