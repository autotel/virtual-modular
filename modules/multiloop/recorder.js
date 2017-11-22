'use strict';
var CLOCKTICKHEADER = 0x00;
var TRIGGERONHEADER = 0x01;
var TRIGGEROFFHEADER = 0x02;
var RECORDINGHEADER = 0xAA;
/**
@param ownerModule: the module that will use this Recorder
@param memoryArray: the array where the recorded events go. The events will be indexed using [step, microStep] as index.
*/
var Recorder = function(ownerModule,memoryArray){
  var trackedNotes=[];
  var currentStep=0;
  var currentMicroStep=0;
  var eventsWithNoteOn={};
  function addToMemory(eventTime,eventMessage){
    //find if I this event needs to be merged with other
    // console.log("mem",eventMessage.value,eventTime);
    ownerModule.handle('event recorded',eventTime,eventMessage);
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
                  otherEvent.duration[0]+=currentStep;
                }
              }else{
                while(otherEvent.duration[1]<=compareTimeindex){
                  otherEvent.duration[1]+=currentMicroStep;
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
  this.getEvent=function(eventMessage){
    console.log("rec",eventMessage.value);
    var timeNow=[currentStep,currentMicroStep];
    var eventKey=[ eventMessage.value[1],eventMessage.value[2] ];
    if(eventMessage.value[0]==TRIGGERONHEADER){
      eventMessage.started=timeNow;
      trackedNotes[eventKey]=eventMessage;
    }else if(eventMessage.value[0]==TRIGGEROFFHEADER){
      var trackedNote=trackedNotes[eventKey];
      if(trackedNote){
        //started looks like: [step,microStep]
        var started=trackedNote.started;
        trackedNote.duration=[currentStep-started[0],currentMicroStep-started[1]];
        //wraparound durations
        while(trackedNote.duration[0]<1){
          trackedNote.duration[0]+=currentStep;
        }
        while(trackedNote.duration[1]<0){
          trackedNote.duration[1]+=currentMicroStep;
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
    currentStep=_currentStep;
    currentMicroStep=_currentMicroStep;
  }
  return this;
}
module.exports=Recorder;