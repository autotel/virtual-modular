"use strict";
var EventMessage = require('../../datatypes/EventMessage.js');
var EventConfigurator = require('../x16utils/EventConfigurator.js');
var BlankConfigurator = require('../x16utils/BlankConfigurator.js');
var RecordMenu = require('../x28utils/RecordMenu.js');
var scaleNames = require('./scaleNames.js');

/**
TODO: interfaces should be extended by the environment, instead of being required on each module,
in the same way how modules are extended.
*/
var base = require('../../interaction/x28basic/interactorBase.js');

/**
definition of a harmonizer interactor for the x16basic controller hardware
*/
module.exports = function (controlledModule, environment) {
  base.call(this);

  var self = this;
  var thisInterface = this;
  var fingerMap = 0x0000;
  var scaleSelectionMap = controlledModule.currentScale;
  var compressedScaleMaps = undefined;
  var scaleIntervalsMap;
  var noteHiglightMap = 0;
  var performMode = true;
  var currentScale = 0;
  var copyingScale = false;
  var engaged = false;
  //configurators setup
  var engagedConfigurator = false;
  var configurators = {};

  var keyboardRoot = {
    value: 0,
    changeFunction: function (thisVar, delta, event) {
      var hin = event.hardware.instanceNumber;
      if (hardwareLocals[hin]) {
        hardwareLocals[hin].keyboardRoot += delta;
        thisVar.value = hardwareLocals[hin].keyboardRoot;
      }
    }

  };

  var keyboardChan = {
    value: 0,
    changeFunction: function (thisVar, delta, event) {
      var hin = event.hardware.instanceNumber;
      if (hardwareLocals[hin]) {
        hardwareLocals[hin].keyboardChan += delta;
        thisVar.value = hardwareLocals[hin].keyboardChan;
      }
    }
  };

  var hardwareLocals = {}




  configurators.event = new EventConfigurator(this, {
    baseEvent: controlledModule.defaultNote,
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
  })


  //interaction with controlledModule
  var currentStep = controlledModule.currentStep;
  var loopLength = controlledModule.loopLength;
  var engagedHardwares = new Set();
  controlledModule.on('noteplayed', function (evt) {

    // console.log(controlledModule.defaultNote.testvar);
    // console.log(configurators.event.baseEvent);
    var relativeNote = (evt.triggeredNote - controlledModule.defaultNote.note()) % 12;
    // console.log(relativeNote);
    var newH = noteHiglightMap |= 4097 << relativeNote;

    setTimeout(function () {
      noteHiglightMap &= ~newH;
    }, 300);
    passiveUpdateLeds();
  });
  controlledModule.on('chordchange', function () {
    for (let hardware of engagedHardwares) {
      updateHardware(hardware);
    }
  });
  var selectScaleMap = function (num) {
    if ((currentScale == 1 && num == 1) || (currentScale == 4 && num == 4) || (currentScale == 2 && num == 2) || (currentScale == 8 && num == 8)) {
      currentScale = 0;
    } else {
      currentScale = num;
    };
    if (performMode)
      controlledModule.uiScaleChange(currentScale);
    scaleIntervalsMap = controlledModule.getScaleMap(currentScale);
    for(hin in hardwareLocals){
      hardwareLocals[hin].compressedScaleMaps = undefined;
    }
  }
  var updateScaleMap = function (newScaleMap) {
    scaleIntervalsMap = newScaleMap;
    controlledModule.newScaleMap(currentScale, newScaleMap);
    for(hin in hardwareLocals){
      hardwareLocals[hin].compressedScaleMaps = undefined;
    }
  }

  controlledModule.on('messagesend', function (ev) {
  });

  //interaction with hardware



  this.engage = function (event) {
    var hardware = event.hardware;
    var hin = event.hardware.instanceNumber;

    if (!hardwareLocals[hin]) hardwareLocals[hin] = { keyboardRoot: 0, keyboardChan: 0 }

    engagedHardwares.add(event.hardware);
    updateHardware(event.hardware);
    updateLeds(hardware);

    // self.on('interaction', function (a, b, c) {
    //   console.log("H", a, b, c);
    // })


  };
  this.disengage = function (event) {
    engagedHardwares.delete(event.hardware);

    // self.off('interaction');
  }


  this.matrixButtonPressed = function (event) {
    // console.log(event.data);
    var hardware = event.hardware;
    var hin = event.hardware.instanceNumber;

    var button = event.data[0];
    var eventFingerMap = event.data[2];
    // console.log(eventFingerMap);
    if (engagedConfigurator === false) {
      if (performMode) {
        var triggerKey = event.data[0] + hardwareLocals[hin].keyboardRoot;
        controlledModule.uiTriggerOn(triggerKey, new EventMessage({
          value: [-1, triggerKey, hardwareLocals[hin].keyboardChan]
        }));
      } else {
        var grade = event.data[0] % 12;
        updateScaleMap(scaleIntervalsMap ^ (1 << grade));
        updateHardware(hardware);
      }
    } else {
      engagedConfigurator.matrixButtonPressed(event);
    }
  };
  this.matrixButtonReleased = function (event) {
    var hardware = event.hardware;
    var hin = hardware.instanceNumber;
    if (engagedConfigurator === false) {
      controlledModule.uiTriggerOff(event.data[0] + hardwareLocals[hin].keyboardRoot, hardwareLocals[hin].keyboardChan);
      updateLeds(hardware);

    } else {
      engagedConfigurator.matrixButtonReleased(event);
    }
  };
  this.matrixButtonHold = function (event) { };
  this.selectorButtonPressed = function (event) {
    if (engagedConfigurator) {
      engagedConfigurator.selectorButtonPressed(event);
    } else {
      var hardware = event.hardware;
      if (event.data[0] == 1) {
        engagedConfigurator = configurators.event;
        lastEngagedConfigurator = configurators.event;
        configurators.event.engage(event);
      } else if (event.data[0] == 2) {
        if (performMode) {
          engagedConfigurator = configurators.record;
          lastEngagedConfigurator = configurators.record;
          configurators.record.engage(event);
        } else {
          copyingScale = currentScale;
          event.hardware.sendScreenA('copy scale to...');
          event.hardware.sendScreenB('(release)');
        }
      } else if (event.data[0] == 0) {
        performMode = !performMode;
        updateHardware(hardware);
      } else if (event.button >= 8) {
        configurators.record.engage(event);
      } else if (event.button >= 4) {
        scaleSelectionMap ^= 1 << (event.data[0] - 4);
        selectScaleMap(scaleSelectionMap);
        // updateHardware(hardware);
      }
    }
  };
  this.selectorButtonReleased = function (event) {
    var hardware = event.hardware;
    if (engagedConfigurator) {
      engagedConfigurator.selectorButtonReleased(event);
    }
    if (event.data[0] == 1) {
      engagedConfigurator = false;
      configurators.event.disengage(hardware);
    } else if (event.data[0] == 2) {
      if (copyingScale !== false) {
        updateScaleMap(controlledModule.getScaleMap(copyingScale));
        updateHardware(hardware);
        copyingScale = false;
      } else {
        engagedConfigurator = false;
        configurators.record.disengage(hardware);
      }
    } else if (event.data[0] == 3) {

    } else if (event.button >= 8) {
      configurators.record.disengage(hardware);
      engagedConfigurator = false;
    } else if (event.button >= 4) {
      // scaleSelectionMap &= ~(1<<(event.data[0]-4));
      // selectScaleMap(scaleSelectionMap);
      // updateHardware(hardware);
    }
    updateHardware(hardware);
  };
  this.encoderScrolled = function (event) {

    var hardware = event.hardware;
    var hin=event.hardware.instanceNumber;
    if (lastEngagedConfigurator) {
      lastEngagedConfigurator.encoderScrolled(event);
      if (lastEngagedConfigurator == configurators.event) {
        hardwareLocals[hin].compressedScaleMaps = undefined;
        updateLeds(event.hardware);
      }
    }
    updateLeds(hardware);
  };
  this.encoderPressed = function (event) { };
  this.encoderReleased = function (event) { };

  configurators.record.autoEngageWindow();

  var passiveUpdateLeds = function () {
    if (!engagedConfigurator)
      for (var hardware of engagedHardwares) {
        updateLeds(hardware);
      }
  }
  var updateHardware = function (hardware) {
    currentScale = controlledModule.currentScale;
    updateLeds(hardware);
    updateScreen(hardware);
  }
  var updateLeds = function (hardware) {
    var selScaleMap = (scaleSelectionMap & 0xf);
    // hardware.paintColorFromLedN(0,[0,0,0],0,false);
    hardware.paintColorFromLedN(selScaleMap << 4, [255, 127, 0], 0, false);
    
    var hin = hardware.instanceNumber;
    if (performMode) {
      if (hardwareLocals[hin].compressedScaleMaps === undefined) {
        hardwareLocals[hin].compressedScaleMaps = controlledModule.getCompMaps(currentScale, hardwareLocals[hin].keyboardRoot);
      }

      hardware.draw([
        hardwareLocals[hin].compressedScaleMaps.roots, 
        hardwareLocals[hin].compressedScaleMaps.roots, 
        hardwareLocals[hin].compressedScaleMaps.semitones[1]
      ]);

    } else {
      if (scaleIntervalsMap === undefined) {
        scaleIntervalsMap = controlledModule.getScaleMap(currentScale);
      }

      var SNN = scaleIntervalsMap;

      SNN |= SNN << 12;

      hardware.draw([SNN | noteHiglightMap, noteHiglightMap, 0x5AB5 | noteHiglightMap | SNN]);
    }
  }
  var updateScreen = function (hardware, upleds = true, upscreen = true) {

    var screenAString = "";
    var screenBString = "";
    if (performMode) {
      if (!engagedConfigurator) screenAString += "Perform "
    } else {
      if (!engagedConfigurator) screenAString += "Edit ";
    }
    if (controlledModule.scaleArray[currentScale]) {
      var currentScaleName = scaleNames.scaleToName[scaleIntervalsMap];
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
  }
}
