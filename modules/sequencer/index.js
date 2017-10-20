'use strict';
var moduleInstanceBase=require('../moduleInstanceBase');
var uix16Control=require('./x16basic');
var clockSpec=require('../standards/clock.js');

var EventMessage=require('../../datatypes/EventMessage.js');
const sequencerFunctions=require("./sequencerGuts");
module.exports=function(environment){return new (function(){
  var interactorSingleton=this.InteractorSingleton=new uix16Control(environment);
  // environment.interactionMan.registerModuleInteractor(uix16Control);
  var testcount=0;
  var testGetName=function(){
    this.name=this.baseName+" "+testcount;
    testcount++;
  }
  this.Instance=function(properties){
    moduleInstanceBase.call(this);
    this.baseName="sequencer";
    testGetName.call(this);
    if(properties.name) this.name=properties.name;


    var currentStep={value:0};
    this.currentStep=currentStep;
    // /**/console.log(sequencerFunctions);
    var thisModule=this;
    this.patData={};
    var currentModulus=16;
    this.loopLength={value:16};
    this.stepLength={value:12}

    this.noteLenManager=sequencerFunctions.NoteLenManager(this);
    var patchMem=sequencerFunctions.PatchMem(this);
    //import "gut" functions to my own;
    //I don't use an iterator to have more clear control of the namespace
    //but in some text tools you can always multiline edit
    this.store=patchMem.store;
    this.loopDisplace=patchMem.loopDisplace;
    this.storeNoDup=patchMem.storeNoDup;
    this.clearStepNewest=patchMem.clearStepNewest;
    this.clearStepOldest=patchMem.clearStepOldest;
    this.clearStep=patchMem.clearStep;
    this.clearStepByFilter=patchMem.clearStepByFilter;
    this.getBoolean=patchMem.getBoolean;
    this.stepDivide=patchMem.stepDivide;
    this.microStep=patchMem.microStep;
    this.microStepDivide=patchMem.microStepDivide;
    // this.eachFold=patchMem.eachFold;
    // this.getThroughfoldBoolean=patchMem.getThroughfoldBoolean;
    this.clearStepRange=patchMem.clearStepRange;
    this.duplicateSequence=patchMem.duplicateSequence;
    // this.getBitmapx16=patchMem.getBitmapx16;
    this.step=patchMem.step;
    this.restart=patchMem.restart;
    this.stepAbsolute=patchMem.stepAbsolute;
    this.stepIncremental=patchMem.stepIncremental;
    this.stepMicro=patchMem.stepMicro;
    var thisInstance=this;

    this.onPatchStep=function(evt){
      //console.log("MMO"+currentStep.value);
      this.handle('step',evt);
    }
    // x00: clock tick
    // x01: set the playhead to a position indicated by data 1, set the state to play (and play it?) (NI.!)
    // x02: set the state to stop (NI.!)
    // x03: jump playhead to position indicated by data 1, but don't change the playing state (NI.!)
    // x70: request of stored data, it will trigger a data response
    // x71: data response
    this.eventReceived=function(event){
      var evt=event.EventMessage;
      // console.log(evt);
      this.handle('receive',evt);
      if(evt.value[0]==0){
        this.stepMicro(evt.value[1],evt.value[2]);
        // console.log("0 stepMicro("+evt.value[1]+","+evt.value[2]+");");
      }else if(evt.value[0]==1){
        thisInstance.stepAbsolute(evt.value[1]);
        thisInstance.play();
        // console.log("1 thisInstance.stepAbsolute("+evt.value[1]+");");
      }else if(evt.value[0]==2){
        thisInstance.stop();
        // console.log("2 stop");
      }else if(evt.value[0]==3){
        thisInstance.stepAbsolute(evt.value[1]);
        // console.log("3 thisInstance.stepAbsolute("+evt.value[1]+");");
      }else if(evt.value[0]==0x02){
        thisInstance.stop();
      }else if(evt.value[0]==0x04){
        thisInstance.stepAbsolute(evt.value[1]);
      }
    }

    var myInteractor=new interactorSingleton.Instance(this);
    this.interactor=myInteractor;
    this.interactor.name=this.name;
  }
})};