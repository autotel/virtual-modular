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
    this.baseName="tape";
    testGetName.call(this);
    if(properties.name) this.name=properties.name;

    var noteOffSuperImpose=new EventMessage({value:[TRIGGEROFFHEADER]});
    var self=this;
    var myBitmap=0;
    //[[step,microStep]]={EventPattern:EP,age:how old}
    var memory=this.memory=[];
    this.recording=true;
    var clock=this.clock={steps:32,step:0,microSteps:12,microStep:0};
    /**
    @param callback the function to call for each memory event. The eventMessage will be this. Callback is called with @param-s (timeIndex,eventIndex) where timeIndex is an array containing [step,microStep] of the evenMessage caller, and eventIndex is the number of the event in that very step, since each step could contain more than one event.
    you can set the time range to take in consideration using:
    @param {array} timeStart time of the first memory event on whom to call the callback, in [step,microStep]
    @param {array} timeEnd time of the last memory event on whom to call the callback, in [step,microStep]
    */
    this.eachMemoryEvent=function(callback,timeStart,timeEnd){
      if(!timeStart) timeStart=[0,0];
      if(!timeEnd) timeEnd=[clock.steps,clock.microSteps];
      if(timeStart[0]===undefined)console.warn("eachMemoryEvent timeStart parameter must be array of [step,microStep]");
      if(timeEnd[0]===undefined)console.warn("eachMemoryEvent timeEnd parameter must be array of [step,microStep]");
      var timeRangeStarted=false;
      for(var timeIndex in memory){
        if(!timeRangeStarted){
          if(timeStart[0]<=timeIndex[0]&&timeStart[1]<=timeIndex[1]){
            timeRangeStarted=true;
          }
        }
        if(timeRangeStarted){
          for(var eventIndex in memory[timeIndex]){
            callback.call(memory[timeIndex][eventIndex],JSON.parse("["+timeIndex+"]"),eventIndex);
          }
        }
        if(timeIndex[0]>=timeEnd[0]&&timeIndex[1]>=timeEnd[1]){
          break;
        }
      }
    }

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
        if(self.mute) return;
        for(var a in trackedNotes){
          if(trackedNotes.value[0]==TRIGGERONHEADER){
            if(currentMicroStep-trackedNotes[a].started>trackedNotes[a].duration){
              self.output(trackedNotes[a].clone().superImpose(noteOffSuperImpose));
            }
          }
        }
      }
      this.setAllOff=function(){
        for(var a in trackedNotes){
          if(trackedNotes.value[0]==TRIGGERONHEADER){
            self.output(trackedNotes[a].clone().superImpose(noteOffSuperImpose),true);
          }

          delete trackedNotes[a];
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
        // console.log("mem",eventMessage.value,eventTime);
        self.handle('event recorded',eventTime,eventMessage);
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

    this.x16Interface=myInteractor;
    this.interactor=myInteractor;
    this.interactor.name=this.name;
    this.memoryOutput=function(eventPattern){
      if(self.mute) return;
      //add eventPattern to a lengthManager, play that
      noteOnTracker.trackEventMessage(eventPattern,function(error){
        if(error){ console.error(error); return }
        self.output(eventPattern);
      });
    }
    var clockFunction=function(){
      recorder.clockFunction(clock.step,clock.microStep);
      noteOnTracker.clockFunction(clock.step,clock.microStep);
      if(memory[[clock.step,clock.microStep]]){
        // console.log(`memory[${clock.step},${clock.microStep}]`);
        for (var event of memory[[clock.step,clock.microStep]]){
          // console.log(`y:${event}`);
          self.output(event);
        }
      }
    }

    this.eventReceived=function(evt){
      if(self.recording){
        if(evt.eventMessage.value[0]!=CLOCKTICKHEADER) recorder.getEvent(evt.eventMessage);
      }
      if(evt.eventMessage.value[0]==CLOCKTICKHEADER){
        // console.log("CK");
        clock.microStep=evt.eventMessage.value[2];
        clock.microSteps=evt.eventMessage.value[1];
        if(evt.eventMessage.value[2]%evt.eventMessage.value[1]==0){
          clock.step++;
          clock.step%=clock.steps;
          // self.handle('step');
        }
        clockFunction();
      }else if(evt.eventMessage.value[0]==TRIGGERONHEADER){
        recorder.getEvent(evt.eventMessage);
      }else if(evt.eventMessage.value[0]==TRIGGEROFFHEADER){
      }else if(evt.eventMessage.value[0]==TRIGGEROFFHEADER+1){
      }else if(evt.eventMessage.value[0]==RECORDINGHEADER){
        evt.eventMessage.value.shift();
        self.eventReceived(evt);
      }else{
      }
    }

    this.delete=function(){
      for(var noff of noteOnTracker){
        noteOnTracker.setAllOff(noff);
      }
    }
  }
})};