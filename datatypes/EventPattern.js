'use strict'
var EventMessage=require("./EventMessage.js");
var noteSpec=require("../modules/standards/note.js");
/**
prototype of event messages in a format that is handy for storage
*/
module.exports=function(properties){
  var thisPE=this;
  if(properties){
    for(var a in properties){
      this[a]=properties[a];
    }
    if(thisPE.on.isEventMessage!==true) thisPE.on=new EventMessage(thisPE.on);
    if(thisPE.off!==false)
      if(thisPE.off.isEventMessage!==true) thisPE.off=new EventMessage(thisPE.off);
      //untested:
  }
  this.compareTo=function(other,propertyList){
    return this.on.compareTo(other.on);//& this.off.compareTo(other.off);
  }
  this.from=function(evMes){
    thisPE.on=new EventMessage(evMes);
    thisPE.off=new EventMessage(evMes);
    if(thisPE.on.value[0]==noteSpec[0].triggerNoteOn){
      thisPE.off.value[0]=noteSpec[0].triggerNoteOff;
      thisPE.off.value[3]=0x00;
    }
  };
}