'use strict';
var Recorder = require('./sequencerGuts/record.js');
// var clockSpec=require('../standards/clock.js');
var InteractorX16=require('./InteractorX16');
var InteractorX28=require('./InteractorX28');
var CLOCKTICKHEADER = 0x00;
var TRIGGERONHEADER = 0x01;
var TRIGGEROFFHEADER = 0x02;
var CLOCKABSOLUTEHEADER = 0x03;

var RECORDINGHEADER = 0xAA;
var RECORDINGSTATUSHEADER = 0xAB;

var EventMessage = require('../../datatypes/EventMessage.js');
const sequencerFunctions = require("./sequencerGuts");
/**
Sequencer
TODO: module naming functions should be a static property, and thus defaults to "name+number"
*/
var testcount = 0;
var testGetName = function() {
  this.name = baseName + " " + testcount;
  testcount++;
}
var baseName = "sequencer";

var Sequencer = function(properties,environment) {
  testGetName.call(this);
  if (properties.name) this.name = properties.name;

  var currentStep = {
    value: 0
  };
  this.currentStep = currentStep;
  var recorder = new Recorder(this);
  var self = this;
  this.patData = {};
  var currentModulus = 16;
  this.loopLength = {
    value: 16
  };
  this.stepLength = {
    value: 12
  }
  this.listenTransport = {
    value:false
  }
  this.recordSettings={
    mode:3,
    namesList:['overdub','grow','fold','grow & trim'/*,stop*/],
    growStep:16,
    recording:false,
    switchOnEnd:0,
  }
  let recordSettings=this.recordSettings;

  this.noteLenManager = sequencerFunctions.NoteLenManager(this);
  var patchMem = sequencerFunctions.PatchMem(this);
  //import "gut" functions to my own;
  //I don't use an iterator to have more clear control of the namespace
  //but in some text tools you can always multiline edit
  this.store = patchMem.store;
  this.loopDisplace = patchMem.loopDisplace;
  this.storeNoDup = patchMem.storeNoDup;
  this.clearStepNewest = patchMem.clearStepNewest;
  this.clearStepOldest = patchMem.clearStepOldest;
  this.clearStep = patchMem.clearStep;
  this.clearStepByFilter = patchMem.clearStepByFilter;
  this.getBoolean = patchMem.getBoolean;
  this.stepDivide = patchMem.stepDivide;
  this.microStep = patchMem.microStep;
  this.microStepDivide = patchMem.microStepDivide;
  this.microStepDisplace = patchMem.microStepDisplace
  // this.eachFold=patchMem.eachFold;
  // this.getThroughfoldBoolean=patchMem.getThroughfoldBoolean;
  this.clearStepRange = patchMem.clearStepRange;
  this.duplicateSequence = patchMem.duplicateSequence;
  this.offsetSequence = patchMem.offsetSequence;
  this.sequenceBounds = patchMem.sequenceBounds;
  // this.getBitmapx16=patchMem.getBitmapx16;
  this.step = patchMem.step;
  this.restart = patchMem.restart;
  this.stepAbsolute = patchMem.stepAbsolute;
  this.playing = patchMem.playing;
  // this.stepIncremental=patchMem.stepIncremental;
  this.stepMicro = patchMem.stepMicro;
  var thisInstance = this;

  this.compensatedOffsetSequence=function(steps){
    self.offsetSequence(steps);
    currentStep.value+=steps;
  }
  this.trimSequence=function(grid=1,inner=false){
    var bounds=self.sequenceBounds();

    bounds.start-=bounds.start%grid;
    bounds.end-=bounds.end%grid;

    if(inner){
      bounds.start+=grid;
    }else{
      bounds.end-=grid;
    }
    self.loopLength.value=bounds.end;

    console.log("trim from step",bounds.start);
    if(bounds.start>0){
      self.compensatedOffsetSequence(-bounds.start);
    }
  }

  this.onPatchStep = function(evt) {
    if (recordSettings.recording) {
      if (currentStep.value >= self.loopLength.value-2) {
        switch (recordSettings.mode) {
          case 1:{
              // console.log("Grow ");
              self.loopLength.value += recordSettings.growStep;
              break;
            } case 2:{
              // console.log("Fold");
              self.loopLength.value *= 2;
              break;
            } case 3:{
              // console.log("Fold");
              self.loopLength.value += recordSettings.growStep;
              break;
            }/*case :{
              console.log("Stop");
              controlledModule.loopLength.value *= 2;
              break;
            }*/
            // default: console.log("overdub");
        }
      }
    }
    this.handle('step', evt);
  }

  this.play = function() {
    thisInstance.playing.value = true;
    // thisInstance.restart();
  }
  this.stop = function() {
    thisInstance.playing.value = false;
  }
  /**


  # module interpretation of eventMessages:
  [header,data1,data2]
  * Header is 0: eventMessage is a clock tick
    * A indicates how many clocks makes one step. i.e. source clock rate is bpm*4
    * B indicates what clock number is the current clock number
  * Header is 1: set the playhead to a position indicated by data2, set the state to play (not implemented yet)
  * Header is 2: stop playing (not implemented yet)
  * Header is 3: jump playhead to position indicated by data 2, but don't change the playing state (not implemented yet)

  * Header is 70: request of stored data, it will trigger a data response. Not implemented yet

  */


  // x71: data response
  this.eventReceived = function(event) {
    var evt = event.eventMessage;
    // if(evt.value[0]!=CLOCKTICKHEADER) console.log(evt);
    // console.log(evt.value);
    switch (evt.value[0]) {
      case CLOCKTICKHEADER:{
        // console.log("sq:CLOCKTICKHEADER");
        thisInstance.stepMicro(evt.value[1], evt.value[2]);
        thisInstance.lastMicroStepBase=evt.value[1];
        // console.log("0 stepMicro("+evt.value[1]+","+evt.value[2]+");");
        break;
      }
      case TRIGGERONHEADER:{
        // console.log("sq:TRIGGERONHEADER");
        thisInstance.stepAbsolute(evt.value[2]);
        if(self.listenTransport.value){
          thisInstance.play();
        }
        // console.log("1 thisInstance.stepAbsolute("+evt.value[1]+");");
        break;
      } case TRIGGEROFFHEADER: {
        // console.log("sq:TRIGGEROFFHEADER");
        if(self.listenTransport.value){
          thisInstance.stop();
        }
        // console.log("2 stop");
        break;
      } case CLOCKABSOLUTEHEADER: {
        // console.log("sq:CLOCKABSOLUTEHEADER");
        thisInstance.stepAbsolute(evt.value[1]);
        // console.log("3 thisInstance.stepAbsolute("+evt.value[1]+");");
        break;
      } case 0x04: {
        thisInstance.stepAbsolute(evt.value[1]);
        break;
      } case RECORDINGHEADER: {
        // console.log("sq:RECORDINGHEADER");
        // console.log(evt.value);
        // console.log("REC");
        evt.value.shift();
        // console.log(evt.value[0]);
        if (evt.value[0] == TRIGGERONHEADER) {
          recorder.recordNoteStart([evt.value[1],evt.value[2]], evt);
          // console.log("ON",[evt.value[1],evt.value[2]]);
        } else if (evt.value[0] == TRIGGEROFFHEADER) {
          recorder.recordNoteEnd([evt.value[1],evt.value[2]]);
        } else {
          recorder.recordSingularEvent(evt);
        }
        // thisInstance.recorder.start();
        break;
      } case RECORDINGSTATUSHEADER: {
        recordSettings.recording=evt.value[1];
        if(!recordSettings.recording){
          if(recordSettings.mode==3){
            if(self.loopLength.value>recordSettings.growStep){
              self.loopLength.value-=recordSettings.growStep;
            }
            self.trimSequence(recordSettings.growStep/2,true);
          }
          if(recordSettings.switchOnEnd!==false){
            recordSettings.mode=recordSettings.switchOnEnd;
          }
        }
        // console.log("RECSTATUS",evt.value);
        break;
      }
    this.handle('receive', evt);
    }
  }
  this.interfaces.X16=new InteractorX16(this,environment);
  this.interfaces.X28=new InteractorX28(this,environment);

}
module.exports = Sequencer