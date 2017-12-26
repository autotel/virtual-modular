"use strict";
var EventMessage = require('../../datatypes/EventMessage.js');
var EventConfigurator = require('../x16utils/EventConfigurator.js');
var BlankConfigurator = require('../x16utils/BlankConfigurator.js');
var RecordMenu = require('../x16utils/RecordMenu.js');
var scaleNames = require('./scaleNames.js');
var RecorderModuleWindow = require('../x28utils/RecorderModuleWindow.js');
// var RecordMenu=require('../x16utils/RecordMenu.js');
/**
definition of a harmonizer interactor for the x16basic controller hardware
*/
module.exports = function(environment) {
  this.Instance = function(controlledModule) {
    environment.interactionMan.interfaces.x16basic.interactorBase.call(this, controlledModule);
    var thisInterface = this;
    var fingerMap = 0x0000;
    var scaleMap = 0xAB5; //major
    var noteHiglightMap = 0;
    var performMode = true;
    var currentScale = 0;
    var engaged = false;
    //configurators setup
    var engagedConfigurator = false;
    var configurators = {};

    var keyboardRoot = {
      value: 0
    };
    var keyboardChan = {
      value: 0
    };

    configurators.event = new EventConfigurator(this, {
      baseEvent: controlledModule.baseEventMessage,
      extraVariables: {
        "keyboard base": keyboardRoot,
        "keyboard chan": keyboardChan
      },
      name: "Msg & Perform",
      valueNames: ["func", "set chan", "root n", "velo"]
    });
    // configurators.event.addextraVariables();
    var lastEngagedConfigurator = configurators.event;
    configurators.record = new RecordMenu(this, {
      environment: environment,
      controlledModule: controlledModule
    });
    let recorderModuleWindow = new RecorderModuleWindow(controlledModule, environment);

    //interaction with controlledModule
    var currentStep = controlledModule.currentStep;
    var loopLength = controlledModule.loopLength;
    var engagedHardwares = new Set();
    controlledModule.on('note played', function(evt) {
      var grade = evt.triggeredGrade;
      var note = evt.triggeredNote % 12;
      var newH = noteHiglightMap |= 1 << note + 4;
      setTimeout(function() {
        noteHiglightMap &= ~newH;
      }, 300);
      passiveUpdateLeds();
    });
    controlledModule.on('chordchange', function() {
      if (!engagedConfigurator)
        for (let hardware of engagedHardwares) {
          // console.log("chc");
          if (performMode) {
            currentScale = controlledModule.currentScale;
            scaleMap = controlledModule.getScaleMap(currentScale);
            if (engaged)
              updateLeds(hardware);
          } else {
            if (engaged)
              hardware.sendScreenB("chord " + controlledModule.currentScale);
          }
        }
    });
    var selectScaleMap = function(num) {
      // controlledModule.currentScale=currentScale;
      //var currentScale=controlledModule.currentScale;
      if ((currentScale == 1 && num == 1) || (currentScale == 4 && num == 4) || (currentScale == 2 && num == 2) || (currentScale == 8 && num == 8)) {
        currentScale = 0;
      } else {
        currentScale = num;
      };
      if (performMode)
        controlledModule.uiScaleChange(currentScale);
      scaleMap = controlledModule.getScaleMap(currentScale);
    }
    var updateScaleMap = function(newScaleMap) {
      scaleMap = newScaleMap;
      controlledModule.newScaleMap(currentScale, newScaleMap);
    }

    updateScaleMap(scaleMap);
    controlledModule.on('messagesend', function(ev) {
      //hmm... that check sould be inside, right?
      // if(configurators.recorder.recording)
      // configurators.recorder.recordOptEvent(ev.eventMessage);
    });

    //interaction setup
    this.matrixButtonPressed = function(event) {
      // console.log(event.data);
      var hardware = event.hardware;
      var button = event.data[0];
      var eventFingerMap = event.data[2];
      // console.log(eventFingerMap);
      if (engagedConfigurator === false) {
        if (performMode) {
          // if(!currentSeqEvent){
          //   currentSeqEvent=configurators.dimension.getSeqEvent();
          // }
          if (event.data[0] > 3) {
            //scale section pressed
            var triggerKey = event.data[0] + keyboardRoot.value - 4;
            controlledModule.uiTriggerOn(triggerKey, new EventMessage({
              value: [-1, keyboardChan.value, triggerKey]
            }));

            // if(configurators.recorder.recording){
            //   configurators.recorder.recordUiOn(event.data[0],onEventMessage);
            //   //a recorded flag is attached to the eventMessage to trigger a record note off when released, regardless of the state of recording. The flag will be pulled from the noteOnTracker
            //   onEventMessage.recorded=true;
            // }
          } else {
            //chordSelector section pressed
            fingerMap = eventFingerMap;
            // console.log(eventFingerMap);
            selectScaleMap(eventFingerMap);

            var onEventMessage = new EventMessage({
              destination: controlledModule.name,
              value: [1, controlledModule.currentScale, 125]
            });
            updateHardware(hardware);



            // if(configurators.recorder.recording){
            //   configurators.recorder.recordUiOn(event.data[0],onEventMessage);
            //   //otherwise the note never gets to the seq memory...
            //   configurators.recorder.recordUiOff(event.data[0]);
            // }
          }
        } else {
          if (event.data[0] > 3) {
            //scale section pressed
            updateScaleMap(scaleMap ^ (1 << event.data[0] - 4));
            updateScaleMap(scaleMap);
            updateHardware(hardware);
          } else {
            fingerMap = eventFingerMap;
            //chordSelector section pressed
            selectScaleMap(eventFingerMap);
            //TODO: tis doesnt go here, only for testing
            // controlledModule.currentScale=currentScale;
            updateHardware(hardware);
          }
        }
      } else {
        engagedConfigurator.matrixButtonPressed(event);
      } // console.log(event.data);
    };
    this.matrixButtonReleased = function(event) {
      var hardware = event.hardware;
      if (engagedConfigurator === false) {
        controlledModule.uiTriggerOff(event.data[0] + keyboardRoot.value - 4, keyboardChan.value);
        updateLeds(hardware);

      } else {
        engagedConfigurator.matrixButtonReleased(event);
      }
    };
    this.matrixButtonHold = function(event) {};
    this.selectorButtonPressed = function(event) {
      var hardware = event.hardware;

      if (event.data[0] == 1) {
        engagedConfigurator = configurators.event;
        lastEngagedConfigurator = configurators.event;
        configurators.event.engage(event);
      } else if (event.data[0] == 2) {
        engagedConfigurator = configurators.record;
        lastEngagedConfigurator = configurators.record;
        configurators.record.engage(event);
      } else if (event.data[0] == 3) {
        performMode = !performMode;
        updateHardware(hardware);
      } else if (event.button >= 8) {
        let wevent = {
          type: event.type,
          originalMessage: event.originalMessage,
          button: event.button,
          hardware: event.hardware
        };
        wevent.button -= 8;
        recorderModuleWindow.windowButtonPressed(wevent);
      }

      if (engagedConfigurator)
        engagedConfigurator.selectorButtonPressed(event);
    };
    this.selectorButtonReleased = function(event) {
      var hardware = event.hardware;
      if (engagedConfigurator) {
        engagedConfigurator.selectorButtonReleased(event);
      }
      if (event.data[0] == 1) {
        engagedConfigurator = false;
        configurators.event.disengage(hardware);
      } else if (event.data[0] == 2) {
        engagedConfigurator = false;
        configurators.record.disengage(hardware);
      } else if (event.data[0] == 3) {}
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
      updateLeds(hardware);
      recorderModuleWindow.engage(event);

    };
    this.disengage = function(event) {
      engagedHardwares.delete(event.hardware);
    }
    var passiveUpdateLeds = function() {
      if (!engagedConfigurator)
        for (var hardware of engagedHardwares) {
          updateLeds(hardware);
        }
    }
    var updateLeds = function(hardware) {
      updateHardware(hardware, true, false);
    }
    var updateScreen = function(hardware) {
      updateHardware(hardware, false, true);
    }
    //feedback functions
    var updateHardware = function(hardware, upleds = true, upscreen = true) {
      //var currentScale=controlledModule.currentScale;
      var currentScaleMap = 0;
      var displayScaleMap = scaleMap << 4;
      var displayFingerMap = fingerMap;
      var displayChordSelectorMap = 0xF;
      var screenAString = "";
      var screenBString = "";
      var SNH = displayScaleMap ^ noteHiglightMap;
      // console.log("sctn",scaleNames.scaleToName);

      if (performMode) {
        currentScaleMap = controlledModule.currentScale & 0xf;
        if (upleds)
          hardware.draw([
            displayChordSelectorMap | displayFingerMap | SNH,
            displayChordSelectorMap | displayFingerMap | displayScaleMap,
            0xAB50 | currentScaleMap | displayFingerMap | displayScaleMap
          ]);
        if (!engagedConfigurator) screenAString += "Perform-"
        // }
      } else {
        currentScaleMap = currentScale & 0xf;
        var displayScaleMap = scaleMap << 4;
        var displayFingerMap = fingerMap;
        var displayChordSelectorMap = 0xF;
        //green,blue,red
        if (upleds)
          hardware.draw([
            displayChordSelectorMap | displayFingerMap | SNH,
            displayChordSelectorMap | displayFingerMap | displayScaleMap,
            0xAB50 | currentScaleMap | displayFingerMap | displayScaleMap
          ]);

        if (!engagedConfigurator) screenAString += ("Edit ");
      }
      if (controlledModule.scaleArray[currentScale]) {
        var currentScaleName = scaleNames.scaleToName[scaleMap];
        if (currentScaleName) {
          screenAString = currentScaleName + "-" + screenAString;
        } else {
          screenAString += "chord " + currentScale + ": " + controlledModule.scaleArray[currentScale].length;
        }
      } else {
        screenAString += "chord " + currentScale + ": empty";
      }
      if (upscreen)
        hardware.sendScreenA(screenAString);
      // hardware.sendScreenB(screenBString);
    }
  }
}