'use strict';
var EventMessage=require('../../Polimod/datatypes/EventMessage');
var headers = EventMessage.headers;
/**
@param ownerModule: the module that will use this Recorder
@param memoryArray: the array where the recorded events go. The events will be indexed using [step, microStep] as index.
*/
var Recorder = function(ownerModule,memoryArray){
  var trackedNotes=[];
  var eventsWithNoteOn={};
  var self=this;
  this.clock = {
    steps: 32,
    step: 0,
    microSteps: 12,
    microStep: 0
  };
  function addToMemory(eventTime,eventMessage){
    //find if I this event needs to be merged with other
    // console.log("mem",eventMessage.value,eventTime);
    // ownerModule.handle('event recorded',eventTime,eventMessage);
    var eventMerged=false;
    for(var memIndex in memoryArray){
      for(var otherEvent of memoryArray[memIndex]){
        if(otherEvent.compareTo(eventMessage,["value"])){
          var otherEventStart=memIndex;
          var thisEventStart=eventTime;
          //by default, compare start and end by steps
          var compareTimeindex=0;
          //unless their step is the same, in which case we compare starts by microStep
          if(thisEventStart==otherEventStart){
            compareTimeindex=1;
          }
          //thisEvent started after the otherevent
          if(
            thisEventStart[compareTimeindex]
            > otherEventStart[compareTimeindex]
          ){
            console.log("started after");
            //and otherEvent length reaches this event
            if( otherEvent.duration[compareTimeindex] + otherEventStart[compareTimeindex] >= thisEventStart[compareTimeindex] ){
              console.log(" >reaches");
              eventMerged=true;
              //merge the two
              otherEvent.duration[compareTimeindex] =Math.max(
                otherEvent.duration[compareTimeindex],
                otherEventStart[compareTimeindex] - (thisEventStart[compareTimeindex]+thisEvent.duration [compareTimeindex])
              );
              //warparound
              if(compareTimeindex===0){
                while(otherEvent.duration[0]<=compareTimeindex){
                  otherEvent.duration[0]+=self.clock.steps;
                }
              }else{
                while(otherEvent.duration[1]<=compareTimeindex){
                  otherEvent.duration[1]+=self.clock.microSteps;
                }
              }

            }
          }/*else{
            //thisEvent started before the otherevent
            //and reaches the other event
            if(started[0]>=otherEvent.duration[0]+otherStep){
              eventMerged=true;
              //merge the two: enlarge duration and advance start
              otherEvent.duration[0]=Math.max(otherStep.duration[0],otherStep-(started[0]+duration[0]));
              //len warparound
              if(otherEvent.duration[0]<=0){
                otherEvent.duration=tapeLength.value;
              }
              createNewTapeEvent(otherEvent,[started]);
              delete tape[otherStep][otherMicroStep][n];
            }
          }*/
        }
      }
    }
    if(!eventMerged){
      if(!memoryArray[eventTime])memoryArray[eventTime]=[];
      memoryArray[eventTime].push(eventMessage);
    }
  }
  this.addEvent=function(eventMessage){
    // console.log(memoryArray);

    // console.log("0rec",eventMessage.value);
    var timeNow=[self.clock.step,self.clock.microStep];
    var eventKey=[ eventMessage.value[1],eventMessage.value[2] ];
    if(eventMessage.value[0]==headers.triggerOn){
      eventMessage.starts=timeNow;
      trackedNotes[eventKey]=eventMessage;
    }else if(eventMessage.value[0]==headers.triggerOff){
      var trackedNote=trackedNotes[eventKey];
      if(trackedNote){
        //started looks like: [step,microStep]
        var started=trackedNote.starts;
        trackedNote.duration=[self.clock.step-started[0],self.clock.microStep-started[1]];
        //wraparound durations
        while(trackedNote.duration[0]<1){
          // console.log("1rec",eventMessage.value);
          trackedNote.duration[0]+=self.clock.steps;
        }
        while(trackedNote.duration[1]<0){
          // console.log("2rec",eventMessage.value);
          trackedNote.duration[1]+=self.clock.microSteps;
        }
        addToMemory(started,trackedNote);
      }else{
        console.warn("received a noteoff for a note that was not being tracked");
      }
    }else{
      addToMemory(timeNow,eventMessage);
    }
  }
  this.clockFunction=function(_currentStep,_currentMicroStep){
    self.clock.step=_currentStep;
    self.clock.microStep=_currentMicroStep;
  }

  this.setExternalClock=function(externalClock){
    self.clock=externalClock;
    self.clockFunction=function(){};
  }
  return this;
}
module.exports=Recorder;