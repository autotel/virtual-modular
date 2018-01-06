'use strict'
/**
@example ` myOutput.receive(new EventMessage([0x01,0x40,0x30])) `
*/
var EventMessage=function(inputValue){
  var thisEm=this;
  this.isEventMessage=true;
  /**
  value of the EventMessage

  [0]=function header, indicates the receiving module what function to perform with the following data

  [1]=submode/ voice specification (channel), indicates a variation of the mode or what voice to play. Sometimes unused

  [2]=main event number, indicates information such as what note to play, what cc to change, or what event to trigger.

  [3 ... ]= more data, depending on the particular function of the receiver following data may make sense or not.

  all the efforts are done to avoid it's value to be a reference. to simulate modular elements, the EventMessages must have their own copy of the data, otherwise it could happen that a module edits an EventMessage that has been received by other. This is why to modify the .value of EventMessage, you can opt for
  * set a single index of the value `myEventMessage.value[2]=0x44`
  * or use the set function `myEventMessage.set({value:[0x44,0x44,0x44]});
  */

  this.value=[];
  /**
  valuenames is correlated to values array, and is used to have friendlier names to a certain EventMessage. It helps make these more readable; however you must avoid referencing to values using the names because that doesn't ensure compatibility with modules that may name values differently, and also it is slower in execution.
  @example myEventMessage.print();
  */
  this.valueNames=[];
  /**print to the console it's values with index and names (if applicable)*/
  this.print=function(){
    console.log("EventMessage { ");
    for(var a in this.value){
      var str="["+a+"]";
      if(this.valueNames[a]) str+="("+valueNames[a]+") ";
      str+=": "+ this.value[a];
      console.log(" "+str);
    }
    console.log("}");
  }
  /**
  set parameters of the EventMessage Data contains properties to set.
  @example myEventMessage.set({value:[0x44,0x44,0x44],note:"example event message"});

  the only standard property that can be set is the value, other properties such as the exaple "note" are not standard, avoid using non-standard parameters unless it excplusively within the same module that is using it
  */
  this.set=function(data){
    for(var a in data){
      if(typeof data[a]!=="function")
        this[a]=JSON.parse(JSON.stringify(data[a]));
    }
  }
  /**
  @returns a copy of itself
  */
  this.clone=function(){
    return new EventMessage(this);
  }
  this.compareTo=function(otherEvent,propertyList){
    for(var a of propertyList){
      if(JSON.stringify(this[a])!=JSON.stringify(otherEvent[a]))
      return false;
    }
    return true;
  }
  /**apply all the characteristics of other event message to this one, except the ones that are
  "transparent" in the other (value==-1)*/
  this.superImpose=function(otherEvent){
    //if otherEvent doesn't have any transparent value, then just return otherEvent
    if(otherEvent.value.indexOf(-1)===-1) return otherEvent;
    for(var a in otherEvent.value){
      if(otherEvent.value[a]!=-1){
        thisEm.value[a]=otherEvent.value[a];
      }
    }
    return thisEm;
  }
  /**apply only the characteristics of other event message if the ones in  this are transparent*/
  this.underImpose=function(otherEvent){
    //if otherEvent doesn't have any transparent value, then just return this
    if(thisEm.value.indexOf(-1)===-1) return thisEm;
    for(var a in thisEm.value){
      if(thisEm.value[a]==-1){
        thisEm.value[a]=otherEvent.value[a];
      }
    }
    return thisEm;
  }
  this.set(inputValue);
}
module.exports=EventMessage;
/**/