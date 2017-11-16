'use strict';
var EventMessage=require('../../datatypes/EventMessage.js');
var moduleInstanceBase=require('../moduleInstanceBase');
var uix16Control=require('./x16basic');
// var clockSpec=require('../standards/clock.js');
var CLOCKTICKHEADER = 0x00;
var TRIGGERONHEADER = 0x01;
var TRIGGEROFFHEADER = 0x02;
var RECORDINGHEADER = 0xAA;
/**
@constructor ModuleSingleton
singleton, only one per run of the program
every module needs to run at the beginning of the runtime to register it's interactor in the interactionManager

http://www.synthtopia.com/content/2008/05/29/glitchds-cellular-automaton-sequencer-for-the-nintendo-ds/
http://www.synthtopia.com/content/2009/04/29/game-of-life-music-sequencer/
http://www.synthtopia.com/content/2011/01/12/game-of-life-music-sequencer-for-ios-runxt-life/
*/

module.exports=function(environment){return new (function(){
  var interactorSingleton=this.InteractorSingleton=new uix16Control(environment);
  // environment.interactionMan.registerModuleInteractor(uix16Control);
  var testcount=0;
  var testGetName=function(){
    this.name=this.baseName+" "+testcount;
    testcount++;
  }
  /**
  @constructor
  the instance of the of the module, ment to be instantiated multiple times.
  require to moduleBase.call
  */
  this.Instance=function(properties){
    moduleInstanceBase.call(this);
    this.baseName="delay";
    testGetName.call(this);
    if(properties.name) this.name=properties.name;

    var noteOffSuperImpose=new EventMessage({value:[TRIGGEROFFHEADER]});
    var thisModule=this;
    var myBitmap=0;
    //[[step,microStep]]={EventPattern:EP,age:how old}
    var memory=[];
    this.recording=true;

    var clock=this.clock={steps:16*3,step:0,microSteps:12,microStep:0};

    var noteOnTracker=new(function(){
      var trackedNotes=[];
      this.trackEventMessage=function(eventMessage,callback){
        eventMessage.started=currentMicroStep;
        trackedNotes.push(eventMessage);
        if(eventMessage.value[0]==TRIGGERONHEADER){
          eventKey=[eventMessage.value[1],eventMessage.value[2]];
          trackedNotes[eventKey]=eventMessage;
          if(!isNaN(eventMessage.duration)){
            callback.call(eventMessage,false);
          }else{
            callback.call(eventMessage,"error: noteon without duration");
          }
        }else{
          callback.call(eventMessage,false);
        }
      }
      this.clockFunction=function(currentsStep,currentMicroStep){
        for(var a in trackedNotes){
          if(trackedNotes.value[0]==TRIGGERONHEADER){
            if(currentMicroStep-trackedNotes[a].started>trackedNotes[a].duration){
              thisModule.output(trackedNotes[a].clone().superImpose(noteOffSuperImpose));
            }
          }
        }
      }
      this.setAllOff=function(){
        for(var a in trackedNotes){
          if(trackedNotes.value[0]==TRIGGERONHEADER){
            thisModule.output(trackedNotes[a].clone().superImpose(noteOffSuperImpose));
          }
        }
      }
      return this;
    })();

    var recorder=new(function(){
      var trackedNotes=[];
      var currentStep=0;
      var currentMicroStep=0;
      var eventsWithNoteOn={};
      function addToMemory(eventTime,eventMessage){
        //find if I this event needs to be merged with other
        console.log("mem",eventMessage.value,eventTime);
        var eventMerged=false;
        for(var memIndex in memory){
          for(var otherEvent of memory[memIndex]){
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
                      otherEvent.duration[0]+=clock.steps;
                    }
                  }else{
                    while(otherEvent.duration[1]<=compareTimeindex){
                      otherEvent.duration[1]+=clock.microSteps;
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
          if(!memory[eventTime])memory[eventTime]=[];
          memory[eventTime].push(eventMessage);
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
              trackedNote.duration[0]+=clock.steps;
            }
            while(trackedNote.duration[1]<0){
              trackedNote.duration[1]+=clock.microSteps;
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
    })();
    var baseEventMessage=this.baseEventMessage= new EventMessage({value:[TRIGGERONHEADER,-1,-1,-1]});
    var myInteractor=new interactorSingleton.Instance(this);
    this.interactor=myInteractor;
    this.interactor.name=this.name;
    this.memoryOutput=function(eventPattern){
      //add eventPattern to a lengthManager, play that
      noteOnTracker.trackEventMessage(eventPattern,function(error){
        if(error){ console.error(error); return }
        thisModule.output(eventPattern);
      });
    }
    var clockFunction=function(){
      recorder.clockFunction(clock.step,clock.microStep);
      noteOnTracker.clockFunction(clock.step,clock.microStep);
      if(memory[[clock.step,clock.microStep]]){
        console.log(`memory[${clock.step},${clock.microStep}]`);
        for (var event of memory[[clock.step,clock.microStep]]){
          console.log(`y:${event}`);
          thisModule.output(event);
        }
      }
    }

    this.eventReceived=function(evt){
      if(thisModule.recording){
        if(evt.EventMessage.value[0]!=CLOCKTICKHEADER) recorder.getEvent(evt.EventMessage);
      }
      if(evt.EventMessage.value[0]==CLOCKTICKHEADER){
        // console.log("CK");
        clock.microStep=evt.EventMessage.value[2];
        clock.microSteps=evt.EventMessage.value[1];
        if(evt.EventMessage.value[2]%evt.EventMessage.value[1]==0){
          clock.step++;
          clock.step%=clock.steps;
        }
        clockFunction();
      }else if(evt.EventMessage.value[0]==TRIGGERONHEADER){
        recorder.getEvent(evt.EventMessage);
      }else if(evt.EventMessage.value[0]==TRIGGEROFFHEADER){
      }else if(evt.EventMessage.value[0]==TRIGGEROFFHEADER+1){
      }else if(evt.EventMessage.value[0]==RECORDINGHEADER){
        evt.EventMessage.value.shift();
        thisModule.eventReceived(evt);
      }else{
      }
    }

    this.getBitmap16=function(){
      return myBitmap;
    }
    this.delete=function(){
      for(var noff of noteOnTracker){
        noteOnTracker.setAllOff(noff);
      }
    }
  }
})};