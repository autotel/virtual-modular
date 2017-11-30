'use strict';

var tapeCount=0;

let propertiesApplicator=function(properties){
  if(properties)for(var a in properties){
    this[a]=properties[a];
  }
}

var Tape=function(properties){

  var self=this;

  var memory=this.memory=[];
  var muted=this.muted={value:false};
  var steps=this.steps={value:32};
  var name=this.name="tape "+tapeCount;
  var quantize=this.quantize={value:0};

  var playhead=[0,0];
  var offset=[0,0];
  var lastClockFunction=[0,0];
  var lastMicroStepBase=12;



  this.outputFunction=function(eventMessage){
    console.warn("no output function in "+self.name);
  }

  this.clearMemory=function(){
    memory.splice(0);
    memory=self.memory=[];
  }

  this.clockFunction=function(timeIndex,microStepBase){
    if(microStepBase!==undefined){
      if(microStepBase!=lastMicroStepBase){
        lastMicroStepBase=microStepBase;
        console.log("micro step base changed in tape");
      }
    }

    //this over-complicated way of transfering the clock from the outside is because it allows keeping the tapes on sync, and apply displacements over that.
    var clockDelta=[timeIndex[0]-lastClockFunction[0],timeIndex[1]-lastClockFunction[1]];
    playhead[0]+=clockDelta[0];
    playhead[1]+=clockDelta[1];
    playhead[0]%=steps.value;
    playhead[1]%=lastMicroStepBase;
    if(!muted.value){
      if (memory[playhead]) {
        for (var eventMessage of memory[playhead]) {
          // console.log("TOPT",eventMessage.value);
          self.outputFunction(eventMessage);
        }
      }
    }


    lastClockFunction=timeIndex;
  }
  tapeCount++;
  propertiesApplicator.call(this,properties);
}
module.exports=Tape;