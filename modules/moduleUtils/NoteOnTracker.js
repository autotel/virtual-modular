var CLOCKTICKHEADER = 0x00;
var TRIGGERONHEADER = 0x01;
var TRIGGEROFFHEADER = 0x02;
var RECORDINGHEADER = 0xAA;
var EventMessage = require('../../datatypes/EventMessage.js');
var NoteOnTracker = function(controlledModule) {
  var self=this;
  var checkMem=30;
  var trackedNotes = [];
  function transformToNoteOff(identifier) {
    trackedNotes[identifier].value[0]=TRIGGEROFFHEADER;
  }
  this.checkMem=function(val=16){
    checkMem=val;
  }
  function makeUpIdentifier(evMes){
    return [evMes.value[1], evMes.value[0]];
  }

  this.add = function(noteOn, identifier = false) {
    if (noteOn.value[0] != TRIGGERONHEADER) console.warn("noteonTracker: tracking notes that are not a noteon is likely to give you headaches", noteOn, controlledModule.name);
    if (identifier === false) identifier = makeUpIdentifier(noteOn);
    trackedNotes[identifier] = noteOn.clone();
    transformToNoteOff(identifier);
    if(checkMem){
      let amount=self.list().length;
      if(amount>checkMem) console.log(controlledModule.name+"'s trackedNotes length "+amount);
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
  this.empty=function(cb){
    // console.log("EMPT",trackedNotes.length);
    var ret=trackedNotes;
    if(typeof cb == "function"){
      for(var a in trackedNotes){
        cb(trackedNotes[a],a);
      }
    }
    trackedNotes=[];
    return trackedNotes;
  }
}
module.exports = NoteOnTracker;