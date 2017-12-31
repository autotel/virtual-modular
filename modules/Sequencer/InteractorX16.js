"use strict";
var EventMessage = require('../../datatypes/EventMessage.js');
var EventConfigurator = require('../x16utils/EventConfigurator.js');
var BlankConfigurator = require('../x16utils/BlankConfigurator.js');
var RecordMenu = require('../x16utils/RecordMenu.js');
var NoteLengthner = require('./sequencerGuts/NoteLengthner.js');

var base = require('../../interaction/x16basic/interactorBase.js');

function log(b, n) {
  return Math.log(n) / Math.log(b);
}
/**
definition of a monoSequencer interactor for the x16basic controller hardware
*/
module.exports = function(controlledModule, environment) {
  base.call(this);

  //boilerplate

  base.call(this, controlledModule);
  var thisInterface = this;
  var currentViewPage=0;
  var engagedHardwares = new Set();

  //tracking vars
  var lastRecordedNote = false;


  var noteLengthnerStartPointsBitmap = 0x0;
  var noteLengthnerLengthsBitmap = 0x0;
  var noteLengthner = new NoteLengthner(controlledModule);
  noteLengthner.onStep(function(thisNoteLengthner, nicCount) {
    //TODO lengthsBitmap should be on scope of interface, not noteLengthner
    // console.log(nicCount);
    if (nicCount > 0) {
      noteLengthnerLengthsBitmap |= noteLengthnerLengthsBitmap << 1;
      noteLengthnerLengthsBitmap |= noteLengthnerLengthsBitmap >> 16;
    }
  });
  //different interaction modes
  var skipMode = false;
  var shiftPressed = false;
  var configuratorsPressed = {};

  //configurators setup
  var engagedConfigurator = false;
  var configurators = {};
  configurators.event = new EventConfigurator(this, {
    values: [1, 1, 60, 90]
  });
  var lastEngagedConfigurator = configurators.event;
  var loopDisplace = controlledModule.loopDisplace;
  configurators.record = new RecordMenu(this, {
    environment: environment,
    controlledModule: controlledModule
  });

  //interaction with controlledModule
  var currentStep = controlledModule.currentStep;
  var loopLength = controlledModule.loopLength;
  var lookLoop = {
    value: 0
  };
  configurators.time = new BlankConfigurator(this, {
    name: "",
    vars: {
      "loop length": loopLength,
      "fold": {value:controlledModule.loopLength.value,base:2},
      "fold!": {value:controlledModule.loopLength.value,base:2},
      "loop look": lookLoop,
      "page": {value:0},
      "step div": controlledModule.stepDivide,
      "drift substep": controlledModule.loopDisplace,
      "microstep offset": controlledModule.microStepDisplace,
      "playing": controlledModule.playing,
    }
  });
  configurators.time.vars["loop length"].min = 1;
  configurators.time.vars["loop length"].changeFunction = function(thisVar, delta) {
    if (thisVar.value + delta >= 1)
      thisVar.value += delta;
  }

  configurators.time.vars["fold"].nameFunction=configurators.time.vars["fold!"].nameFunction=function(thisVar){
    //TODO: ensure that the thisVar.value ends up being the actual length
    return `${thisVar.base}^${Math.round(thisVar.power*100)/100}>${Math.round(thisVar.value)}`;

  }
  configurators.time.vars["fold"].selectFunction = configurators.time.vars["fold!"].selectFunction = function(thisVar){
    thisVar.value = controlledModule.loopLength.value;
    thisVar.power = log(thisVar.base,thisVar.value);
  }
  configurators.time.vars["fold!"].changeFunction = function(thisVar, delta) {
    var oldLength = thisVar.value;
    if (shiftPressed) {
      thisVar.base += delta;
    } else {
      thisVar.power += delta;
    }
    thisVar.value = Math.round(Math.pow(thisVar.base, thisVar.power));
    console.log("FOLD",thisVar.value);
    controlledModule.duplicateSequence(0, oldLength, thisVar.value / oldLength);
    controlledModule.loopLength.value = thisVar.value;
  }
  configurators.time.vars["fold"].changeFunction = function(thisVar, delta) {
    var oldLength = thisVar.value;
    if (shiftPressed) {
      thisVar.base += delta;
    } else {
      thisVar.power += delta;
    }
    thisVar.value = Math.round(Math.pow(thisVar.base, thisVar.power));
    console.log("FOLD",thisVar.value);
    controlledModule.loopLength.value = thisVar.value;
  }

  configurators.time.vars["loop look"].nameFunction = function(thisVar) {
    return (thisVar.value == 0 ? "off" : "" + thisVar.value);
  };
  configurators.time.vars["loop look"].changeFunction = function(thisVar, delta) {
    if (thisVar.value + delta >= 0)
      thisVar.value += delta;
  }
  configurators.time.vars["page"].changeFunction = function(thisVar, delta) {
    if (thisVar.value + delta >= 0)
      thisVar.value += delta;
    currentViewPage=thisVar.value;
  }

  configurators.time.vars["step div"].changeFunction = function(thisVar, delta) {
    if (thisVar.value + delta >= 1)
      thisVar.value += delta;
  }

  configurators.time.vars["drift substep"].nameFunction = function(thisVar) {
    return (thisVar.value > 0 ? "+" : " ") + thisVar.value;
  };
  // configurators.time.vars["time displace"].changeFunction = function(thisVar,delta){
  //   if(thisVar.value+delta>=0)
  //   thisVar.value+=delta;
  // }
  configurators.time.vars["microstep offset"].nameFunction = function(thisVar) {
    return thisVar.value + "/" + controlledModule.microStepDivide.value;
  };

  configurators.time.vars["playing"].changeFunction = function(thisVar, delta) {
    if (delta > 0) {
      thisVar.value = true;
    } else {
      thisVar.value = false;
    }
  }

  function eachFold(button, callback) {
    var len = loopLength.value;
    var look = lookLoop.value || len;
    button %= look;
    //how many repetitions of the lookloop are represented under this button?
    var stepFolds;
    if (len % look > button) {
      stepFolds = Math.ceil(len / look);
    } else {
      stepFolds = Math.floor(len / look);
    }
    // console.log("start check folds:"+stepFolds+" len:"+len+" look:"+look);
    for (var foldNumber = 0; foldNumber < stepFolds; foldNumber++) {
      callback((look * foldNumber) + button);
    }
    return {
      stepFolds: stepFolds
    }
  }

  //does the event under the button repeat througout all the repetitions of lookLoop?
  var getThroughfoldBoolean = function(button, filterFunction) {
    var ret = 0;
    var stepFolds = eachFold(button, function(step) {
      if (controlledModule.patData[step])
        if (typeof filterFunction === "function") {
          //yes, every step is an array
          for (var stepData of controlledModule.patData[step]) {
            if (filterFunction(stepData)) ret++;
          }
        } else {
          // console.log("   check bt"+step);
          for (var stepData of controlledModule.patData[step]) {
            if (controlledModule.patData[step] || false) ret++;
          }
        }
    }).stepFolds;
    //if the step was repeated throughout all the folds, the return is true.
    if (ret >= stepFolds) ret = true; //ret can be higher than twofold because each step can hold any n of events
    // console.log("ret is "+ret);
    return ret;
  };

  var getBitmapx16 = function(filter, requireAllFold, representLength) {
    var ret = 0x0000;
    let buttonStart=currentViewPage*16;
    if (requireAllFold) {
      for (var button = 0; button < 16; button++)
        if (getThroughfoldBoolean(button+buttonStart, filter) === requireAllFold) ret |= 0x1 << button;
    } else {
      if (filter) {
        for (var button = 0; button < 16; button++)
          if (controlledModule.patData[button+buttonStart])
            for (var stepData of controlledModule.patData[button+buttonStart])
              if (filter(stepData)) {
                /*  if(representLength){
                    ret|=~(0xffff<<stepData.stepLength)<<button;
                    // console.log("*-l",stepData.stepLength);
                  }else{*/
                ret |= 0x1 << button;
                /*  }*/
              }
      } else {
        for (var button = 0; button < 16; button++)
          if (controlledModule.patData[button+buttonStart])
            for (var stepData of controlledModule.patData[button+buttonStart])
              if (stepData) {
                ret |= 0x1 << button;
              }
      }
    }
    // console.log(">"+ret.toString(16));
    return ret;
  }



  controlledModule.on('noteOnRecorded', function(event) {
    configurators.event.setFromEventPattern(event.eventPattern);
  });
  controlledModule.on('step', function(event) {
    if (!engagedConfigurator)
      for (let hardware of engagedHardwares) {
        if (engagedConfigurator === false)
          updateLeds(hardware);
      }
    // loopDisplace.value=controlledModule.loopDisplace.value;
  });

  this.matrixButtonPressed = function(event) {
    // console.log(event.data);
    var hardware = event.hardware;
    if (skipMode) {
      controlledModule.restart(event.data[0]);

    } else if (engagedConfigurator === false) {
      var button = event.data[0];
      var currentFilter = shiftPressed ? moreBluredFilter : focusedFilter;
      var throughfold = getThroughfoldBoolean(button, currentFilter);
      var targetButton=button+(currentViewPage*16);
      //if shift is pressed, there is only one repetition throughfold required, making the edition more prone to delete.
      if (shiftPressed) {
        if (throughfold !== true) throughfold = throughfold > 0;
      } else {
        throughfold = throughfold === true;
      }
      // console.log(throughfold);
      if (throughfold) {
        //there is an event on every fold of the lookloop
        eachFold(targetButton, function(step) {
          controlledModule.clearStepByFilter(step, currentFilter)
        });
      }
      /*else if(trhoughFold>0){
                //there is an event on some folds of the lookloop
                var newStepEv=configurators.event.getEventPattern();
                eachFold(button,function(step){
                  store(step,newStepEv);
                });
              }*/
      else {
        //on every repetition is empty
        noteLengthner.startAdding(targetButton, configurators.event.getEventPattern());
        noteLengthnerStartPointsBitmap |= 0x1 << button;
        noteLengthnerLengthsBitmap = noteLengthnerStartPointsBitmap;
      }
      updateLeds(hardware);
    } else {

      engagedConfigurator.matrixButtonPressed(event);
    } // console.log(event.data);
  };
  this.matrixButtonReleased = function(event) {
    var hardware = event.hardware;
    var targetButton=event.button+(currentViewPage*16);
    noteLengthner.finishAdding(targetButton, function(differenciator, sequencerEvent, nicCount) {
      eachFold(differenciator, function(step) {
        /*var added=*/
        controlledModule.storeNoDup(step, sequencerEvent);
      });
      if (nicCount == 0) {
        noteLengthnerStartPointsBitmap = 0;
        noteLengthnerLengthsBitmap = 0;
      }
      // console.log(nicCount);
    } /*,configurators.event.getEventPattern()*/ );



    if (engagedConfigurator === false) {
      updateLeds(hardware);
    } else {

      engagedConfigurator.matrixButtonPressed(event);
    }
  };
  this.matrixButtonHold = function(event) {};
  this.selectorButtonPressed = function(event) {
    var hardware = event.hardware;

    if (engagedConfigurator)
      engagedConfigurator.selectorButtonPressed(event);
    // console.log(event);
    //keep trak of pressed buttons for button combinations
    configuratorsPressed[event.data[0]] = true;
    if (configuratorsPressed[2] && configuratorsPressed[3]) {
      if (lastEngagedConfigurator)
        lastEngagedConfigurator.disengage(hardware);
      lastEngagedConfigurator = engagedConfigurator = false;
      skipMode = true;
      hardware.sendScreenA("skip to step");
      updateLeds(hardware);
    } else if (configuratorsPressed[1] && configuratorsPressed[3]) {
      if (lastEngagedConfigurator)
        lastEngagedConfigurator.disengage(hardware);
      lastEngagedConfigurator = engagedConfigurator = false;
      shiftPressed = true;
      hardware.sendScreenA("select through");
      updateLeds(hardware);
    } else if (event.data[0] == 1) {
      /**TODO: use configurator objects instead of their names**/
      engagedConfigurator = configurators.event;
      lastEngagedConfigurator = configurators.event;
      configurators.event.engage(event);
    } else if (event.data[0] == 2) {
      engagedConfigurator = configurators.record;
      lastEngagedConfigurator = configurators.record;
      engagedConfigurator.engage(event);
    } else if (event.data[0] == 3) {
      engagedConfigurator = configurators.time;
      lastEngagedConfigurator = configurators.time;
      engagedConfigurator.engage(event);
    }

  };
  this.selectorButtonReleased = function(event) {
    var hardware = event.hardware;
    configuratorsPressed[event.data[0]] = false;

    skipMode = false;
    shiftPressed = false;

    if (engagedConfigurator) {
      engagedConfigurator.selectorButtonReleased(event);
      engagedConfigurator.disengage(hardware);
      engagedConfigurator = false;
    }

    updateHardware(hardware);
  };
  this.encoderScrolled = function(event) {
    var hardware = event.hardware;
    if (lastEngagedConfigurator) {
      lastEngagedConfigurator.encoderScrolled(event);
    }
    updateLeds(hardware);
  };
  this.encoderPressed = function(event) {};
  this.encoderReleased = function(event) {};
  this.engage = function(event) {
    var hardware = event.hardware;
    engagedHardwares.add(event.hardware);
    updateHardware(event.hardware);

    //when you record from a preset kit, and then search the Sequencer
    //it can get really hard to find the sequencer if they don't show the
    //recording by defaut
    if (lastRecordedNote) {
      // console.log("lastRecordedNote",lastRecordedNote);
      //this will update the output list in the sequencer, otherwise it may have a value out of array
      configurators.event.options[0].valueNames(0);
      configurators.event.setFromEventPattern(lastRecordedNote);
      lastRecordedNote = false;
    }
    updateLeds(hardware);
  };
  this.disengage = function(event) {
    engagedHardwares.delete(event.hardware);
  }

  //feedback functions
  var updateHardware = function(hardware) {
    hardware.sendScreenA(thisInterface.name);
    updateLeds(hardware);
  }
  // var updateLeds=function(hardware){
  //   stepsBmp=getBitmap16();
  //   hardware.draw([playHeadBmp,playHeadBmp|stepsBmp,stepsBmp]);
  // }

  var focusedFilter = new configurators.event.Filter({
    header: true,
    value_a: true,
    value_b: true
  });
  var bluredFilter = new configurators.event.Filter({
    header: true,
    value_a: true
  });
  var moreBluredFilter = new configurators.event.Filter({
    header: true
  });

  function updateLeds(hardware) {
    //actually should display also according to the currently being tweaked
    var showThroughfold = lastEngagedConfigurator == configurators.time;
    var mostImportant = getBitmapx16(shiftPressed ? moreBluredFilter : focusedFilter, showThroughfold);
    var mediumImportant = getBitmapx16(moreBluredFilter, showThroughfold);
    mediumImportant |= noteLengthnerStartPointsBitmap;
    var leastImportant = getBitmapx16(bluredFilter, false, !shiftPressed); //red, apparently
    leastImportant |= noteLengthnerLengthsBitmap;
    var drawStep = 0;
    var playHeadBmp = 0;
    //"render" play header:
    //if we are in modulus view, it renders many playheads
    if (lastEngagedConfigurator == "time") {
      drawStep = currentStep.value % (lookLoop.value || loopLength.value);
      var stepFolds = Math.ceil(loopLength.value / (lookLoop.value || loopLength.value));
      for (var a = 0; a < stepFolds; a++) {
        playHeadBmp |= 0x1 << drawStep + a * (lookLoop.value || loopLength.value);
      }
      playHeadBmp &= 0xFFFF;
    } else {
      //otherwise, normal one header
      drawStep = currentStep.value % loopLength.value;
      var playHeadBmp = 0x1 << (drawStep+(currentViewPage*16));
    }

    hardware.draw([
      playHeadBmp ^ mostImportant,
      playHeadBmp | mostImportant | mediumImportant,
      (mostImportant) | mediumImportant | leastImportant,
    ]);
  }
}