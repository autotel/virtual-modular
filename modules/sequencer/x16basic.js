"use strict";
var EventMessage = require( '../../datatypes/EventMessage.js' );
var EventConfigurator = require( '../x16utils/EventConfigurator.js' );
var NoteLengthner = require( './interfaceUtils/NoteLengthner.js' );
/**
definition of a monoSequencer interactor for the x16basic controller hardware
*/
module.exports=function(environment){
  //singleton section
  var myInteractorBase=environment.interactionMan.interfaces.x16basic.interactorBase;
  if(!myInteractorBase){
    throw "there is not x16Basic entryInteractor";
  }else{
  }
  //instance section
  this.Instance=function(controlledModule){
    //boilerplate
    myInteractorBase.call(this,controlledModule);
    var configurators={};
    configurators.event=new EventConfigurator(this,{values:[1,1,60,90]});

    var engagedConfigurator=false;
    var lastEngagedConfigurator=configurators.event;
    var engagedHardwares=new Set();

    //tracking vars
    var lastRecordedNote=false;
    var recorderDifferenciatorList={};
    //different interaction modes
    var skipMode=false;
    var shiftPressed=false;
    var configuratorsPressed={};

    //configurators setup

    //interaction with controlledModule
    var currentStep=controlledModule.currentStep;

    //special edition functions
    function eachFold(button,callback){
      var len=loopLength.value;
      var look=lookLoop.value||len;
      button%=look;
      //how many repetitions of the lookloop are represented under this button?
      var stepFolds;
      if(len%look>button){
        stepFolds=Math.ceil(len/look);
      }else{
        stepFolds=Math.floor(len/look);
      }
      // console.log("start check folds:"+stepFolds+" len:"+len+" look:"+look);
      for(var foldNumber=0; foldNumber<stepFolds; foldNumber++){
        callback((look*foldNumber)+button);
      }
      return {stepFolds:stepFolds}
    }

    //does the event under the button repeat througout all the repetitions of lookLoop?
    var getThroughfoldBoolean=function(button,filterFunction){
      var ret=0;
      var stepFolds=eachFold(button,function(step){
        if(controlledModule.patData[step])
          if(typeof filterFunction==="function"){
            //yes, every step is an array
            for(var stepData of controlledModule.patData[step]){
              if(filterFunction(stepData)) ret ++;
            }
          }else{
            // console.log("   check bt"+step);
            for(var stepData of controlledModule.patData[step]){
              if(controlledModule.patData[step]||false) ret ++;
            }
          }
      }).stepFolds;
      //if the step was repeated throughout all the folds, the return is true.
      if(ret>=stepFolds) ret=true; //ret can be higher than twofold because each step can hold any n of events
      // console.log("ret is "+ret);
      return ret;
    };

    var getBitmapx16=function(filter, requireAllFold,representLength){
      var ret=0x0000;
      if(requireAllFold){
        for(var button=0; button<16;button++)
          if(getThroughfoldBoolean(button,filter)===requireAllFold) ret|=0x1<<button;
      }else{
        if(filter){
          for(var button=0; button<16;button++)
            if(controlledModule.patData[button])
              for(var stepData of controlledModule.patData[button])
                if(filter(stepData)){
                /*  if(representLength){
                    ret|=~(0xffff<<stepData.stepLength)<<button;
                    // console.log("*-l",stepData.stepLength);
                  }else{*/
                    ret|=0x1<<button;
                /*  }*/
                }
        }else{
          for(var button=0; button<16;button++)
            if(controlledModule.patData[button])
              for(var stepData of controlledModule.patData[button])
                if(stepData){
                  ret|=0x1<<button;
                }
        }
      }
      // console.log(">"+ret.toString(16));
      return ret;
    }

    //interaction patterns
    var noteLengthner=new NoteLengthner();

    this.recordNoteStart=function(differenciator,stepOn){
      // console.log("recordNoteStart",differenciator,stepOn);
      if(stepOn){
        // console.log("rec rec");
        var newStepEvent=new patternEvent({
          on:stepOn,
          off:new EventMessage(stepOn)
        });
        lastRecordedNote=newStepEvent;
        newStepEvent.off.value[2]=0;
        recorderDifferenciatorList[differenciator]=currentStep.value;
        //recording is destructively quantized. here we apply a filter that forgives early notes
        if(controlledModule.microStep.value<6)recorderDifferenciatorList[differenciator]--;
        noteLengthner.startAdding(recorderDifferenciatorList[differenciator],newStepEvent);
      }
    }
    this.recordNoteEnd=function(differenciator){
      console.log("noteEnd",differenciator);
      noteLengthner.finishAdding(recorderDifferenciatorList[differenciator]);
    }

    controlledModule.on('step',function(event){
      for (let hardware of engagedHardwares) {
        if(subSelectorEngaged===false)
        updateLeds(hardware);
        if(lastsubSelectorEngaged==="timeConfig"){
          configurators.timeConfig.updateLcd();
        }
      }

      noteLengthner.stepCount();
      loopDisplace.value=controlledModule.loopDisplace.value;
    });

    this.matrixButtonPressed=function(event){
      // console.log(evt.data);

      if(skipMode){
        controlledModule.restart(evt.data[0]);
      }else if(subSelectorEngaged===false){
        var button=evt.data[0];
        var currentFilter=shiftPressed?moreBluredFilter:focusedFilter;
        var throughfold=getThroughfoldBoolean(button,currentFilter);

        //if shift is pressed, there is only one repetition throughfold required, making the edition more prone to delete.
        if(shiftPressed){ if(throughfold!==true) throughfold=throughfold>0; }else{ throughfold=throughfold===true; }
        // console.log(throughfold);
        if(throughfold){
          //there is an event on every fold of the lookloop
          eachFold(button,function(step){
            controlledModule.clearStepByFilter(step,currentFilter)
          });
        }/*else if(trhoughFold>0){
          //there is an event on some folds of the lookloop
          var newStepEv=configurators.event.getSeqEvent();
          eachFold(button,function(step){
            store(step,newStepEv);
          });
        }*/else{
          //on every repetition is empty
          noteLengthner.startAdding(button,configurators.event.getSeqEvent());
        }
        updateLeds();
      }else{
        configurators[subSelectorEngaged].eventResponses.buttonMatrixPressed(evt);
      }// console.log(evt.data);
      if(skipMode){
        controlledModule.restart(evt.data[0]);
      }else if(subSelectorEngaged===false){
        var button=evt.data[0];
        var currentFilter=shiftPressed?moreBluredFilter:focusedFilter;
        var throughfold=getThroughfoldBoolean(button,currentFilter);

        //if shift is pressed, there is only one repetition throughfold required, making the edition more prone to delete.
        if(shiftPressed){ if(throughfold!==true) throughfold=throughfold>0; }else{ throughfold=throughfold===true; }
        // console.log(throughfold);
        if(throughfold){
          //there is an event on every fold of the lookloop
          eachFold(button,function(step){
            controlledModule.clearStepByFilter(step,currentFilter)
          });
        }/*else if(trhoughFold>0){
          //there is an event on some folds of the lookloop
          var newStepEv=configurators.event.getSeqEvent();
          eachFold(button,function(step){
            store(step,newStepEv);
          });
        }*/else{
          //on every repetition is empty
          noteLengthner.startAdding(button,configurators.event.getSeqEvent());
        }
        updateLeds();
      }else{
        configurators[subSelectorEngaged].eventResponses.buttonMatrixPressed(evt);
      }
    };
    this.matrixButtonReleased=function(event){
      noteLengthner.finishAdding(evt.data[0],configurators.event.getSeqEvent());
      if(subSelectorEngaged===false){
        updateLeds();
      }else{
        configurators[subSelectorEngaged].eventResponses.buttonMatrixPressed(evt);
      }
    };
    this.matrixButtonHold=function(event){};
    this.selectorButtonPressed=function(event){
      var hardware=event.hardware;
      // console.log(evt);
      //keep trak of pressed buttons for button combinations
      configuratorsPressed[evt.data[0]]=true;
      if(configuratorsPressed[2]&&configuratorsPressed[3]){
        if(lastsubSelectorEngaged)
        configurators[lastsubSelectorEngaged].disengage();
        lastsubSelectorEngaged=false;
        skipMode=true;
        hardware.sendScreenA("skip to step");
        updateLeds();
      }else if(evt.data[0]==1){
        subSelectorEngaged='dimension';
        lastsubSelectorEngaged='dimension';
        configurators.event.engage();
      }else if(evt.data[0]==2){
        subSelectorEngaged='timeConfig';
        lastsubSelectorEngaged='timeConfig';
        configurators.timeConfig.engage();
      }else if(evt.data[0]==3){
        shiftPressed=true;
      }
      if(subSelectorEngaged)
      configurators[subSelectorEngaged].eventResponses.selectorButtonPressed(evt);
    };
    this.selectorButtonReleased=function(event){
      configuratorsPressed[evt.data[0]]=false;
      skipMode=false;
      if(subSelectorEngaged)
      configurators[subSelectorEngaged].eventResponses.selectorButtonReleased(evt);
      if(evt.data[0]==1){
        subSelectorEngaged=false;
        configurators.event.disengage();
      }else if(evt.data[0]==2){
        subSelectorEngaged=false;
        configurators.timeConfig.disengage();
      }else if(evt.data[0]==3){
        shiftPressed=false;
      }
    };
    this.encoderScrolled=function(event){
      if(configurators[lastsubSelectorEngaged])
      configurators[lastsubSelectorEngaged].eventResponses.encoderScroll(evt);
    };
    this.encoderPressed=function(event){};
    this.encoderReleased=function(event){};
    this.engage=function(event){
      var hardware=event.hardware;
      engagedHardwares.add(event.hardware);
      updateHardware(event.hardware);

      hardware.sendScreenA("Sequencer mode");
        //when you record from a preset kit, and then search the Sequencer
        //it can get really hard to find the sequencer if they don't show the
        //recording by defaut
        if(lastRecordedNote){
          // console.log("lastRecordedNote",lastRecordedNote);
          //this will update the output list in the sequencer, otherwise it may have a value out of array
          configurators.event.options[0].valueNames(0);
          configurators.event.setFromSeqEvent(lastRecordedNote);
          lastRecordedNote=false;
        }
        updateLeds();
    };
    this.disengage=function(event){
      engagedHardwares.delete(event.hardware);
    }

    //feedback functions
    var updateHardware=function(hardware){
      hardware.sendScreenA("monosequencer");
      updateLeds(hardware);
    }
    var updateLeds=function(hardware){
      stepsBmp=controlledModule.getBitmap16();
      hardware.draw([playHeadBmp,playHeadBmp|stepsBmp,stepsBmp]);
    }

    var focusedFilter=new configurators.event.Filter({destination:true,header:true,value_a:true});
    var bluredFilter=new configurators.event.Filter({destination:true,header:true});
    var moreBluredFilter=new configurators.event.Filter({destination:true});
    function updateLeds(hardware){
      //actually should display also according to the currently being tweaked
      var showThroughfold=lastsubSelectorEngaged=="timeConfig";
      var mostImportant=getBitmapx16(shiftPressed?moreBluredFilter:focusedFilter,showThroughfold);
      var mediumImportant=getBitmapx16(moreBluredFilter,showThroughfold);
      mediumImportant|=noteLengthner.startPointsBitmap;
      var leastImportant=getBitmapx16(bluredFilter,false,!shiftPressed);//red, apparently
      leastImportant|=noteLengthner.lengthsBitmap;
      var drawStep=0;
      var playHeadBmp=0;
      //"render" play header:
      //if we are in modulus view, it renders many playheads
      if(lastsubSelectorEngaged=="timeConfig"){
        drawStep=currentStep.value%(lookLoop.value||loopLength.value);
        var stepFolds=Math.ceil(loopLength.value/(lookLoop.value||loopLength.value));
        for(var a=0; a<stepFolds;a++){
          playHeadBmp|=0x1<<drawStep+a*(lookLoop.value||loopLength.value);
        }
        playHeadBmp&=0xFFFF;
      }else{
        //otherwise, normal one header
        drawStep=currentStep.value%loopLength.value;
        var playHeadBmp=0x1<<drawStep;
      }

      hardware.draw([
          playHeadBmp^  mostImportant,
          playHeadBmp|  mostImportant|  mediumImportant,
        (               mostImportant)| mediumImportant|  leastImportant,
      ]);
    }
  }
}