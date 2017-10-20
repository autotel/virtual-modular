'use strict'
var EventMessage=require("./EventMessage.js");
var noteSpec=require("../modules/standards/note.js");
/**
prototype of event messages in a format that is handy for storage
*/
var EventPattern=function(properties){
  var thisPE=this;



  this.compareTo=function(other,propertyList){
    return thisPE.on.compareTo(other.on);//& this.off.compareTo(other.off);
  }
  this.from=function(evMes){
    thisPE.on=new EventMessage(evMes);
    thisPE.off=new EventMessage(evMes);
    if(thisPE.on.value[0]==noteSpec[0].triggerNoteOn){
      thisPE.off.value[0]=noteSpec[0].triggerNoteOff;
      thisPE.off.value[3]=0x00;
    }
  };

  if(properties){
    for(var a in properties){
      thisPE[a]=properties[a];
    }
    if(thisPE.on.isEventMessage!==true) thisPE.on=new EventMessage(thisPE.on);
    if(thisPE.off===undefined){
      thisPE.from(thisPE.on);
    }else if(thisPE.off!==false)
      if(thisPE.off.isEventMessage!==true) thisPE.off=new EventMessage(thisPE.off);
      //untested:
  }else{
    thisPE.on=new EventMessage();
    thisPE.from(thisPE.on);
  }
}
module.exports=EventPattern;