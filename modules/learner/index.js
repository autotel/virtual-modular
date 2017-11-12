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
      lastSnapshotNumbers:[],
      currentEvents:[],
    };
    var memory={}
    var snapshots=[];

    var trigger=this.trigger=function(square){
      watching.currentEvents.push(square);


    }
    var release=this.release=function(square){
      // watching.currentEvent=false;
    }
    var triggerEvent=function(event){
      // console.log("< on"+event);
      thisInstance.handle('intrigger',event);
    }
    var processFrame=function(){
      var clockSnapshot=false;
      var itExists=false;
      watching.currentEvents.sort();
      if(watching.currentEvents.length>0){
        //find or create snapshot of the events on this clock
        for(var a in snapshots){
          if(JSON.stringify(snapshots[a])==JSON.stringify(watching.currentEvents)){
            itExists=a;
          }
        }
        if(itExists===false){
          clockSnapshot=snapshots.length;
          snapshots.push(watching.currentEvents);
        }else{
          clockSnapshot=itExists;
        }
        //shift a value into lastSnapshotNumbers (working like a fifo)
        watching.lastSnapshotNumbers.push(clockSnapshot);
        while(watching.lastSnapshotNumbers.length>16) watching.lastSnapshotNumbers.shift();
      }


      watching.currentEvents=[];

      var inputs=[
        watching.currentStep%2,
        watching.currentStep%3,
        watching.currentStep%4,
        watching.currentStep%8,
        watching.currentStep%16,
        watching.currentStep%32,
        watching.currentStep%64,
        watching.currentStep%128,
        (watching.lastSnapshotNumbers[0]||0)/16.00,
        (watching.lastSnapshotNumbers[1]||0)/16.00,
        (watching.lastSnapshotNumbers[2]||0)/16.00,
        (watching.lastSnapshotNumbers[3]||0)/16.00,
        (watching.lastSnapshotNumbers[4]||0)/16.00,
        (watching.lastSnapshotNumbers[5]||0)/16.00,
        (watching.lastSnapshotNumbers[6]||0)/16.00,
        (watching.lastSnapshotNumbers[7]||0)/16.00
      ];
      // if(clockSnapshot){
      // console.log(memory[inputs[4]]);
        if(memory[inputs[4]]){
          // console.log(clockSnapshot,memory[inputs[4]]);
          for(var mem of memory[inputs[4]]){
            for(var snapshot of snapshots[mem]){
              triggerEvent(snapshot);
            }
          }
        }else{
          if(clockSnapshot)
          memory[inputs[4]]=[clockSnapshot];
        }
      // }


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