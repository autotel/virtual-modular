
var TapeCanvas=module.exports=function(controlledModule){

  var self=this;
  var timeRange=this.timeRange={start:[0,0]}
  var stepsPerButton=this.stepsPerButton={value:2};
  var microStepBase=12;

  // var pressRelease = new (function(){
  //   var memory={};
  //   this.releaseFunction=function(data){}
  //   this.press=function(identifier,attachData){
  //     memory[identifier]=attachData;
  //   }
  //   this.release=function(identifier){
  //     self.releaseFunction(memory[identifier]);
  //   }
  //   return this;
  // })();
  //
  // pressRelease.releaseFunction=function(data){
  //   currentTape.addEvent(data.start,data.eventMessage);
  // }

  this.eventsBitmap=0x00;
  this.eventsTrailBitmap=0x00;
  var memKeys=[];
  var currentTape=false;
  var setTape=this.setTape=function(tape){
    currentTape=tape;
  }

  this.sequenceButtonCall=function(button,callback){
    var timeIndex=getTimeIndexOfButton(button);
    //perhaps there is a modulus composition setup?
    var currentEvents=currentTape.hasEventsStartingAt(timeIndex);
    callback(currentEvents,timeIndex);
    //if the current button has an event, return it.
    //, so we can make event selction
    updateBitmap();
    return false;
  }
  this.eventDuration=function(eventMessage,newLength){
    return eventMessage;
  }
  var pageRight=this.pageRight=function(){
    timeRange.start[0]+=16*stepsPerButton.value;
    updateBitmap();
  }
  var pageLeft=this.pageLeft=function(tape){
    timeRange.start[0]-=16*stepsPerButton.value;
    updateBitmap();
  }
  var updateBitmap=this.updateBitmap=function(){
    if(!currentTape) return;
    self.eventsBitmap=0;
    // console.log("UPB");
    memKeys=Object.keys(currentTape.memory);
    for(var memKey of memKeys){
      if(stepsPerButton.value<1){
        var eventsPerMicroStep=currentTape.clock.microSteps*stepsPerButton.value;
        var memKeyPart=memKey.split(",");
        self.eventsBitmap|=1<<((memKeyPart[0]/stepsPerButton.value)+(memKeyPart[1]/eventsPerMicroStep));
      }else{
        self.eventsBitmap|=1<<memKey.split(",")[0]/stepsPerButton.value;
      }
    }
  }
  var getTimeIndexOfButton=function(button){
    ret=[button*stepsPerButton.value,0];
    if(stepsPerButton<1){
      ret[1]=(button%(1/stepsPerButton))*microStepBase/stepsPerButton
    }
    return ret;
  }
}