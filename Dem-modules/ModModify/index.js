'use strict';
var EventMessage = require('../../Polimod/datatypes/EventMessage.js');
const Base= require("../Base");

var NoteOnTracker = require('../moduleUtils/NoteOnTracker.js');
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


var ModModify = function (properties) {
  var thisInstance = this;
  Base.call(this,properties,environment);
  this.preventBus=true;
  this.baseName = "ModModify";
  this.color=ModModify.color;
  testGetName.call(this);
  if (properties.name) this.name = properties.name;
  var self = this;
  

  var noteOnTracker={}

  this.bitmap=0;
  this.operators=[
    {name:'mute',op:function(input,set){return false } },
    {name:'nothing',op:function(input,set){return input} },
    {name:'+',op:function(input,set){return input+set} },
    {name:'*',op:function(input,set){return input*set} },
    {name:'=',op:function(input,set){return set} },
    {name:'%',op:function(input,set){return input%set} },
    {name:'?',op:function(input,set){return input==set?input:false} },
    {name:'!',op:function(input,set){return input!=set?input:false} },
    {name:'sin/',op:function(input,set){return Math.sin(input/set)*0xFF} },
  ];
  //operation, value
  this.modifiers=[
    [1,0],[1,0],[1,0],[1,0],
    [1,0],[1,0],[1,0],[1,0],
    [1,0],[1,0],[1,0],[1,0],
    [1,0],[1,0],[1,0],[1,0],
  ]
  this.modulus={value:16}
  this.remapIndex={
    value:1,
    valueNames:["head","note","chan","param"],
    max:3,
    min:0
  }
  this.toggleModifierMute=function(n){
    if(!self.modifiers[n]) return;
    if(self.modifiers[n][0]){
      self.modifiers[n][3]=self.modifiers[n][0];
      self.modifiers[n][0]=0;
    }else{
      self.modifiers[n][0]=self.modifiers[n][3]?self.modifiers[n][3]:1;
    }
  }
  function transformFunction(eventMessage){
    // console.log("transform");
    var ret=eventMessage.clone();
    // console.log(" v",ret.value);
    var thisValue=ret.value[self.remapIndex.value];
    // console.log(" thisValue",thisValue,self.remapIndex);
    var thisModifier=self.modifiers[thisValue%self.modulus.value];
    // console.log(" thisModifier",thisModifier,self.modifiers);
    var opfn=self.operators[thisModifier[0]].op;
    if(opfn){
      ret.value[self.remapIndex.value]=opfn(thisValue,thisModifier[1]);
    }else{
      console.warn("operator not defined, modifier:",thisModifier);
    }
    return ret;
  }

  this.messageReceived = function (evt) {
    var incomingValues=evt.eventMessage.value;
    var incomingValue=incomingValues[self.remapIndex.value];
    var transformed=transformFunction(evt.eventMessage);

    if (evt.eventMessage.value[0] == headers.triggerOn) {
      if (!noteOnTracker[incomingValues[0], incomingValues[1]]) noteOnTracker[incomingValues[0], incomingValues[1]]=[];
      noteOnTracker[incomingValues[0],incomingValues[1]].push(transformed);
    } else if (evt.eventMessage.value[0] == headers.triggerOff) {
      if(noteOnTracker[incomingValues[0], incomingValues[1]]){
        for (var trackedNoteOn of noteOnTracker[incomingValues[0], incomingValues[1]]){
          trackedNoteOn.value[0]=EventMessage.headers.triggerOff;
          self.output(trackedNoteOn);
        }
        delete noteOnTracker[incomingValues[0], incomingValues[1]];
      }
      // console.log(noteOnTracker);
    }
    // console.log(evt.eventMessage.value,"->",transformed.value);
    self.output(transformed);
  }

  this.getBitmap16 = function () {
    return myBitmap;
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

ModModify.color = [210, 0, 190];
module.exports = ModModify;
