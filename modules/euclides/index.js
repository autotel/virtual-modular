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
    var noteOnTracker=new Set();
    var thisInstance=this;
    var myBitmap=0;

    var clock=this.clock={subSteps:4,subStep:0}

    moduleInstanceBase.call(this);
    this.baseName="euclides";
    testGetName.call(this);
    if(properties.name) this.name=properties.name;

    var baseEventMessage=this.baseEventMessage= new EventMessage({value:[TRIGGERONHEADER,-1,-1,-1]});
    var myInteractor=new interactorSingleton.Instance(this);
    this.interactor=myInteractor;
    this.interactor.name=this.name;

    var patterns=[];

    var setStep= this.setStep=function(step,patternN=0){
      patterns[patternN]|=1<<step;
    }
    var clearStep= this.clearStep=function(step,patternN=0){
      patterns[patternN]&=~(1<<step);
    }
    var toggleStep= this.toggleStep=function(step,patternN=0){
      if(patterns[patternN]&1<<step){
        clearStep(step);
      }else{
        setStep(step);
      }
      return myBitmap;
    }

    var setFixedStep= this.setFixedStep=function(step,patternN=0){
      fixedCells|=1<<step;
      setStep(step);
    }
    var clearFixedStep= this.clearFixedStep=function(step,patternN=0){
      fixedCells&=~(1<<step);
      clearStep(step);
    }
    var toggleFixedStep= this.toggleFixedStep=function(step,patternN=0){
      if(patterns[patternN]&1<<step){
        clearFixedStep(step);
      }else{
        setFixedStep(step);
      }
      return myBitmap;
    }

    this.eventReceived=function(evt){
      if(evt.EventMessage.value[0]==CLOCKTICKHEADER&&(evt.EventMessage.value[2]%evt.EventMessage.value[1]==0)){
        clock.subStep++;
        if(clock.subStep>=clock.subSteps){
          clock.subStep=0;
          stepOperation();
          this.handle('step');
        }
      }else if(evt.EventMessage.value[0]==TRIGGERONHEADER){
        // this.setFixedStep(evt.EventMessage.value[2]%16);
        this.setStep(evt.EventMessage.value[2]%16);
      }else if(evt.EventMessage.value[0]==TRIGGEROFFHEADER){
        // this.clearFixedStep(evt.EventMessage.value[2]%16);
      }else if(evt.EventMessage.value[0]==TRIGGEROFFHEADER+1){
        // this.setStep(evt.EventMessage.value[2]%16);
      }else if(evt.EventMessage.value[0]==RECORDINGHEADER){
        evt.EventMessage.value.shift();
        thisInstance.eventReceived(evt);
        // if(evt.EventMessage.value[0]==TRIGGERONHEADER){
        //   this.setFixedStep(evt.EventMessage.value[2]%16);
        // }else  if(evt.EventMessage.value[0]==TRIGGEROFFHEADER){
        //   this.clearFixedStep(evt.EventMessage.value[2]%16);
        // }
      }else{
      }
    }

    this.getBitmap16=function(){
      return myBitmap;
    }
    this.delete=function(){
      for(var noff of noteOnTracker){
        thisInstance.output(noff);
        noteOnTracker.delete(noff);
      }
    }
    function getLen(byte){
      var shift=0;
      var testByte=byte;
      while((testByte&0xFFFFFFFF)!=0){
        testByte=testByte>>1;
        shift++;
      }
      return shift;
    }
    function stepOperation(){
      var longestLayer=0;
      for(var layer of patterns){
        longestLayer=Math.max(getLen(layer),longestLayer);
      }
      clock.subStep++;
      clock.subStep%=longestLayer;
    }
  }
})};