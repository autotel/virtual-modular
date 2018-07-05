
'use strict';
var EventMessage=require('../../../datatypes/EventMessage.js');
var EventPattern=require('../EventPattern.js');

module.exports=function(sequencerModule){ return new(function(){
  var self=this;
  /**
  whether module is playing
  */
  self.playing={value:true};

  //the "invisible" sub-unit of a step, good for recording quantization and midi clock input
  var microStep={value:0};
  this.microStep=microStep;
  this.microStepDisplace={value:0};
  var microStepDivide={value:12};
  this.microStepDivide=microStepDivide;

  //the visible step that can be divided if the user wants a slower sequence
  var substep={value:0};
  var stepDivide={value:1}
  this.stepDivide=stepDivide;

  //the step that is used to read the pattern memory
  var currentStep=sequencerModule.currentStep;

  var loopLength=sequencerModule.loopLength;
  var patData=sequencerModule.patData;
  var loopDisplace={value:0};
  this.loopDisplace=loopDisplace;
  var store=function(step,data){
    if(!patData[step]) patData[step]=[];
    if(data){
      patData[step].push(data);
      return data;
    }
  }
  /**

  store a EventPattern in the sequencer memory ensuring that the event doesn't already exist in that step
  @param {numbar} step the step where the EventPattern will be stored
  @param {EventPattern} data the EventPattern to store
  @returns stored data, or false if data was already found and not stored
  */
  var storeNoDup=function(step,data){
    if(!patData[step]) patData[step]=[];
    if(data){
      var replace=false;
      for(var a in patData[step]){
        try{
          if(patData[step][a].on.compareTo(data.on,['value.0','value.1','value.2'])){
            // console.log("DUP!");
            replace=a;
            break;
          }
        }catch(e){
          // console.log(patData[step]);
          // console.log(e);
        }
      }
      if(replace===false){
        patData[step].push(data);
        return data;
      }else{
        patData[step][replace]=data;
      }
      return !replace;
    }else{
      console.error("wrong storeNoDup data is ",data);
    }
  }
  var clearStepNewest=function(step){
    patData[step].pop();
  }
  var clearStepOldest=function(step){
    patData[step].shift();
  }
  var clearStep=function(step){
    delete patData[step];
  }
  var clearStepByFilter=function(step,filterFunction){
    if(patData[step])
      if(typeof filterFunction==="function"){
        for(var sEvt in patData[step]){
          if(filterFunction(patData[step][sEvt])){
            return patData[step].splice(sEvt,1);
          }
        }
        return false;
      }
    return false;
  }
  var getBoolean=function(step,filterFunction){
    if(patData[step])
      if(typeof filterFunction==="function"){
        //yes, every step is an array
        for(var stepData of patData[step]){
          if(filterFunction(stepData))
            return true;
          return false;
        }
      }else{
        for(var stepData of patData[step]){
          if(patData[step]||false)
            return true;
          return false;
        }
      }
    return false;
  };

  var clearStepRange=function(from,to){
    console.log("CLR",from,to);
    for(var step=to; step>from; step--){
      //maybe this iteration is unnecesary?
      for(var a in patData[step]){
        delete patData[step][a];
      }
      delete patData[step];
    }
  }
  var sequenceBounds=function(){
    var ret={start:0,end:0}
    for(let step in patData){
      if(!ret.start){
        ret.start=step;
      }
      ret.end=step;
      if(step>loopLength.value){
        return ret;
      }
    }
    return ret;
  }
  var offsetSequence=function(steps){
    let newSequence=[];
    // console.log("OFFSETOP",steps);
    // clearStepRange(0,-steps);
    for(let stepIndex in patData){
      newSequence[parseInt(stepIndex)+steps]=patData[stepIndex];
      delete patData[stepIndex];
    }
    for(let stepIndex in newSequence){
      // console.log("ASS",stepIndex);
      patData[stepIndex]=newSequence[stepIndex];
    }
  }

  var duplicateSequence=function(startingStep,originalEndingStep,multiplyFactor){
    var initialStepSize=originalEndingStep-startingStep;
    if(multiplyFactor>1){
      clearStepRange(originalEndingStep,initialStepSize*(multiplyFactor));
      // displaceStepRange(originalEndingStep);
      //starts in 1 because the 0 is the currently existing one
      for(var duplicationNumber=1; duplicationNumber<multiplyFactor; duplicationNumber++){
        console.log("DUPOP",duplicationNumber);
        for(var step=startingStep; step<originalEndingStep; step++){
          // var testc=0;
          if(patData[step])
          for(var a=0; a<patData[step].length; a++){
            // testc++;
            var targetStep=(initialStepSize*duplicationNumber)+step;
            // console.log(duplicationNumber,step,testc,targetStep);
            // TODO: in many places I create these sequencer memory events, they should be
            //instances of the same class, to avoid easter egg bugs
            if(!patData[targetStep]) patData[targetStep]=[];
            patData[targetStep].push(new EventPattern({
              on:new EventMessage(patData[step][a].on),
              off:new EventMessage(patData[step][a].off),
              stepLength:patData[step][a].stepLength,
            }));
          }
        }
      }
    }else{
      clearStepRange(originalEndingStep*multiplyFactor,originalEndingStep);
    }
  }

  // var clockIncremental=false;
  this.stepAbsolute=function(s){
    // clockIncremental=false;
    // console.log("absolute"+microStep.value);
    substep.value=s%stepDivide.value;
    substep.value+=loopDisplace.value;
    loopDisplace.value=0;
    currentStep.value=Math.floor(s/stepDivide.value);
    if(currentStep.value>=loopLength.value) currentStep.value%=loopLength.value;
    if(currentStep.value<0) currentStep.value%=loopLength.value;
    if(substep.value==0)
    step(s);
    // console.log("memema");
    // console.log("aa",currentStep.value,loopLength.value);
    microStep.value=0;
  }
  this.restart=function(s){
    if(!s) var s=0;
    loopDisplace.value=0;
    currentStep.value=s;
    if(currentStep.value>=loopLength.value) currentStep.value%=loopLength.value;
    if(currentStep.value<0) currentStep.value%=loopLength.value;
    if(substep.value==0)
    step(s);
    microStep.value=0;
  }
  // this.stepIncremental=function(s){
  //   // clockIncremental=true;
  //   substep.value+=loopDisplace.value;
  //   loopDisplace.value=0;
  //   microStep.value=0;
  // }
  function ramp(t,range){
    if(t>0){
      return t%range-1;
    }else{
      return range-Math.abs(t%range)-1;
    }
  }
  this.stepMicro=function(base,number){
    microStepDivide.value=base;
    if(stepDivide.value<1){
      microStepDivide.value*=stepDivide.value;
    }
    microStep.value=ramp(number-self.microStepDisplace.value,microStepDivide.value);
    // console.log(microStep.value);
      if(microStep.value%microStepDivide.value==0){
        if(self.playing.value){
          // if(clockIncremental){
          // self.step();
          // console.log("incremental"+microStep.value);
          // console.log(substep);
          substep.value++;
          currentStep.value+=loopDisplace.value;
          loopDisplace.value=0;
          if(substep.value>=stepDivide.value){
            // console.log(stepDivide);
            step(currentStep.value);
            currentStep.value++;
            // console.log("mememe");
            substep.value=substep.value%stepDivide.value;
            if(currentStep.value>=loopLength.value) currentStep.value%=loopLength.value;
            if(currentStep.value<0) currentStep.value%=Math.abs(loopLength.value);
          }
        // }
        }else{
          sequencerModule.noteLenManager.step();
        }
    }
  }

  function step(evt){
    sequencerModule.noteLenManager.step();
    if(!sequencerModule.mute)
    // if(substep.value==0){
      if(getBoolean(currentStep.value)){
        // console.log("memem");
        // console.log(patData[currentStep.value].length);
        for(var stepData of patData[currentStep.value]){
          sequencerModule.output(stepData.on);
          sequencerModule.noteLenManager.noteStarted(stepData);
        }
      }
      sequencerModule.onPatchStep();
    // }
  }
  this.store=store;
  this.storeNoDup=storeNoDup;
  this.clearStepNewest=clearStepNewest;
  this.clearStepOldest=clearStepOldest;
  this.clearStep=clearStep;
  this.clearStepByFilter=clearStepByFilter;
  this.getBoolean=getBoolean;
  this.sequenceBounds=sequenceBounds;
  // this.eachFold=eachFold;
  // this.getThroughfoldBoolean=getThroughfoldBoolean;
  this.clearStepRange=clearStepRange;
  this.duplicateSequence=duplicateSequence;
  this.offsetSequence=offsetSequence;
  // this.getBitmapx16=getBitmapx16;
  this.step=step;
})(); };
