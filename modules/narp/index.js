'use strict';
var NoteOnTracker = require('../moduleUtils/NoteOnTracker.js');
var EventMessage = require('../../datatypes/EventMessage.js');

var InterfaceX16 = require('./InterfaceX16');
// var InterfaceHttp = require('./HttpGui');
// var clockSpec=require('../standards/clock.js');
var CLOCKTICKHEADER = 0x00;
var TRIGGERONHEADER = 0x01;
var TRIGGEROFFHEADER = 0x02;
var CHANGERATEHEADER = 0x04;
var RECORDINGHEADER = 0xAA;
/**
@constructor ModuleSingleton
singleton, only one per run of the program
every module needs to run at the beginning of the runtime to register it's interactor in the interactionManager

*/

var instancesCount = 0;
var testGetName = function() {
  this.name = this.baseName + " " + instancesCount;
  instancesCount++;
}
/**
@constructor
the instance of the of the module, ment to be instantiated multiple times.
require to moduleBase.call
*/
var Narp = function(properties,environment) {
  var self = this;
  var myBitmap = this.bitmap = 0;
  var currentStep = 0;
  var stepDivision = this.stepDivision = {
    value: 2
  }

  var noteDuration = this.noteDuration = {
    value: 1
  }

  var noteOnTracker = new NoteOnTracker(this);
  var substep = 0;

  this.baseName = "narp";
  testGetName.call(this);
  if (properties.name) this.name = properties.name;

  var baseEventMessage = this.baseEventMessage = new EventMessage({
    value: [TRIGGERONHEADER, -1, -1, -1]
  });


  this.recordingUi=true;

  var recMessages = {
    set:new EventMessage({value:[TRIGGERONHEADER,-1,-1]}),
    clear:new EventMessage({value:[TRIGGEROFFHEADER,-1,-1]}),
    rate:new EventMessage({value:[CHANGERATEHEADER,12,-1]}),
  }

  this.recordStepDivision=function(){
    recMessages.rate.value[2]=stepDivision.value*12;
    self.recordOutput(recMessages.rate);
  }

  this.interfaces.X16 = InterfaceX16;
  // this.interfaces.Http = InterfaceHttp;

  var setStep = this.setStep = function(square,uiTriggered=false) {
    myBitmap |= 1 << square;
    if(self.recordingUi&&uiTriggered){
      recMessages.set.value[2]=square;
      self.recordOutput(recMessages.set);
      // console.log("RECO");
    }
    self.handle('~ bitmap',{bmp:myBitmap,operation:"+"});
    self.handleStepsChange();
  }

  var clearStep = this.clearStep = function(square,uiTriggered=false) {
    myBitmap &= ~(1 << square);
    if(self.recordingUi&&uiTriggered){
      recMessages.clear.value[2]=square;
      self.recordOutput(recMessages.clear);
      // console.log("RECO");
    }
    self.handle('~ bitmap',{bmp:myBitmap,operation:"-"});
    self.handleStepsChange();
  }

  var toggleStep = this.toggleStep = function(square,uiTriggered=false) {
    if(myBitmap&(1<<square)){
      clearStep(square,uiTriggered);
    }else{
      setStep(square,uiTriggered);
    }
    return myBitmap;
  }

  var clearAll = this.clearAll = function() {

    myBitmap = 0;
    self.handle('~ bitmap',{bmp:myBitmap,operation:"="});
  }

  this.handleStepsChange=function(){
    var active = activeNumbers();
    self.handle('~ module',{steps:active.length});
  }

  var generatedOutput = function(eventMessage, buttonNumber) {
    if (self.mute) return;
    eventMessage.life = Math.ceil(noteDuration.value);
    noteOnTracker.add(eventMessage);
    self.output(eventMessage);
  }

  var headerBmp = 0;
  var stepFunction = function() {
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

        let outputMessage = baseEventMessage.clone();
        outputMessage.value[2] = baseEventMessage.value[2] + op;

        generatedOutput(outputMessage, op);

        self.handle('step', {
          step: currentStep,
          generated: op,
          bmp:loneBit,
        });
      }
      currentStep++;
    } else {
      headerBmp = 0;
    }
  }
  var activeNumbers = function() {
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
  this.messageReceived = function(evt) {
    if (evt.eventMessage.value[0] == CLOCKTICKHEADER) {
      var clockBase = evt.eventMessage.value[1];
      var clockMicroStep = evt.eventMessage.value[2];
      if ((evt.eventMessage.value[2] / stepDivision.value) % clockBase == 0) {
        substep++;
        if (substep >= stepDivision.value) {
          substep = 0;
          stepFunction();
        }
      }
      noteOnTracker.each(function(noteOff, identifier) {
        noteOff.life-=1/clockBase;
        // console.log("LF",noteOff.life);
        if (noteOff.life <= 0) {
          self.output(noteOnTracker.noteOff(identifier));
        }
      });
    } else if (evt.eventMessage.value[0] == TRIGGERONHEADER) {
      this.setStep(evt.eventMessage.value[2] % 16);
    } else if (evt.eventMessage.value[0] == TRIGGEROFFHEADER) {
      this.clearStep(evt.eventMessage.value[2] % 16);
    } else if (evt.eventMessage.value[0] == CHANGERATEHEADER) {
      // console.log("CHANGERATEHEAER",evt.eventMessage.value);
      stepDivision.value=evt.eventMessage.value[2]/(evt.eventMessage.value[1]||1);
    } else if (evt.eventMessage.value[0] == TRIGGEROFFHEADER + 1) {}
  }
  this.getBitmaps16 = function() {
    return {
      steps: myBitmap,
      header: headerBmp & myBitmap
    };
  }

  this.delete = function() {
    noteOnTracker.each(function(noteOff, identifier) {
      self.output(noteOff, false);
    });
    noteOnTracker.empty();
    clearAll();
    return true;
  }
}

Narp.color = [255, 0, 255];
module.exports = Narp