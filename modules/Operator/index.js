'use strict';

var EventMessage = require('../../datatypes/EventMessage.js');
var NoteOnTracker = require('../moduleUtils/NoteOnTracker.js');

var InterfaceX16 = require('./InterfaceX16');

/**
@constructor ModuleSingleton
singleton, only one per run of the program
every module needs to run at the beginning of the runtime to register it's interactor in the interactionManager

*/
var CLOCKTICKHEADER = 0x00;
var TRIGGERONHEADER = 0x01;
var TRIGGEROFFHEADER = 0x02;
var RECORDINGHEADER = 0xAA;
var TRIGGERCHANGEVALUESHEADER = 0X03;
var TRIGGERCHANGEOPERATIONHEADER = 0x04;
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
var Operator = function(properties) {

  //maybe the operator should allow layering of many operation layers, also adding timing operations

  var self = this;
  this.preventBus=true;
  this.color = [255, 0, 255];
  this.baseName = "Operator";

  var baseEventMessage=this.baseEventMessage=new EventMessage({value:[0,0,0,0]});

  var operationEventMessage=new EventMessage({value:[TRIGGERCHANGEOPERATIONHEADER,0,0,0,0]});
  var valuesEventMessage=new EventMessage({value:[TRIGGERCHANGEVALUESHEADER,0,0,0,0]});

  let opMap = this.opMap=[0,0,0,0];
  operationEventMessage.update=function(){
    console.log(this);
    for(var n in opMap){
      this.value[n+1]=opMap[n];
    }
  }

  valuesEventMessage.update=function(){
    console.log(this);
    for(var n in opMap){
      this.value[n+1]=baseEventMessage.value[n];
    }
  }

  testGetName.call(this);

  if (properties.name) this.name = properties.name;

  var noteOnTracker = new NoteOnTracker(this);

  this.interfaces.X16 =  InterfaceX16;
  this.ops={
    "none":function(signal){
      return signal;
    },
    "=":function(signal,value){
      return value
    },
    "+":function(signal,value){
      return signal+value
    },
    "*":function(signal,value){
      return signal*value;
    },
    "%":function(signal,value){
      return signal%value;
    }
  }
  //make lookup arrays
  this.opNames=[];
  var opFns=this.opFns=[];
  this.availOps=0;
  for(var n in this.ops){
    this.opNames.push(n);
    this.opFns.push(this.ops[n]);
    this.availOps++;
  }

  this.triggerOperationChange=function(){
    // operationEventMessage.update();
    // self.recordOutput(operationEventMessage);
  }
  this.triggerValueChange=function(){
    // valuesEventMessage.update();
    // self.recordOutput(valuesEventMessage);
  }

  this.eventReceived = function(evt) {
    var inEvt=evt.eventMessage;
    var outEvt=inEvt.clone();
    if(inEvt.value[0]==RECORDINGHEADER){
      inEvt.value.shift();
      for(var a in inEvt.value){
        baseEventMessage.value[a]=inEvt.value[a];
      }
    }else{
      if(inEvt.value[0]==TRIGGEROFFHEADER){
        var noteTrackerKey=[inEvt.value[1],inEvt.value[2]];
        // console.log(noteTrackerKey);
        noteOnTracker.ifNoteOff(noteTrackerKey,function(noteOff){
          self.output(noteOff);
          // console.log("NOFF",noteOff.value);
        });
      }

      for(var n in opMap){
        if(opMap[n]){
          outEvt.value[n]=opFns[opMap[n]](inEvt.value[n],baseEventMessage.value[n]);
        }
      }

      if(inEvt.value[0]==TRIGGERONHEADER){
        var noteTrackerKey=[inEvt.value[1],inEvt.value[2]];
        noteOnTracker.add(outEvt,noteTrackerKey);
      }

      self.output(outEvt);
    }
  }
  this.delete = function() {
    for(let a in opMap){
      opMap[a]=0;
    }
    noteOnTracker.empty(function(noteOff){
      // console.log("NOFF",noteOff.value);
      self.output(noteOff);
    });
    return true;
  }
}

module.exports = Operator