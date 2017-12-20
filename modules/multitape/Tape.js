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
  var overdub=this.overdub={value:false}
  var silentOnInput=this.silentOnInput={
    value:true,
    onInput:false,
  }
  var name=this.name="tape "+tapeCount;
  var quantize=this.quantize={value:0};

  this.excited=0;

  var playhead=[0,0];
  var offset=[0,0];
  var lastClockFunction=[0,0];
  var lastMicroStepBase=12;

  //noteLogger records always, and only some of it's recorded events get into the tape memory
  var noteLogger=new NoteLogger();
  if(!properties.clock)throw "please provide an anchoring clock to the tape"
  noteLogger.setExternalClock(properties.clock);

  /**
  @param callback the function to call for each memory event. The eventMessage will be this. Callback is called with @param-s (timeIndex,eventIndex) where timeIndex is an array containing [step,microStep] of the evenMessage caller, and eventIndex is the number of the event in that very step, since each step could contain more than one event.
  you can set the time range to take in consideration using:
  @param {array} timeStart time of the first memory event on whom to call the callback, in [step,microStep]
  @param {array} timeEnd time of the last memory event on whom to call the callback, in [step,microStep]
  */
  this.eachMemoryEvent = function(callback, timeStart, timeEnd) {
    if (!timeStart) timeStart = [0, 0];
    if (!timeEnd) timeEnd = [clock.steps, clock.microSteps];
    if (timeStart[0] === undefined) console.warn("eachMemoryEvent timeStart parameter must be array of [step,microStep]");
    if (timeEnd[0] === undefined) console.warn("eachMemoryEvent timeEnd parameter must be array of [step,microStep]");
    var timeRangeStarted = false;
    for (var timeIndex in memory) {
      if (!timeRangeStarted) {
        if (timeStart[0] <= timeIndex[0] && timeStart[1] <= timeIndex[1]) {
          timeRangeStarted = true;
        }
      }
      if (timeRangeStarted) {
        for (var eventIndex in memory[timeIndex]) {
          callback.call(memory[timeIndex][eventIndex], JSON.parse("[" + timeIndex + "]"), eventIndex);
        }
      }
      if (timeIndex[0] >= timeEnd[0] && timeIndex[1] >= timeEnd[1]) {
        break;
      }
    }
  }


  this.outputFunction=function(eventMessage){
    console.warn("no output function in "+self.name);
  }
  this.clearMemory=function(){
    memory.splice(0);
    memory=self.memory=[];
  }
  this.record=function(eventMessage){
    noteLogger.addEvent(eventMessage);
    if(silentOnInput.value){
      silentOnInput.onInput=11;
    }
  }


  this.fold=function(factor,destructive=true){
    if(destructive){
      if(factor<=0){
        console.warn("folding factor can't be <=0");
      }else if(factor!=1){
        //we have to iterate backward or otherwise I will remove the newly duplicated events.
        var timeKeys=Object.keys(memory);
        console.log(timeKeys);
        for (var kekey=timeKeys.length; kekey>0; kekey--) {
          var timeIndex=JSON.parse(`[${timeKeys[kekey-1]}]`);
          // var timeIndex=timeKeys[kekey-1];
          // console.log(timeIndex);
          if(timeIndex[0]<steps.value*factor){
            console.log(`${timeIndex[0]}<=${steps.value*factor}`);
            //we are in the zone that gets duplicated
            var factoredTimeIndex=[timeIndex[0]+(steps.value*factor),timeIndex[1]];
            memory[factoredTimeIndex]=memory[timeIndex];
            console.log("DUP",timeIndex,">>",factoredTimeIndex);
          }else{
            console.log(`${timeIndex[0]}>${steps.value*factor}`);
            //we are in the zone that gets deleted
            console.log("DEL",timeIndex);
            delete memory[timeIndex];
          }
        }
      }
      steps.value*=factor;
    }else{
      if(!factor||factor<=0){
        console.warn("invalid folding factor: ",factor);
      }else{
        steps.value*=factor;
      }
    }
  }

  var lastRecordedEventTime=[0,0];
  this.refreshNewTapeLengthFromRecording=false;
  var evaluateNewRecording = function(){
    if(self.excited>0) self.excited--;
    // console.log("STPFN");
    //If I detect a recording or a change of length in the tape, transfer the event logger memory to the tape memory
    //it's not nevessary to do this process on every microStep, it happens on steps.
    noteLogger.lastEventTime(false,function(lastEventTime){
      // console.log("LEV",lastEventTime);
      if((lastRecordedEventTime[0]!=lastEventTime[0])||self.refreshNewTapeLengthFromRecording){
        self.refreshNewTapeLengthFromRecording=false;
        // console.log("LRTTRU");
        if(!overdub.value)
          self.clearMemory();
        // memory=self.memory;
        lastRecordedEventTime=[lastEventTime[0],lastEventTime[1]];
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
    if(clockDelta[1]<0){
      clockDelta[1]+=12;
    }

    if(silentOnInput.onInput){
      silentOnInput.onInput -= clockDelta[1];
      console.log(silentOnInput.onInput);
      if(silentOnInput.onInput<=0) silentOnInput.onInput=false;
    }


    playhead[0]+=clockDelta[0];
    playhead[1]+=clockDelta[1];
    playhead[0]%=steps.value;
    playhead[1]%=lastMicroStepBase;

    if(!muted.value){
      if(overdub.value?true:(silentOnInput.value?!silentOnInput.onInput:true))
      if (memory[playhead]) {
        for (var eventMessage of memory[playhead]) {
          self.excited++;
          // console.log("TOPT",eventMessage.value);
          self.outputFunction(eventMessage);
        }
      }
    }

    if(clockDelta[0]>=1) evaluateNewRecording();

    lastClockFunction=timeIndex;
  }
  tapeCount++;
  propertiesApplicator.call(this,properties);
}
module.exports=Tape;