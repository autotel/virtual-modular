"use strict";
var EventMessage = require('../../datatypes/EventMessage.js');
var EventConfigurator = require('../x16utils/EventConfigurator.js');
var BlankConfigurator = require('../x16utils/BlankConfigurator.js');
var RecordMenu = require('../x16utils/RecordMenu.js');
var NoteLengthner = require('./sequencerGuts/NoteLengthner.js');
var EventPattern = require('./EventPattern');
var headers = EventMessage.headers;

var base = require('../../interaction/x16basic/interactorBase.js');

function log(b, n) {
  return Math.log(n) / Math.log(b);
}
/**
definition of a monoSequencer interactor for the x16basic controller hardware
*/
module.exports = function (controlledModule, environment) {
  base.call(this);
  var self = this;
  //boilerplate

  base.call(this, controlledModule);
  var thisInterface = this;
  var currentViewStartStep = 0;
  var engagedHardwares = new Set();

  //tracking vars
  var lastRecordedNote = false;


  var noteLengthnerStartPointsBitmap = 0x0;
  var noteLengthnerLengthsBitmap = 0x0;
  var noteLengthner = new NoteLengthner(controlledModule);
  noteLengthner.onStep(function (thisNoteLengthner, nicCount) {
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
    values: [1, 0, -1, -1]
  });


  configurators.event.getEventPattern = function () {
    var newEvPat = new EventPattern();
    newEvPat.fromEventMessage(this.getEventMessage());
    newEvPat.stepLength = 1;
    return newEvPat;
  }
  configurators.event.setFromEventPattern = function (evPat) {
    if (evPat) {
      if (evPat.on) {
        this.setFromEventMessage(evPat.on);
        // baseEvent = new EventMessage(EvPat.on);
        this.passiveUpdateScreen();
      }
    }

  }

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
      "fold": { value: controlledModule.loopLength.value, base: 2 },
      "fold!": { value: controlledModule.loopLength.value, base: 2 },
      "shift+cpte.": { value: 0 },
      "loop look": lookLoop,
      "page": { value: 0 },
      "step length": { value: controlledModule.stepDivide.value },
      "drift substep": controlledModule.loopDisplace,
      "microstep offset": controlledModule.microStepDisplace,
      "playing": controlledModule.playing,
      "stoppable": controlledModule.listenTransport,
      "rec mode": { value: controlledModule.recordSettings.mode },
      "on rec end": { value: controlledModule.recordSettings.switchOnEnd },
    }
  });

  configurators.time.vars["step length"].changeFunction = function (thisVar, delta) {
    thisVar.value += delta;
    if (thisVar.value < -4) {
      thisVar.value -= delta;
    } else if (thisVar.value < 1) {
      controlledModule.stepDivide.value = Math.pow(2, thisVar.value);//go by 12 divisible numbers: Math.floor( Math.pow(2,-1)/(1/12) )/12
    } else {
      controlledModule.stepDivide.value = thisVar.value;
    }
  }
  configurators.time.vars["step length"].nameFunction = function (thisVar) {
    return "to " + controlledModule.stepDivide.value;
  }
  configurators.time.vars["shift+cpte."].changeFunction = function (v, d) {
    v.value += d;
    controlledModule.offsetSequence(d);
    controlledModule.currentStep.value += d;
  };
  configurators.time.vars["shift+cpte."].selectFunction = function (v) {
    v.value = 0;
  }

  configurators.time.vars["loop length"].min = 1;
  configurators.time.vars["loop length"].changeFunction = function (thisVar, delta) {
    if (thisVar.value + delta >= 1)
      thisVar.value += delta;
    controlledModule.handleStepsChange();

  }

  configurators.time.vars["fold"].nameFunction = configurators.time.vars["fold!"].nameFunction = function (thisVar) {
    //TODO: ensure that the thisVar.value ends up being the actual length
    return `${thisVar.base}^${Math.round(thisVar.power * 100) / 100}>${Math.round(thisVar.value)}`;

  }
  configurators.time.vars["fold"].selectFunction = configurators.time.vars["fold!"].selectFunction = function (thisVar) {
    thisVar.value = controlledModule.loopLength.value;
    thisVar.power = log(thisVar.base, thisVar.value);
  }
  configurators.time.vars["fold!"].changeFunction = function (thisVar, delta) {
    var oldLength = thisVar.value;
    if (shiftPressed) {
      thisVar.base += delta;
    } else {
      thisVar.power += delta;
    }
    thisVar.value = Math.round(Math.pow(thisVar.base, thisVar.power));
    if (thisVar.value < 1) {
      thisVar.value = 1;
    }
    if (thisVar.base < 1) {
      thisVar.base = 1;
    }
    if (thisVar.power < 1) {
      thisVar.power = 1;
    }
    // console.log("FOLD",thisVar.value);
    controlledModule.duplicateSequence(0, oldLength, thisVar.value / oldLength);
    controlledModule.loopLength.value = thisVar.value;
    controlledModule.handleStepsChange();
  }
  configurators.time.vars["fold"].changeFunction = function (thisVar, delta) {
    var oldLength = thisVar.value;
    if (shiftPressed) {
      thisVar.base += delta;
    } else {
      thisVar.power += delta;
    }
    thisVar.value = Math.round(Math.pow(thisVar.base, thisVar.power));
    if (thisVar.value < 1) {
      thisVar.value = 1;
    }
    if (thisVar.base < 1) {
      thisVar.base = 1;
    }
    if (thisVar.power < 1) {
      thisVar.power = 1;
    }
    controlledModule.loopLength.value = thisVar.value;
    controlledModule.handleStepsChange();
  }

  configurators.time.vars["loop look"].nameFunction = function (thisVar) {
    return (thisVar.value == 0 ? "off" : "" + thisVar.value);
  };
  configurators.time.vars["loop look"].changeFunction = function (thisVar, delta) {
    if (thisVar.value + delta >= 0)
      thisVar.value += delta;
  }
  configurators.time.vars["page"].changeFunction = function (thisVar, delta) {
    if (thisVar.value + delta >= 0)
      thisVar.value += delta;
    thisVar.value = thisVar.value % controlledModule.loopLength.value;
    currentViewStartStep = thisVar.value * 16;
  }

  configurators.time.vars["drift substep"].nameFunction = function (thisVar) {
    return (thisVar.value > 0 ? "+" : " ") + thisVar.value;
  };
  // configurators.time.vars["time displace"].changeFunction = function(thisVar,delta){
  //   if(thisVar.value+delta>=0)
  //   thisVar.value+=delta;
  // }
  configurators.time.vars["microstep offset"].nameFunction = function (thisVar) {
    return thisVar.value + "/" + controlledModule.microStepDivide.value;
  };

  configurators.time.vars["playing"].changeFunction = function (thisVar, delta) {
    if (delta > 0) {
      thisVar.value = true;
    } else {
      thisVar.value = false;
    }
  }
  configurators.time.vars["stoppable"].changeFunction = function (thisVar, delta) {
    thisVar.value = !thisVar.value;
  }

  configurators.time.vars["rec mode"].changeFunction = function (thisVar, delta) {
    var possible = controlledModule.recordSettings.namesList.length;
    thisVar.value = controlledModule.recordSettings.mode;
    thisVar.value += delta;
    if (thisVar.value < 0) thisVar.value = possible - 1;
    thisVar.value %= possible;
    controlledModule.recordSettings.mode = thisVar.value;
  }
  configurators.time.vars["rec mode"].nameFunction = function (thisVar) {
    return controlledModule.recordSettings.namesList[thisVar.value] || "nothing";
  }
  configurators.time.vars["on rec end"].nameFunction = configurators.time.vars["rec mode"].nameFunction;
  configurators.time.vars["on rec end"].changeFunction = function (thisVar, delta) {
    var possible = controlledModule.recordSettings.namesList.length;
    thisVar.value = controlledModule.recordSettings.switchOnEnd;
    thisVar.value += delta;
    if (thisVar.value < 0) thisVar.value = possible;
    thisVar.value %= possible + 1;
    controlledModule.recordSettings.switchOnEnd = thisVar.value;
    if (thisVar.value > possible) {
      controlledModule.recordSettings.switchOnEnd = false;
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
  var getThroughfoldBoolean = function (button, filterFunction) {
    var ret = 0;
    var stepFolds = eachFold(button, function (step) {
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

  var getBitmapx16 = function (filter, requireAllFold, representLength) {
    var ret = 0x0000;
    let buttonStart = currentViewStartStep;
    if (requireAllFold) {
      for (var button = 0; button < 16; button++)
        if (getThroughfoldBoolean(button + buttonStart, filter) === requireAllFold) ret |= 0x1 << button;
    } else {
      if (filter) {
        for (var button = 0; button < 16; button++)
          if (controlledModule.patData[button + buttonStart])
            for (var stepData of controlledModule.patData[button + buttonStart])
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
          if (controlledModule.patData[button + buttonStart])
            for (var stepData of controlledModule.patData[button + buttonStart])
              if (stepData) {
                ret |= 0x1 << button;
              }
      }
    }
    // console.log(">"+ret.toString(16));
    return ret;
  }



  controlledModule.on('noteOnRecorded', function (event) {
    configurators.event.setFromEventPattern(event.eventPattern);
  });
  controlledModule.on('step', function (event) {
    if (!engagedConfigurator)
      for (let hardware of engagedHardwares) {
        if (engagedConfigurator === false)
          self.updateLeds(hardware);
      }
    // loopDisplace.value=controlledModule.loopDisplace.value;
  });

  this.matrixButtonPressed = function (event) {
    // console.log(event.data);
    var button = event.button;
    var targetButton = button + currentViewStartStep;
    var hardware = event.hardware;
    if (skipMode) {
      controlledModule.restart(targetButton);

    } else if (engagedConfigurator === false) {
      var currentFilter = shiftPressed ? moreBluredFilter : bluredFilter;
      var throughfold = getThroughfoldBoolean(targetButton, currentFilter);
      // console.log("THEREIS",throughfold);
      //if shift is pressed, there is only one repetition throughfold required, making the edition more prone to delete.
      if (shiftPressed) {
        if (throughfold !== true) throughfold = throughfold > 0;
      } else {
        throughfold = throughfold === true;
      }
      // console.log(throughfold);
      if (throughfold) {
        var removedEvent = false;
        //there is an event on every fold of the lookloop
        eachFold(targetButton, function (step) {
          removedEvent = controlledModule.clearStepByFilter(step, currentFilter)
        });

        if (removedEvent && shiftPressed) {
          // console.log(removedEvent);
          configurators.event.setFromEventPattern(removedEvent[0], event.hardware);
          lastEngagedConfigurator = configurators.event;
        }
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
        var targetEventPattern = configurators.event.getEventPattern();

        noteLengthner.startAdding(targetButton, targetEventPattern);

        noteLengthnerStartPointsBitmap |= 0x1 << button;
        noteLengthnerLengthsBitmap = noteLengthnerStartPointsBitmap;
      }
      self.updateLeds(hardware);
    } else {

      engagedConfigurator.matrixButtonPressed(event);
    } // console.log(event.data);
  };
  this.matrixButtonReleased = function (event) {
    var hardware = event.hardware;
    var targetButton = event.button + currentViewStartStep;
    noteLengthner.finishAdding(targetButton, function (differenciator, sequencerEvent, nicCount) {
      eachFold(differenciator, function (step) {
        /*var added=*/
        controlledModule.storeNoDup(step, sequencerEvent);
      });
      if (nicCount == 0) {
        noteLengthnerStartPointsBitmap = 0;
        noteLengthnerLengthsBitmap = 0;
      }
      // console.log(nicCount);
    } /*,configurators.event.getEventPattern()*/);



    if (engagedConfigurator === false) {
      self.updateLeds(hardware);
    } else {

      engagedConfigurator.matrixButtonPressed(event);
    }
  };
  this.matrixButtonHold = function (event) { };
  this.selectorButtonPressed = function (event) {
    var hardware = event.hardware;

    if (engagedConfigurator)
      engagedConfigurator.selectorButtonPressed(event);
    // console.log(event);
    //keep trak of pressed buttons for button combinations
    configuratorsPressed[event.data[0]] = true;
    if (configuratorsPressed[0] && configuratorsPressed[1] || configuratorsPressed[3] && configuratorsPressed[1]) {
      if (lastEngagedConfigurator)
        lastEngagedConfigurator.disengage(hardware);
      lastEngagedConfigurator = engagedConfigurator = false;
      skipMode = true;
      hardware.sendScreenA("skip to step");
      self.updateLeds(hardware);
    } else if (event.data[0] == 1) {
      /**TODO: use configurator objects instead of their names**/
      engagedConfigurator = configurators.event;
      lastEngagedConfigurator = configurators.event;
      configurators.event.engage(event);
    } else if (event.data[0] == 2) {
      engagedConfigurator = configurators.time;
      lastEngagedConfigurator = configurators.time;
      engagedConfigurator.engage(event);
    } else if (event.data[0] == 0 || event.data[0] == 3) {
      if (lastEngagedConfigurator)
        lastEngagedConfigurator.disengage(hardware);
      lastEngagedConfigurator = engagedConfigurator = false;
      shiftPressed = true;
      hardware.sendScreenA("select through");
      self.updateLeds(hardware);
    } else if (event.data[0] >= 4) {
      var wouldPage = (event.data[0] - 4) * 16;
      //pressed the same button for a second time, and is one of both extreme buttons
      // if(currentViewStartStep==wouldPage){
      //   if(event.data[0]==7){
      //     currentViewStartStep+=16;
      //   }else if(event.data[0]==4){
      //     if (currentViewStartStep>=0){
      //       currentViewStartStep-=16;
      //     }
      //   }
      // }else{
      currentViewStartStep = wouldPage;
      // }
    } else if (event.data[0] >= 8) {
      engagedConfigurator = configurators.record;
      lastEngagedConfigurator = configurators.record;
      engagedConfigurator.engage(event);
    }

  };
  this.selectorButtonReleased = function (event) {
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
  this.encoderScrolled = function (event) {
    var hardware = event.hardware;
    if (lastEngagedConfigurator) {
      lastEngagedConfigurator.encoderScrolled(event);
    }
    self.updateLeds(hardware);
  };
  this.encoderPressed = function (event) { };
  this.encoderReleased = function (event) { };
  this.engage = function (event) {
    var hardware = event.hardware;
    engagedHardwares.add(event.hardware);
    updateHardware(event.hardware);
    // hardware.sendScreenA(controlledModule.name);

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
    self.updateLeds(hardware);
  };
  this.disengage = function (event) {
    engagedHardwares.delete(event.hardware);
  }

  //feedback functions
  var updateHardware = function (hardware) {
    // hardware.sendScreenA(controlledModule.name);
    self.updateLeds(hardware);
  }
  // var self.updateLeds=function(hardware){
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
  var filterNone = new configurators.event.Filter({
  });

  self.updateLeds = function (hardware) {
    //actually should display also according to the currently being tweaked
    var showThroughfold = lastEngagedConfigurator == configurators.time;
    var mostImportant = getBitmapx16(shiftPressed ? moreBluredFilter : focusedFilter, showThroughfold);
    var mediumImportant = getBitmapx16(bluredFilter, showThroughfold);
    mediumImportant |= noteLengthnerStartPointsBitmap;
    var leastImportant = getBitmapx16(moreBluredFilter, false, !shiftPressed);
    var everyEvent = getBitmapx16(filterNone, false, false);
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
      var playHeadBmp = 0x1 << (drawStep + currentViewStartStep);
    }

    hardware.draw([
      (playHeadBmp ^ mostImportant) | (shiftPressed ? (everyEvent ^ mediumImportant) : 0),
      playHeadBmp | mostImportant | mediumImportant,
      mostImportant | mediumImportant | leastImportant,
    ]);
    return [mostImportant, mediumImportant, leastImportant, everyEvent];
  }
}