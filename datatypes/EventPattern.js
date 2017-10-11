'use strict'
var eventMessage=require("./eventMessage");
var noteSpec=require("../modules/standards/note.js");
module.exports=function(properties){
  var thisPE=this;
  if(properties){
    for(var a in properties){
      this[a]=properties[a];
    }
    if(thisPE.on.isEventMessage!==true) thisPE.on=new eventMessage(thisPE.on);
    if(thisPE.off!==false)
      if(thisPE.off.isEventMessage!==true) thisPE.off=new eventMessage(thisPE.off);
      //untested:
  }
  this.compareTo=function(other,propertyList){
    return this.on.compareTo(other.on);//& this.off.compareTo(other.off);
  }
  this.from=function(eventMessage){
    thisPE.on=new eventMessage(eventMessage);
    thisPE.off=new eventMessage(eventMessage);
    thisPE.off.value[2]=0x00;
    if(thisPE.on.value[0]==noteSpec[0].triggerNoteOn){
      thisPE.off.value[0]=noteSpec[0].triggerNoteOff;
      thisPE.off.value[2]=0x00;
    }
  };
}