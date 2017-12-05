'use strict';
var EventMessage=require('../../datatypes/EventMessage.js');
var patternEvent=require('../../datatypes/EventPattern.js');
var moduleInstanceBase=require('../moduleInstanceBase');
var scaleNames=require('./scaleNames.js');
var CLOCKTICKHEADER = 0x00;
var TRIGGERONHEADER = 0x01;
var TRIGGEROFFHEADER = 0x02;
var RECORDINGHEADER = 0xAA;
var CHORDCHANGEHEADER = 0x03;

var uix16Control=require('./x16basic');
/**
@constructor ModuleSingleton
singleton, only one per run of the program
every module needs to run at the beginning of the runtime to register it's interactor in the interactionManager
*/
module.exports=function(environment){return new (function(){
  var interactorSingleton=this.InteractorSingleton=new uix16Control(environment);
  var instanced=0;
  var name=function(){
    this.name=this.baseName+" "+instanced;
    instanced++;
  }
  /**
  @constructor
  the instance of the of the module, ment to be instantiated multiple times.
  require to moduleBase.call
  */
  this.Instance=function(properties){
    moduleInstanceBase.call(this);
    this.baseName="harmonizer";
    name.call(this);
    if(properties.name) this.name=properties.name;
    /** TODO: this naming convention **/
    var self=this;
    this.recordingUi=true;
    this.currentScale=0;

    // this.baseNote={value:0};

    this.baseEventMessage=new EventMessage({value:[1,-1,0,90]});
    var scaleMap={};
    //keep track of triggered notes
    this.scaleArray={};
    var noteOnTracker={}

    function defaultState(){
      var c=0;
      for(let scale in scaleNames.nameToScale){
        self.newScaleMap(c,scaleNames.nameToScale[scale]);
        if (c++>15) break;
      }
    }
    this.uiScaleChange=function(scalen){
      self.currentScale=scalen;
      if(self.recordingUi){
        self.recordOutput(new EventMessage({
          value:[
            CHORDCHANGEHEADER,
            self.baseEventMessage.value[1],
            scalen,100
          ]}));
      }
    }
    var uiNoteOnTracker={};
    this.uiTriggerOn=function(gradeNumber,underImpose=false){
      self.triggerOn(gradeNumber,underImpose);
      if(self.recordingUi){
        var uiGeneratedEvent=new EventMessage({ value: [TRIGGERONHEADER,self.baseEventMessage.value[1],gradeNumber,100 ]});
        if(underImpose){
          uiGeneratedEvent.underImpose(underImpose);
        }
        self.recordOutput(uiGeneratedEvent);
        // console.log(uiGeneratedEvent.value);
        uiNoteOnTracker[gradeNumber]=uiGeneratedEvent;
      }
    }

    this.uiTriggerOff=function(gradeNumber){
      if(uiNoteOnTracker[gradeNumber]){
        self.triggerOff(gradeNumber);
        if(self.recordingUi){
          self.recordOutput(new EventMessage({
            value:[
              TRIGGEROFFHEADER,
              uiNoteOnTracker[gradeNumber].value[1],
              uiNoteOnTracker[gradeNumber].value[2],
              uiNoteOnTracker[gradeNumber].value[3]
            ]}));
        }
        delete uiNoteOnTracker[gradeNumber];
      }else{
        self.triggerOff(gradeNumber);
        if(self.recordingUi){
          self.recordOutput(new EventMessage({
            value:[
              TRIGGEROFFHEADER,
              self.baseEventMessage.value[1],
              gradeNumber,100
            ]}));
        }
      }
    }

    this.triggerOn=function(gradeNumber,underImpose=false){
      if(self.mute) return;
      var newEvent=getOutputMessageFromNumber(gradeNumber);
      if(newEvent){
        if(underImpose){
          newEvent.underImpose(underImpose);
        }
        self.output(newEvent);

        // console.log(newEvent);
        //TODO: makes more sense to make a eventPattern, so then we don't need to calculate the noteoff "manually"
        if(!noteOnTracker[gradeNumber])noteOnTracker[gradeNumber]=[];
        noteOnTracker[gradeNumber].push(newEvent);
        self.handle('note played',{triggeredGrade:gradeNumber,triggeredNote:newEvent.value[2]});
      }
    }

    this.triggerOff=function(gradeNumber){
      if(noteOnTracker[gradeNumber]){
        for(var a of noteOnTracker[gradeNumber]){
          // console.log("A");
          var newEvent=new EventMessage(a);
          newEvent.value[3]=0;
          newEvent.value[0]=2;
          self.output(newEvent,true);
          // var scaleLength=self.scaleArray[self.currentScale].length;
          // self.handle('messagesend',{eventMessage:newEvent,sub:newEvent.value[2]%scaleLength});
        }
        delete noteOnTracker[gradeNumber];
      }
    }

    var inputTransformNumber=function(inputNumber){
      if(self.scaleArray[self.currentScale]){
        var scaleLength=self.scaleArray[self.currentScale].length;
        var noteWraped=self.scaleArray[self.currentScale][inputNumber%scaleLength];
        var ret=noteWraped+(12*Math.floor(inputNumber/scaleLength));
        // console.log(self.baseEventMessage);
        return ret+self.baseEventMessage.value[2];
      }else{
        return false;
      }
    }
    var getOutputMessageFromNumber=function(number){
      var outputMessage=new EventMessage(self.baseEventMessage);
      var num=inputTransformNumber(number);
      // console.log("itn",num);
      if(num){
        outputMessage.value[2]=num;
        return outputMessage;
      }else{
        return false;
      }
    }
    this.eventReceived=function(event){
      /**TODO: event.eventMessage is not a constructor, don't pass the mame in caps!*/
      var eventMessage=event.eventMessage
      if(!self.mute)
        if(eventMessage.value[0]==2||eventMessage.value[3]==0){
          self.triggerOff(eventMessage.value[2]);
        }else{
          this.handle('receive',eventMessage);
          if(eventMessage.value[0]==3){
            //header 3 is change chord
            // if(!self.currentScale)self.cu
            self.currentScale=eventMessage.value[2];
            self.handle('chordchange');
            // console.log("chordchange",event);
          }else if(eventMessage.value[0]==1){
            self.triggerOn(eventMessage.value[2],eventMessage);
          }else{
            console.log("wasted event",eventMessage,(eventMessage.value[0]|0xf)+"=!"+0);
          }
        }
    }
    this.newScaleMap=function(identifier,to){
        // console.log("scale map update "+identifier);
        scaleMap[identifier]=to;
        self.scaleArray[identifier]=[];
        var count=0;
        for(var a =0; a<12; a++){
          if((scaleMap[identifier]>>a)&1){
            self.scaleArray[identifier].push(a);
          }
        }
      }
      this.getScaleMap=function(identifier){
        return scaleMap[identifier]||0x00;
      }
      var myInteractor=this.interactor=new interactorSingleton.Instance(this);
      this.interactor.name=this.name;
      defaultState();
  }
})};