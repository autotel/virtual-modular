'use strict';
var EventMessage=require('../../datatypes/EventMessage.js');
var moduleInstanceBase=require('../moduleInstanceBase');
var uix16Control=require('./x16basic');
var synaptic=require('./ext/synaptic');
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

    // this.network = new synaptic.Architect.Perceptron(5, 25, 5);
    // var trainer = new Trainer(this.network);
    var clock=this.clock={subSteps:4,subStep:0}

    moduleInstanceBase.call(this);
    this.baseName="learner";
    testGetName.call(this);
    if(properties.name) this.name=properties.name;

    var baseEventMessage=this.baseEventMessage= new EventMessage({value:[TRIGGERONHEADER,-1,-1,-1]});
    var myInteractor=new interactorSingleton.Instance(this);
    this.interactor=myInteractor;
    this.interactor.name=this.name;
    var watching={
      currentStep:0,
      lastEvents:[],
      currentEvent:false,
    };
    var memory={}

    var trigger=this.trigger=function(square){
      watching.currentEvent=square;
      // console.log("< on "+square);
    }
    var release=this.release=function(square){
      watching.currentEvent=false;
      watching.lastEvents.push(square);
      if(watching.lastEvents.length>16){
        watching.lastEvents.shift();
      }
      // console.log("< off "+square);
    }
    var triggerEvent=function(event){
      // console.log("< on"+event);
      thisInstance.handle('intrigger',event);
    }
    var processFrame=function(){
      // console.log("clock");
      var currentStep3=watching.currentStep%3;
      var currentStep4=watching.currentStep%4;
      var currentStep5=watching.currentStep%5;
      var currentStep6=watching.currentStep%6;
      var currentStep7=watching.currentStep%7;
      var currentStep8=watching.currentStep%8;
      if(memory[currentStep8]){
        var mostLikelyEvent={score:-1,value:false};
        for(var possibleEvent in memory[currentStep8]){
          // console.log(possibleEvent+":"+memory[currentStep8][possibleEvent]);
          if(possibleEvent!=watching.currentEvent){
            if(mostLikelyEvent.score<memory[currentStep8][possibleEvent]){
              mostLikelyEvent={score:memory[currentStep8][possibleEvent],value:possibleEvent}
            }
            if(watching.currentEvent!==false){
              memory[currentStep8][possibleEvent]--;
            }
          }
        }
        if(mostLikelyEvent.value!==false)
        triggerEvent(mostLikelyEvent.value);
        if(watching.currentEvent!==false){
          if(memory[currentStep8][watching.currentEvent]){
            memory[currentStep8][watching.currentEvent]++;
          }else{
            memory[currentStep8][watching.currentEvent]=0;
          }
        }
      }else{
        if(watching.currentEvent!==false){

          memory[currentStep8]={}
          memory[currentStep8][watching.currentEvent]=0;
          // console.log("stor"+watching.currentEvent);
        }
      }
      watching.currentStep++;
    }

    this.cellOutput=function(x,y,val){
      if(val){
        baseEventMessage.value[2]=x*4+y;
        thisInstance.output(baseEventMessage);
      }else{

      }
    }

    this.eventReceived=function(evt){
      if(evt.EventMessage.value[0]==CLOCKTICKHEADER&&(evt.EventMessage.value[2]%evt.EventMessage.value[1]==0)){
        clock.subStep++;
        if(clock.subStep>=clock.subSteps){
          clock.subStep=0;
          this.handle('step');
          processFrame();
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
  }
})};