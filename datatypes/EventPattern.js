'use strict'
var EventMessage=require("./EventMessage.js");
// var noteSpec=require("../modules/standards/note.js");
var CLOCKTICKHEADER = 0x00;
var TRIGGERONHEADER = 0x01;
var TRIGGEROFFHEADER = 0x02;
var RECORDINGHEADER = 0xAA;
/**
prototype of event messages in a format that is handy for storage
*/
var EventPattern=function(properties){
  var thisPE=this;



  this.compareTo=function(other,propertyList){
    return thisPE.on.compareTo(other.on,propertyList);//& this.off.compareTo(other.off);
  }
  this.fromEventMessage=function(evMes){
    thisPE.on=new EventMessage(evMes);
    thisPE.off=new EventMessage(evMes);
    if(thisPE.on.value[0]==TRIGGERONHEADER){
      thisPE.off.value[0]=TRIGGEROFFHEADER;
      thisPE.off.value[3]=0x00;
    }else{
      thisPE.off=false;
    }
    return thisPE;
  };

  if(properties){
    for(var a in properties){
      thisPE[a]=properties[a];
    }
    if(thisPE.on.isEventMessage!==true) thisPE.on=new EventMessage(thisPE.on);
    if(thisPE.off===undefined){
      thisPE.fromEventMessage(thisPE.on);
    }else if(thisPE.off!==false)
      if(thisPE.off.isEventMessage!==true) thisPE.off=new EventMessage(thisPE.off);
      //untested:
  }else{
    thisPE.on=new EventMessage();
    thisPE.fromEventMessage(thisPE.on);
  }
}
module.exports=EventPattern;