var CLOCKTICKHEADER = 0x00;
var TRIGGERONHEADER = 0x01;
var TRIGGEROFFHEADER = 0x02;
var RECORDINGHEADER = 0xAA;
var EventMessage = require('../../datatypes/EventMessage.js');
var NoteOnTracker = function(controlledModule) {
  var self=this;
  var checkMem=true;
  var trackedNotes = [];
  function transformToNoteOff(identifier) {
    trackedNotes[identifier].value[0]=TRIGGEROFFHEADER;
  }
  this.checkMem=function(){
    checkMem=true;
  }
  this.add = function(noteOn, identifier = false) {
    if (noteOn.value[0] != TRIGGERONHEADER) console.warn("noteonTracker: tracking notes that are not a noteon is likely to give you headaches", noteOn);
    if (identifier === false) identifier = [noteOn.value[1], noteOn.value[0]];
    trackedNotes[identifier] = noteOn.clone();
    transformToNoteOff(identifier);
    if(checkMem){
      let amount=self.list().length;
      if(amount>30) console.log(controlledModule.name+"'s trackedNotes length "+amount);
    }
    return identifier;
  }
  var filterFunction=false;

  this.ifNoteOff=function(identifier,callback){
    if(trackedNotes[identifier]){
      callback(trackedNotes[identifier]);
      delete trackedNotes[identifier];
    }
  }
  this.noteOff=function(identifier) {
    let ret=trackedNotes[identifier];
    delete trackedNotes[identifier];
    return ret;
  }
  this.noteOffPeek=function(identifier) {
    return trackedNotes[identifier];
  }

  this.eachTrackedNote=this.each=function(callback){
    if(typeof callback!=="function"){ console.error("callback is not a function"); return;}
    for(identifier in trackedNotes){
      callback(trackedNotes[identifier],identifier);
    }
  };
  this.list=function(){
    return Object.keys(trackedNotes);
  }
  this.empty=function(){
    var ret=trackedNotes;
    trackedNotes=[];
    return trackedNotes;
  }
}
module.exports = NoteOnTracker;