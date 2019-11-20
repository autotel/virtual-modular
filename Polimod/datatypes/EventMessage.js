'use strict'
/**
@example ` myOutput.receive(new EventMessage([0x01,0x40,0x30])) `
*/
var EventMessage=function(inputValue){
  var thisEm = this;
  var self = this;
  this.isEventMessage=true;
  /**
  value of the EventMessage

  [0]=function header, indicates the receiving module what function to perform with the following data

  [1]=main event number, indicates information such as what note to play, what cc to change, or what event to trigger.

  [2]=submode/ voice specification (channel), indicates a variation of the mode or what voice to play. Sometimes unused

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
    if(Array.isArray(data)){
      this.value=data.map((a)=>parseInt(a));
    }else{
      for(var a in data){
        if(a=="value"){
          this.value=data[a].map((a)=>parseInt(a));
        }else if(typeof data[a]!=="function")
          this[a]=JSON.parse(JSON.stringify(data[a]));
        }
    }
  }
  /**
  @returns a copy of itself
  */
  this.clone=function(){
    return new EventMessage(this);
  }
  this.compareValuesTo=function(otherEvent,valuesList=false){
    if(otherEvent===self)return true;
    for(var index of valuesList){
      if(otherEvent.value[index]!==self.value[index]) return false;
    }
    return true;
  }
  this.compareTo=function(otherEvent,propertyList){
    if(otherEvent===self) return true;
    function recurse(currentObject,pathArr,level=-1){
      // console.log("R",currentObject);
      var nextLevel=level+1;
      if(level==pathArr.length-1){
        // console.log("<<",currentObject);
        return currentObject;
      }else if(currentObject[pathArr[nextLevel]]){
        // console.log(">>",currentObject[pathArr[nextLevel]]);
        return recurse(currentObject[pathArr[nextLevel]],pathArr,nextLevel);
      }else{
        // console.log("?! currentObject["+pathArr[nextLevel]+"]=",currentObject[pathArr[nextLevel]]);
        return;
      }
    }
    for(var a of propertyList){
      var splitVal=a.split('.');
      if(splitVal.length>1){
        let comparableA=recurse(self,splitVal);
        let comparableB=recurse(otherEvent,splitVal);
        // console.log("compare",comparableA,comparableB);
        if(comparableA!=comparableB){
          // console.log(comparableA,"!==",comparableB);
          return false;
        }
      }else{
        if(JSON.stringify(self[a])!=JSON.stringify(otherEvent[a])){
          // console.log(`${JSON.stringify(self[a])}!=${JSON.stringify(otherEvent[a])}`,JSON.stringify(self[a])!=JSON.stringify(otherEvent[a]))
          return false;
        }else{
          // console.log(`${JSON.stringify(self[a])}==${JSON.stringify(otherEvent[a])}`,JSON.stringify(self[a])==JSON.stringify(otherEvent[a]))

        }
      }
    }
    return true;
  }
  /**apply all the characteristics of other event message to this one, except the ones that are
  "transparent" in the other (value==-1)*/
  this.superImpose=function(otherEvent){
    for(var a in otherEvent.value){
      if(otherEvent.value[a]>=0){
        thisEm.value[a]=otherEvent.value[a];
      }
    }
    return thisEm;
  }
  /**apply only the characteristics of other event message if the ones in  this are transparent*/
  this.underImpose=function(otherEvent){
    for (var a in otherEvent.value) {
      if (!(thisEm.value[a] >= 0)) {
        thisEm.value[a] = otherEvent.value[a];
      }
    }
    return thisEm;
  }
  this.set(inputValue);
}
EventMessage.from=function(original){
  return new EventMessage(original);
}
EventMessage.test=function(){

  var eM=new EventMessage({value:[0,2,2]});
  function aa (){ return  }

  var scripts=[
    function(){
      return eM
    },
    function(){
      return eM.clone()
    },
    function(){
      return eM.compareTo(eM.clone(),['value'])
    },
    function(){
      return eM.compareTo( new EventMessage({ value:[0,1,2,3] }), ['value'] )
    },
    function(){
      return eM.compareTo(eM.clone(),['value.1'])
    },
    function(){
      return eM.compareTo( new EventMessage({ value:[0,1,2,3] }), ['value.2'] )
    },
    function(){
      return eM.compareTo( new EventMessage({ value:[0,1,2,3] }), ['value.1','value.2'] )
    },
  ];
  for(var scr of scripts){
    console.log(String(scr)+'\n\n>',eval(scr)(),"\n");
  }
}
EventMessage.fromMidi=function(midiMessage){
  var headers = EventMessage.headers;
  let inputClockCount=0;
  let inputClockMod=6;
  if(midiMessage.inputClockCount) inputClockCount=midiMessage.inputClockCount;
  if(midiMessage.inputClockMod) inputClockMod=midiMessage.inputClockMod;
  var fnHeader = midiMessage[0] & 0xf0;
  var channel = midiMessage[0] & 0xf;
  var num = midiMessage[1];
  var numb = midiMessage[2];
  var outputMessage = new EventMessage({
    value: [fnHeader, num, channel, numb]
  });
  switch (outputMessage.value[0]) {
    case 0x90: {
      if (numb) {
        outputMessage.value[0] = headers.triggerOn;
      } else {
        outputMessage.value[0] = headers.triggerOff;
      }
      break;
    }
    case 0x80:
      outputMessage.value[0] = headers.triggerOff;
      break;
    case 0xF0:
      {
        if (outputMessage.value[2] == 8) {
          outputMessage.value[0] = headers.clockTick;
          outputMessage.value[1] = inputClockMod;
          outputMessage.value[2] = inputClockCount % inputClockMod;
        } else if (outputMessage.value[1] == 0xa) {
          outputMessage.value[0] = headers.playhead;
          outputMessage.value[1] = 0;
          outputMessage.value[2] = 0;
        } else if (outputMessage.value[1] == 0xb) {
          outputMessage.value[0] = headers.triggerOn;
        } else if (outputMessage.value[1] == 0xc) {
          outputMessage.value[0] = headers.triggerOff;
        }
        break;
      }
    default:
    // console.log("message header not transformed:",outputMessage.value);
  }
  return outputMessage;
}
EventMessage.toMidi=function(eventMessage){
  var headers = EventMessage.headers;
  var midiOut = [0, 0, 0];
  if (eventMessage.value[0] == headers.changeRate) {
    midiOut[0] = 0xB0 | (0x0F & eventMessage.value[2]); //cc channel
    midiOut[1] = eventMessage.value[1]; //is the controller number.
    midiOut[2] = eventMessage.value[3]; //is the value
  }
  if (eventMessage.value[0] == headers.triggerOn) {
    midiOut[0] = 0x90 | (0x0F & eventMessage.value[2]);
    midiOut[1] = eventMessage.value[1];
    midiOut[2] = eventMessage.value[3];
  }
  if (eventMessage.value[0] == headers.triggerOff) {
    midiOut[0] = 0x80 | (0x0F & eventMessage.value[2]);
    midiOut[1] = eventMessage.value[1];
    midiOut[2] = 0;
  }
  if (eventMessage.value[0] == headers.clockTick) {
    midiOut[0] = 0xF8;
    midiOut[1] = 0;
    midiOut[2] = 0;
  }
  // console.log("sendimid", midiOut);
  midiOut = midiOut.map(function (a, b) {
    var a = parseInt(a);
    a %= (b > 0 ? 128 : 256);
    if (isNaN(a)) a = 0;
    return a;
  });
  // console.log(" convert",midiOut);
  return midiOut;
    // console.log(midiOut);
}

EventMessage.headers={
  clockTick:0x0,
  triggerOn:0x01,
  triggerOff:0x02,
  changePreset: 0x03,
  changeRate: 0x04,
  choke: 0x05,
  playhead:0x06,
  record:0xAA,
  recordStatus:0xAB
}
// EventMessage.test();
module.exports=EventMessage;
/**/
