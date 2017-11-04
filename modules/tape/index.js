'use strict';
//this module is not active because it's not listed in "modulePrototypesList.js". It is just an boilerplate to create modules
var EventMessage=require('../../datatypes/EventMessage.js');
var moduleInstanceBase=require('../moduleInstanceBase');
//we require the user interface script. It should be one per hardware that we want to be compatible with.
var uix16Control=require('./x16basic');
/**
@constructor ModuleSingleton
singleton, only one per run of the program
every module needs to run at the beginning of the runtime to register it's interactor in the interactionManager
*/

var CLOCKABSOLUTEHEADER = 0x03;
var CLOCKTICKHEADER = 0x00;
var TRIGGERONHEADER = 0x01;
var TRIGGEROFFHEADER = 0x02;
var RECORDINGHEADER = 0xAA;
module.exports=function(environment){return new (function(){
  //creating the instance of the singleton for the user interface
  var interactorSingleton=this.InteractorSingleton=new uix16Control(environment);
  //counting how many instances of this module there are, so we can give unique names
  var instanced=0;
  var name=function(){
    this.name=this.baseName+" "+instanced;
    instanced++;
  }
  this.Instance=function(properties){
    var tapeLength=this.tapeLength={value:8};
    moduleInstanceBase.call(this);
    this.baseName="tape recorder";
    name.call(this);
    if(properties.name) this.name=properties.name;
    var myInteractor=this.interactor=new interactorSingleton.Instance(this);
    this.interactor.name=this.name;
    thisModule=this;
/*
tape memory example:
idea a
tape.step[microStep[eventMessages]]
{
  1:[0:[Evt]],
  12:[2:[Evt,Evt]],
  24:[0:[Evt,Evt]],
}
there is a problem with noteoffs. perhaps memory should work different.

idea b
tape[stringifiedEvtSignature]{start:[step,microstep],end:[step,microstep]}
{
  "[1,2,34,100]":{start:[8,0],end:[11(may be smaller than start, warped),3]},
}
idea c
tape[-not event- signature][{start,end},{start,end}];
*/
  var nextIdentifier=0;
    //stores the events in a step/microstep
    this.tape={};
    var notesBeingRecorded=new Set();
    function getEventPatternFromNoteOff(noteOffEvt){
      return "note off event";
    };
    function recordEvent(evt){
      if(evt.value[0]==TRIGGERONHEADER){
        notesBeingRecorded.add({
          eventPattern:new EventPattern({identifier=nextIdentifier++}).fromEventMessage(evt),
          started:[currentStep,currentMicroStep],
          duration:0,
        });
      }else if(evt.value[0]==TRIGGEROFFHEADER){
        var storableEvent=getEventPatternFromNoteOff(evt);
        eventStore(storableEvent.eventPattern,storableEvent.started,eventDuration);
      }
    };
    function eventsInCreationCountMicroStep(microStep,base){
      for(var evt of notesBeingRecorded){
        if(evt.duration[1]>base){
          evt.duration[1]=0;
          evt.duration[0]++;
        }else{
          evt.duration[1]++;
        }
      }
    }
    var readingHeader=[0,0];
    function tapeRead(microStep,base){
      if(tape[readingHeader[0]]){
        if(tape[readingHeader[0]][readingHeader[1]]){
          for(var a in tape[readingHeader[0]][readingHeader[1]]){
            thisModule.output(tape[readingHeader[0]][readingHeader[1]][a]);
          }
        }
      }
      if(microStep==0){
        readingHeader[0]++;
        readingHeader[1]=0;
        readingHeader[0]%=tapeLength.value;
      }else{
        readingHeader[1]++;
      }
    }
    function eventStore(eventPattern,started,duration){
      var eventMerged=false;
      //find each event that is the same being added
      for(var otherStep in tape){
        for (var otherMicroStep in tape[otherStep]){
          if(tape[otherStep][otherMicroStep].compareTo(eventPattern,"value")){
            for(var n in tape[step][microStep]){
              var otherEvent=tape[otherStep][otherMicroStep][n];
              //check if this equal event collides with the one being added
              var otherEventStartCompare=otherStep;
              var thisEventStartCompare=started[0];
              var comparingMicroSteps=false;
              if(thisEventStartCompare==otherEventStartCompare){
                otherEventStartCompare=otherMicroStep;
                thisEventStartCompare=started[1];
                comparingMicroSteps=true;
              }
              //thisEvent started after the otherevent
              if(thisEventStartCompare>otherEventStartCompare){

                if(otherEvent.length[0]+otherStep>=started[0]){
                  //and otherEvent length reaches this event
                  //currently counts only in steps

                  eventMerged=true;
                  //merge the two
                  otherEvent.length[0]=Math.max(otherEvent.length[0],otherStep-(started[0]+duration[0]));
                  //warparound
                  if(otherEvent.length[0]<=0){
                    otherEvent.length=tapeLength.value;
                  }
                }
              }else{
                //thisEvent started before the otherevent
                //and reaches the other event
                if(started[0]>=otherEvent.length[0]+otherStep){
                  eventMerged=true;
                  //merge the two: enlarge length and advance start
                  otherEvent.length[0]=Math.max(otherStep.length[0],otherStep-(started[0]+duration[0]));
                  //len warparound
                  if(otherEvent.length[0]<=0){
                    otherEvent.length=tapeLength.value;
                  }
                  createNewTapeEvent(otherEvent,[started]);
                  delete tape[otherStep][otherMicroStep][n];
                }
              }
            }
          }
        }
      }
      if(!eventMerged){
        createNewTapeEvent(eventPattern,started);
      }
    }
    function createNewTapeEvent(content,started){
      if(!tape[started[0]]){
        tape[started[0]]={};
        if(!tape[started[0]][started[1]]){
          tape[started[0]][started[1]]=[];
        }
      }
      tape[started[0]][started[1]].push(content);
    }

    this.eventReceived=function(event){
      var eventMessage=event.EventMessage;
      if(eventMessage.value[0]==CLOCKTICKHEADER){
        eventsInCreationCountMicroStep(evt.value[1],evt.value[2]);
        tapeRead(evt.value[1],evt.value[2]);
      }else if(eventMessage.value[0]==TRIGGERONHEADER){

      }else if(eventMessage.value[0]==TRIGGEROFFHEADER){

      }else if(eventMessage.value[0]==CLOCKABSOLUTEHEADER){

      }else if(eventMessage.value[0]==TRIGGEROFFHEADER){

      }else if(eventMessage.value[0]==RECORDINGHEADER){
        eventMessage.value.shift();
        recordEvent(eventMessage);
      }
    }
  }
})};