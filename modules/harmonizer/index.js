'use strict';
var EventMessage=require('../../datatypes/EventMessage.js');
var patternEvent=require('../../datatypes/EventPattern.js');
var moduleInstanceBase=require('../moduleInstanceBase');


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
    /** TODO: this naming convention **/
    var thisInstance=this;

    this.currentScale=0;
    this.baseEventMessage=new EventMessage({value:[1,0,60,90]});
    var scaleMap={};
    //keep track of triggered notes
    this.scaleArray={};
    var noteOnTracker={}

    this.uiScaleChange=function(scalen){
      thisInstance.currentScale=scalen;
    }

    this.uiTriggerOn=function(gradeNumber){
      thisInstance.triggerOn(gradeNumber);
    }

    this.uiTriggerOff=function(gradeNumber){
      thisInstance.triggerOff(gradeNumber);
    }

    this.triggerOn=function(gradeNumber){
      var newEvent=getOutputMessageFromNumber(gradeNumber);
      if(newEvent){
        thisInstance.output(newEvent);

        console.log(newEvent);
        //TODO: makes more sense to make a eventPattern, so then we don't need to calculate the noteoff "manually"
        if(!noteOnTracker[gradeNumber])noteOnTracker[gradeNumber]=[];
        noteOnTracker[gradeNumber].push(newEvent);
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
      var eventMessage=event.EventMessage
      //TODO: if I don't have that chord or it is empty, I just don't play anything.
      if(!thisInstance.mute)
        if(eventMessage.value[0]==2||eventMessage.value[3]==0){
          thisInstance.triggerOff(eventMessage.value[2]);
        }else{
          // console.log("B");
          this.handle('receive',eventMessage);
          if(eventMessage.value[0]==3){
            //header 3 is change chord
            // if(!thisInstance.currentScale)thisInstance.cu
            thisInstance.currentScale=eventMessage.value[2];
            thisInstance.handle('chordchange');
            // console.log("chordchange",event);
          }else if(eventMessage.value[0]==1){
            thisInstance.triggerOn(eventMessage.value[2]);
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

  }
})};