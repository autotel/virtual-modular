"use strict";
const NoteLengthner = require('../../../../Dem-modules/Sequencer/sequencerGuts/NoteLengthner');
const EventPattern = require('../../../../Dem-modules/Sequencer/EventPattern');
const ModuleInteractorBase = require('../Base.js');
const utils=require("../../utils");
let eventEquality=[0,1,2];

const EventPatternSet=function(){
  this.entries=[];
  this.size=0;
  let self=this;
  let compareFunction=function(a,b){
    if(!a) return false;
    if(!b) return false;
    // console.log({a,b});
    // return a.on.value[0]==b.on.value[0]
    //   && a.on.value[1]==b.on.value[1]
    //   && a.on.value[2]==b.on.value[2];
    // console.log(self.entries);
    return a.on.compareValuesTo(b.on,eventEquality);
  }
  this.areTheSame=compareFunction;
  let sortFunction=function(a,b){
    for(let valueN in a.on.value){
      if(a.on.value[valueN]==b.on.value[valueN]) continue;
      return (a.on.value[valueN]>b.on.value[valueN]);
    }
    return a.on.value
  }
  this.sort=function(){
    return self.entries.sort(sortFunction);
  }
  this.forEach=function(cb){
    for(var entry of self.entries){
      cb(entry);
    }
  }
  this.add=function(what){
    if(!what) return false;
    if(!what.on) return false;
    // console.log("addd");
    for(let entryN in self.entries){
      if(compareFunction(self.entries[entryN],what)){
        return;
      }
    }
    self.entries.push(what);
    this.size=self.entries.length;
  }
  this.delete=function(what){
    let remInd=false;
    for(let entryN in self.entries){
      if(compareFunction(self.entries[entryN],what)){
        remInd=entryN;
      }
    }
    self.entries.splice(remInd,1);
    this.size=self.entries.length;
  }
  this.empty=function(){
    this.size=0;
    return self.entries.splice(0);
  }
}
function log(b, n) {
  return Math.log(n) / Math.log(b);
}
const quadrantOfKey=function(key){
  return Math.floor(key[0]/4)+Math.floor(key[1]/2);
}
/**
definition of a monoSequencer interactor for the x16basic controller hardware
*/
module.exports = function (environment,controlledModule) {
  const engagedHardwares=new Set();
  const currentStep=controlledModule.currentStep;
  const patData=controlledModule.patData;
  let modulusView=4;
  

  const eventsVariety=new EventPatternSet();
  let focusedEvent=new EventPattern();
  function rebuildEventsList(){
    eventsVariety.empty();
    // console.log("MMM");

    for(let step in controlledModule.patData){
      // console.log("AA",step);
      for(let overp in controlledModule.patData[step]){
        eventsVariety.add(controlledModule.patData[step][overp]);
      }
    };
  }

  this.engage=function(evt){
    console.log("sequencer engage");
    evt.hardware.reset();
    engagedHardwares.add(evt.hardware);

  }
  this.disengage=function(evt){
    engagedHardwares.delete(evt.hardware);
  }

  let lastPressedMatrixKey=false;
  let selectedSequencerEvent=false;
  this.matrixKeyPressed=function(evt){
    // console.log("quadrant",quadrant(evt))
    let quadrant=quadrantOfKey(evt);
    if(quadrant>2){
      //select event
      focusedEvent=tryGetEventVariationAtButton(evt);
      if(focusedEvent) focusedEvent=new EventPattern().fromEventMessage(focusedEvent.on);
    }else if(quadrant>1){
      //time cfg
    }else{
      //sequencer
      let pressedStep=keyToStep(evt);
      let eventsInThisStep=tryGetEventAtStep(pressedStep);
      if(lastPressedMatrixKey===pressedStep+1){
        //extend event being created
      }else if(eventsInThisStep){
        //delete top event at step
        // controlledModule.clearStepOldest(pressedStep);
        let inLayer=false;
        for(let evtp of eventsInThisStep){
          if(eventsVariety.areTheSame(evtp,focusedEvent)){
            inLayer=evtp;
          }
        }
        if(inLayer){
          if(!focusedEvent) return;
          controlledModule.clearStepByFilter(pressedStep,compare=>{
            return compare.on.compareValuesTo(focusedEvent.on,eventEquality);
          });
        }else{
          controlledModule.clearStepNewest(pressedStep);
        }
      }else{
        if(!focusedEvent) return;
        //create a new sequencer event
        selectedSequencerEvent=new EventPattern().fromEventMessage(focusedEvent.on);
        
        controlledModule.storeNoDup(pressedStep,selectedSequencerEvent);
      }
      lastPressedMatrixKey=pressedStep;
    }
  }
  this.matrixKeyReleased=function(evt){
    console.log("matrixKeyReleased");
  }
  this.selectorKeyPressed=function(evt){
    console.log("selectorKeyPressed");
    if(evt.pos==0){
      focusedEvent.on.value[1]++;
      if(focusedEvent.off)focusedEvent.off.value[1]++;
    }else if(evt.pos==1){
      focusedEvent.on.value[1]--;
      if(focusedEvent.off)focusedEvent.off.value[1]--;
    }
  }
  this.selectorKeyReleased=function(evt){
    console.log("selectorKeyReleased");
  }

  controlledModule.on("step",function(){
    engagedHardwares.forEach((hardware)=>{
      udpateMatrix(hardware);
    });
  })
  //pos=matrix button as counted from top left
  //key=[x,y] coords.
  //step=sequencer step
  function stepToKey(pos){
    let key=[];
    key[0]=pos%modulusView;
    key[1]=Math.floor(pos/modulusView);
    //wraparound
    if(key[1]>=4){
      key[1]-=4;
      key[0]+=4;
    }
    return key;
  };
  function keyToStep(key){
    let myKey=[key[0],key[1]];//clone
    //wraparound
    if(myKey[0]>=4){
      myKey[1]+=4;
      myKey[0]-=4;
    }
    let pos=myKey[0]+(myKey[1]*modulusView);
    return pos;
  }
  function tryGetEventAtStep(step){
    if(patData[step] && patData[step].length){
      return patData[step];
    }else{
      return false;
    }
  }
  //event Variations is the list of distinct events currently present in the sequence.
  function tryGetEventVariationAtButton(key){
    let left=4;
    let top=4;
    let w=4;
    let pos=key[0]-left+((key[1]-top)*w);
    console.log("POS",pos);
    return eventsVariety.entries[pos];
  }
  
  function udpateMatrix(hardware){
    //top two squares: sequencer
    let until=32;//Math.min(32,controlledModule.loopLength.value);
    for(let pos=0; pos<until; pos++){
      let key=stepToKey(pos);
      let eventsInThisStep=tryGetEventAtStep(pos);
      if(pos==currentStep.value){
        hardware.col(hardware.yellow,key)
      }else if(eventsInThisStep){
        let inLayer=false;
        for(let evtp of eventsInThisStep){
          if(eventsVariety.areTheSame(evtp,focusedEvent)){
            inLayer=evtp;
          }
        }
        hardware.col(inLayer?hardware.green:hardware.amber,key);
      }else{
        hardware.col(hardware.off,key)
      }
    }
    //bottom left square: time stuff
    //bottom right square: layer select
    rebuildEventsList();
    // console.log(eventsVariety.sort());
    eventsVariety.sort();
    let key=[4,4];
    // console.log("size",eventsVariety.size);
    eventsVariety.forEach(evt=>{
      // console.log(focusedEvent);
      if(eventsVariety.areTheSame(evt,focusedEvent)){
        hardware.col(hardware.green,key)
      }else{
        hardware.col(hardware.amber,key);
      }
      key[0]+=1;
      if(key[0]>7){
        key[1]++;
        key[0]=4;
      }
    });
    hardware.col(hardware.off,key);
    //assigns one button to each different event message present in the sequencer.
    //each button can be which causes the focus to become that event
    //individual number shifts still achievable by paging., however, how to select which value is paged?
  }
  
}
