'use strict';

var NoteLogger = require('./NoteLogger.js');

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

  //noteLogger records always, and only some of it's recorded events get into the tape memory
  var noteLogger=new NoteLogger();
  if(!properties.clock)throw "please provide an anchoring clock to the tape"
  noteLogger.setExternalClock(properties.clock);

  this.outputFunction=function(eventMessage){
    console.warn("no output function in "+self.name);
  }

  this.clearMemory=function(){
    memory.splice(0);
    memory=self.memory=[];
  }
  this.record=function(eventMessage){
    noteLogger.addEvent(eventMessage);
  }
  var currentLoopStart=[0,0];
  var stepFunction = function(){
    // console.log("STPFN");
    //If I detect a recording or a change of length in the tape, transfer the event logger memory to the tape memory
    //it's not nevessary to do this process on every microStep, it happens on steps.
    noteLogger.lastEventTime(false,function(lastEventTime){
      // console.log("LEV",lastEventTime);
      if(currentLoopStart[0]!=lastEventTime[0]-self.steps.value){
        self.clearMemory();
        // memory=self.memory;
        currentLoopStart=[lastEventTime[0]-self.steps.value,lastEventTime[1]];
        var time=[lastEventTime[0]-self.steps.value,lastEventTime[1]-1];
        // console.log("TTM",time,lastEventTime);
        noteLogger.getLastTimeEvents(time, false,function(_eventMessage){
          var eventMessage=_eventMessage.clone();
          var timeIndex=eventMessage.starts;
          timeIndex[0]%=self.steps.value;
          if(!memory[timeIndex]) memory[timeIndex]=[];
          memory[timeIndex].push(eventMessage);

        });
      }
    });
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

    if(clockDelta[0]>=1) stepFunction();

    lastClockFunction=timeIndex;
  }
  tapeCount++;
  propertiesApplicator.call(this,properties);
}
module.exports=Tape;