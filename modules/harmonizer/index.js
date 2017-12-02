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
    var thisInstance=this;
    this.recordingUi=true;
    this.currentScale=0;

    // this.baseNote={value:0};

    this.baseEventMessage=new EventMessage({value:[1,-1,0,90]});
    var scaleMap={};
    //keep track of triggered notes
    this.scaleArray={};
    var noteOnTracker={}

    function defaultState(){
      for(let a=0;a<16;a++)
      thisInstance.newScaleMap(a,2741);
    }
    this.uiScaleChange=function(scalen){
      thisInstance.currentScale=scalen;
      if(thisInstance.recordingUi){
        thisInstance.recordOutput(new EventMessage({
          value:[
            CHORDCHANGEHEADER,
            thisInstance.baseEventMessage.value[1],
            scalen,100
          ]}));
      }
    }
    var uiNoteOnTracker={};
    this.uiTriggerOn=function(gradeNumber,underImpose=false){
      thisInstance.triggerOn(gradeNumber,underImpose);
      if(thisInstance.recordingUi){
        var uiGeneratedEvent=new EventMessage({ value: [TRIGGERONHEADER,thisInstance.baseEventMessage.value[1],gradeNumber,100 ]});
        if(underImpose){
          uiGeneratedEvent.underImpose(underImpose);
        }
        thisInstance.recordOutput(uiGeneratedEvent);
        // console.log(uiGeneratedEvent.value);
        uiNoteOnTracker[gradeNumber]=uiGeneratedEvent;
      }
    }

    this.uiTriggerOff=function(gradeNumber){
      if(uiNoteOnTracker[gradeNumber]){
        thisInstance.triggerOff(gradeNumber);
        if(thisInstance.recordingUi){
          thisInstance.recordOutput(new EventMessage({
            value:[
              TRIGGEROFFHEADER,
              uiNoteOnTracker[gradeNumber].value[1],
              uiNoteOnTracker[gradeNumber].value[2],
              uiNoteOnTracker[gradeNumber].value[3]
            ]}));
        }
        delete uiNoteOnTracker[gradeNumber];
      }else{
        thisInstance.triggerOff(gradeNumber);
        if(thisInstance.recordingUi){
          thisInstance.recordOutput(new EventMessage({
            value:[
              TRIGGEROFFHEADER,
              thisInstance.baseEventMessage.value[1],
              gradeNumber,100
            ]}));
        }
      }
    }

    this.triggerOn=function(gradeNumber,underImpose=false){
      var newEvent=getOutputMessageFromNumber(gradeNumber);
      if(newEvent){
        if(underImpose){
          newEvent.underImpose(underImpose);
        }
        thisInstance.output(newEvent);

        // console.log(newEvent);
        //TODO: makes more sense to make a eventPattern, so then we don't need to calculate the noteoff "manually"
        if(!noteOnTracker[gradeNumber])noteOnTracker[gradeNumber]=[];
        noteOnTracker[gradeNumber].push(newEvent);
        thisInstance.handle('note played',{triggeredGrade:gradeNumber,triggeredNote:newEvent.value[2]});
      }
    }

    this.triggerOff=function(gradeNumber){
      if(noteOnTracker[gradeNumber]){
        for(var a of noteOnTracker[gradeNumber]){
          // console.log("A");
          var newEvent=new EventMessage(a);
          newEvent.value[3]=0;
          newEvent.value[0]=2;
          thisInstance.output(newEvent);
          // var scaleLength=thisInstance.scaleArray[thisInstance.currentScale].length;
          // thisInstance.handle('messagesend',{eventMessage:newEvent,sub:newEvent.value[2]%scaleLength});
        }
        delete noteOnTracker[gradeNumber];
      }
    }

    var inputTransformNumber=function(inputNumber){
      if(thisInstance.scaleArray[thisInstance.currentScale]){
        var scaleLength=thisInstance.scaleArray[thisInstance.currentScale].length;
        var noteWraped=thisInstance.scaleArray[thisInstance.currentScale][inputNumber%scaleLength];
        var ret=noteWraped+(12*Math.floor(inputNumber/scaleLength));
        // console.log(thisInstance.baseEventMessage);
        return ret+thisInstance.baseEventMessage.value[2];
      }else{
        return false;
      }
    }
    var getOutputMessageFromNumber=function(number){
      var outputMessage=new EventMessage(thisInstance.baseEventMessage);
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
      if(!thisInstance.mute)
        if(eventMessage.value[0]==2||eventMessage.value[3]==0){
          thisInstance.triggerOff(eventMessage.value[2]);
        }else{
          this.handle('receive',eventMessage);
          if(eventMessage.value[0]==3){
            //header 3 is change chord
            // if(!thisInstance.currentScale)thisInstance.cu
            thisInstance.currentScale=eventMessage.value[2];
            thisInstance.handle('chordchange');
            // console.log("chordchange",event);
          }else if(eventMessage.value[0]==1){
            thisInstance.triggerOn(eventMessage.value[2],eventMessage);
          }else{
            console.log("wasted event",eventMessage,(eventMessage.value[0]|0xf)+"=!"+0);
          }
        }
    }
    this.newScaleMap=function(identifier,to){
        // console.log("scale map update "+identifier);
        scaleMap[identifier]=to;
        thisInstance.scaleArray[identifier]=[];
        var count=0;
        for(var a =0; a<12; a++){
          if((scaleMap[identifier]>>a)&1){
            thisInstance.scaleArray[identifier].push(a);
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