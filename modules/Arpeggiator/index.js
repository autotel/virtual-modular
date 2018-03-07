'use strict';
var EventMessage = require('../../datatypes/EventMessage.js');
var InterfaceX16 = require('./InterfaceX16');
var NoteOnTracker = require('../moduleUtils/NoteOnTracker.js');
// var clockSpec=require('../standards/clock.js');
var CLOCKTICKHEADER = 0x00;
var TRIGGERONHEADER = 0x01;
var TRIGGEROFFHEADER = 0x02;
var RECORDINGHEADER = 0xAA;

var testcount = 0;
var testGetName = function() {
  this.name = this.baseName + " " + testcount;
  testcount++;
}
/**
@constructor
the instance of the of the module, ment to be instantiated multiple times.
require to moduleBase.call
*/
var Arpeggiator = function(properties) {

  var thisInstance = this;
  var myBitmap = 0;
  var settings=this.settings={
    duration:{value:false},
    'force length':{value:0}, //when >0, this should modify how the sequence is played so that it's length is always a factor of the forced length
    //this effectively converts the arpeggiator in a fast pattern maker that doesn't drift away easily
    mode:{
      value: 0,
      valueNames:['as played','up','down','random']
    },
    pattern:{
      value:0,
      valueNames:['straight','polymeter 3%8','polymeter 3%16','polyrhythm 8/3','polyrhythm 16/3'],
    },
    reset:{value:false}//this allows to clear the notes in the arpeggiator in case there is a hanging note.
  }
  let clock = this.clock = {
    subSteps: 1,
    subStep: 0,
    step:0
  }
  let noteOnTracker = new NoteOnTracker();

  let runningNotes = [];
  let runningNotesSorted = [];


  function eachRunningNote(cb){
    for(var index in runningNotes){
      var rnot=runningNotes[index];
      cb.call(rnot,index,rnot);
    }
  }
  this.baseName = "Arpeggiator";
  this.color = [210, 0, 233];
  testGetName.call(this);
  if (properties.name) this.name = properties.name;
  var self = this;


  this.interfaces.X16 =  InterfaceX16;

  var memory=[];


  this.eventReceived = function(evt) {
    if (evt.eventMessage.value[0] == CLOCKTICKHEADER && (evt.eventMessage.value[2] % evt.eventMessage.value[1] == 0)) {
      clock.subStep++;
      if (clock.subStep >= clock.subSteps) {
        clock.subStep = 0;
        clock.step++;

        noteOnTracker.empty(function(noff){

          thisInstance.output(noff, true);
        });
        arpOperation();
        this.handle('step');
      }
    } else if (evt.eventMessage.value[0] == TRIGGERONHEADER) {
      // this.setFixedStep(evt.eventMessage.value[2]%16);
      addNote(evt.eventMessage.clone());
    } else if (evt.eventMessage.value[0] == TRIGGEROFFHEADER) {
      // this.clearFixedStep(evt.eventMessage.value[2]%16);
      removeNote(evt.eventMessage.clone());
    } else if (evt.eventMessage.value[0] == RECORDINGHEADER) {
      //shold for instance the arpeggiator proxy the recorder behind? it is possible to make this module send his recoding notes upward.
      evt.eventMessage.value.shift();
      thisInstance.eventReceived(evt);
      // if(evt.eventMessage.value[0]==TRIGGERONHEADER){
      //   this.setFixedStep(evt.eventMessage.value[2]%16);
      // }else  if(evt.eventMessage.value[0]==TRIGGEROFFHEADER){
      //   this.clearFixedStep(evt.eventMessage.value[2]%16);
      // }
    } else {}
  }

  this.getBitmap16 = function() {
    return myBitmap;
  }
  this.delete = function() {
    noteOnTracker.empty(function(noff){
      thisInstance.output(noff, true);
    });
    return true;
  }

  this.handleStepsChange=function(){
    self.handle('~ module',{steps:runningNotes.length});
  }

  function arpOperation() {
    if(settings.reset.value){
      runningNotes.splice(0);
      noteOnTracker.empty(function(noff){
        thisInstance.output(noff, true);
      });
      settings.reset.value=false;
    }
    if(runningNotes.length){
      arpTrigger(clock.step%runningNotes.length);
    }
  }

  function arpTrigger(num){
    var outNote=runningNotes[num];
    noteOnTracker.add(outNote);
    self.output(outNote);
  }

  function addNote(eventMessage){
    self.handleStepsChange();
    runningNotes.push(eventMessage);
  }

  function removeNote(eventMessage){
    self.handleStepsChange();

    eachRunningNote(function(index,rnote){
      if(eventMessage.compareTo(rnote,['value.1','value.2'])){
        runningNotes.splice(index,1);
      }
    });
  }
};
module.exports=Arpeggiator;