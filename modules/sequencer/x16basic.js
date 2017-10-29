"use strict";
var EventMessage = require( '../../datatypes/EventMessage.js' );
var EventConfigurator = require( '../x16utils/EventConfigurator.js' );
var BlankConfigurator = require( '../x16utils/BlankConfigurator.js' );
var RecordMenu=require('../x16utils/RecordMenu.js');
var NoteLengthner=require('./sequencerGuts/NoteLengthner.js');
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
    var thisInterface=this;

    var engagedHardwares=new Set();

    //tracking vars
    var lastRecordedNote=false;
    var recorderDifferenciatorList={};
    //different interaction modes
    var skipMode=false;
    var shiftPressed=false;
    var configuratorsPressed={};

    //configurators setup
    var engagedConfigurator=false;
    var configurators={};
    configurators.event=new EventConfigurator(this,{values:[1,1,60,90]});
    var lastEngagedConfigurator=configurators.event;
    var lookLoop={value:0};
    var loopLength={value:0};
    var loopDisplace=controlledModule.loopDisplace;
    configurators.record=new RecordMenu(this,{environment:environment,controlledModule:controlledModule});

    //interaction with controlledModule
    var currentStep=controlledModule.currentStep;
    var loopLength=controlledModule.loopLength;




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




    controlledModule.on('step',function(event){
      for (let hardware of engagedHardwares) {
        if(engagedConfigurator===false)
        updateLeds(hardware);
      }
      noteLengthner.step();
      // loopDisplace.value=controlledModule.loopDisplace.value;
    });

    this.matrixButtonPressed=function(event){
      // console.log(event.data);
      var hardware=event.hardware;
      if(skipMode){
        controlledModule.restart(event.data[0]);

      }else if(engagedConfigurator===false){
        var button=event.data[0];
        var currentFilter=shiftPressed?moreBluredFilter:focusedFilter;
        var throughfold=getThroughfoldBoolean(button,currentFilter);

        //if shift is pressed, there is only one repetition throughfold required, making the edition more prone to delete.
        if(shiftPressed){
          if(throughfold!==true) throughfold=throughfold>0;
        }else{
          throughfold=throughfold===true;
        }
        // console.log(throughfold);
        if(throughfold){
          //there is an event on every fold of the lookloop
          eachFold(button,function(step){
            controlledModule.clearStepByFilter(step,currentFilter)
          });
        }/*else if(trhoughFold>0){
          //there is an event on some folds of the lookloop
          var newStepEv=configurators.event.getEventPattern();
          eachFold(button,function(step){
            store(step,newStepEv);
          });
        }*/else{
          //on every repetition is empty
          noteLengthner.startAdding(button,configurators.event.getEventPattern());
        }
        updateLeds(hardware);
      }else{

        engagedConfigurator.matrixButtonPressed(event);
      }// console.log(event.data);
    };
    this.matrixButtonReleased=function(event){
      var hardware=event.hardware;
      noteLengthner.finishAdding(event.data[0],configurators.event.getEventPattern());

      if(engagedConfigurator===false){
        updateLeds(hardware);
      }else{

        engagedConfigurator.matrixButtonPressed(event);
      }
    };
    this.matrixButtonHold=function(event){};
    this.selectorButtonPressed=function(event){
      var hardware=event.hardware;
      // console.log(event);
      //keep trak of pressed buttons for button combinations
      configuratorsPressed[event.data[0]]=true;
      if(configuratorsPressed[2]&&configuratorsPressed[3]){
        if(lastEngagedConfigurator)
        lastEngagedConfigurator.disengage(hardware);
        lastEngagedConfigurator=false;
        skipMode=true;
        hardware.sendScreenA("skip to step");
        updateLeds(hardware);
      }else if(event.data[0]==1){
        /**TODO: use configurator objects instead of their names**/
        engagedConfigurator=configurators.event;
        lastEngagedConfigurator=configurators.event;
        configurators.event.engage(event);
      }else if(event.data[0]==2){
        engagedConfigurator=configurators.record;
        lastEngagedConfigurator=configurators.record;
        engagedConfigurator.engage(event);
      }else if(event.data[0]==3){
        shiftPressed=true;
        updateLeds(hardware);
      }

      if(engagedConfigurator)
      engagedConfigurator.selectorButtonPressed(event);
    };
    this.selectorButtonReleased=function(event){
      var hardware=event.hardware;
      configuratorsPressed[event.data[0]]=false;
      skipMode=false;

      if(engagedConfigurator){
        engagedConfigurator.selectorButtonReleased(event);
      }
      if(event.data[0]==1){
        engagedConfigurator.disengage(hardware);
        engagedConfigurator=false;
      }else if(event.data[0]==2){
        engagedConfigurator.disengage(hardware);
        engagedConfigurator=false;
      }else if(event.data[0]==3){
        shiftPressed=false;
      }
      updateHardware(hardware);
    };
    this.encoderScrolled=function(event){
      var hardware=event.hardware;
      if(lastEngagedConfigurator){
        lastEngagedConfigurator.encoderScrolled(event);
      }
      updateLeds(hardware);
    };
    this.encoderPressed=function(event){};
    this.encoderReleased=function(event){};
    this.engage=function(event){
      var hardware=event.hardware;
      engagedHardwares.add(event.hardware);
      updateHardware(event.hardware);

        //when you record from a preset kit, and then search the Sequencer
        //it can get really hard to find the sequencer if they don't show the
        //recording by defaut
        if(lastRecordedNote){
          // console.log("lastRecordedNote",lastRecordedNote);
          //this will update the output list in the sequencer, otherwise it may have a value out of array
          configurators.event.options[0].valueNames(0);
          configurators.event.setFromEventPattern(lastRecordedNote);
          lastRecordedNote=false;
        }
        updateLeds(hardware);
    };
    this.disengage=function(event){
      engagedHardwares.delete(event.hardware);
    }

    //feedback functions
    var updateHardware=function(hardware){
      hardware.sendScreenA(thisInterface.name);
      updateLeds(hardware);
    }
    // var updateLeds=function(hardware){
    //   stepsBmp=getBitmap16();
    //   hardware.draw([playHeadBmp,playHeadBmp|stepsBmp,stepsBmp]);
    // }

    var focusedFilter=new configurators.event.Filter({header:true,value_a:true,value_b:true});
    var bluredFilter=new configurators.event.Filter({header:true,value_a:true});
    var moreBluredFilter=new configurators.event.Filter({header:true});
    function updateLeds(hardware){
      //actually should display also according to the currently being tweaked
      var showThroughfold=lastEngagedConfigurator==configurators.time;
      var mostImportant=getBitmapx16(shiftPressed?moreBluredFilter:focusedFilter,showThroughfold);
      var mediumImportant=getBitmapx16(moreBluredFilter,showThroughfold);
      mediumImportant|=noteLengthner.startPointsBitmap;
      var leastImportant=getBitmapx16(bluredFilter,false,!shiftPressed);//red, apparently
      leastImportant|=noteLengthner.lengthsBitmap;
      var drawStep=0;
      var playHeadBmp=0;
      //"render" play header:
      //if we are in modulus view, it renders many playheads
      if(lastEngagedConfigurator=="time"){
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