"use strict";
var EventMessage = require('../../Polimod/datatypes/EventMessage.js');
var BlankConfigurator = require('../x16utils/BlankConfigurator.js');
var base = require('../../interaction/x16basic/interactorBase.js');
var RecordMenu = require('../x28utils/RecordMenu.js');


//instance section
module.exports = function (environment,controlledModule) {
  base.call(this);
  var configurators = {};
  configurators.global = new BlankConfigurator(environment,controlledModule,this, {
    name: "",
    vars: {
      "duration (micro)": controlledModule.settings.delayMicro,
    }
  });
  configurators.global.vars['duration (micro)'].changeFunction = function (thisVar, delta) {
    thisVar.value += delta;
    passiveUpdateHardware();
  }
  var engagedConfigurator = false;
  var lastEngagedConfigurator = configurators.event;

  var editMode = false;
  var selectedAlteration = 0;

  configurators.record = new RecordMenu(environment,controlledModule,this);

  var baseNote = 36;
  var engagedHardwares = new Set();

  this.matrixButtonPressed = function (event) {
    if (engagedConfigurator) {
      engagedConfigurator.matrixButtonPressed(event);
    } else {
      if (editMode) {
        selectedAlteration = event.button;
        updateLeds(event.hardware);
      } else {
        controlledModule.uiTrigger(event.button + baseNote);
      }
    }
  };
  this.matrixButtonReleased = function (event) {
    if (engagedConfigurator) { } else {
      updateHardware(event.hardware);
    }
    controlledModule.uiTriggerOff(event.button + baseNote);
  };
  this.matrixButtonHold = function (event) { };
  this.selectorButtonPressed = function (event) {
    var hardware = event.hardware;
    if (engagedConfigurator) {
      engagedConfigurator.selectorButtonPressed(event);
    } else {
      if (event.button == 0) {
        editMode = editMode == false;
      } else if (event.button == 2) {
        engagedConfigurator = configurators.global;
        configurators.global.engage(event);
      } else if (event.button >= 8) {
        lastEngagedConfigurator = engagedConfigurator = configurators.record;
      }
    }
    updateHardware(event.hardware);
  };
  this.selectorButtonReleased = function (event) {
    var hardware = event.hardware;
    if (event.button == 2) {
      if (engagedConfigurator == configurators.global) {
        lastEngagedConfigurator = engagedConfigurator;
        engagedConfigurator.disengage(event);
        engagedConfigurator = false;
      }
    }
  };
  this.encoderScrolled = function (event) {
    if (engagedConfigurator) {
      engagedConfigurator.encoderScrolled(event);
    } else {
      if (editMode) {
        controlledModule.alterations[selectedAlteration % 12] += event.delta;
        updateScreen(event.hardware);
      } else {
        if (lastEngagedConfigurator) {
          lastEngagedConfigurator.encoderScrolled(event)
        }
      }
    }
  };
  this.encoderPressed = function (event) { };
  this.encoderReleased = function (event) { };
  this.engage = function (event) {
    engagedHardwares.add(event.hardware);
    updateHardware(event.hardware);
  };

  
  this.disengage = function (event) {
    engagedHardwares.delete(event.hardware);
  }
  configurators.record.autoEngageWindow();
  
  var RARROW = String.fromCharCode(126);
  var updateScreen = function (hardware) {
    if (editMode) {
      hardware.screenA("edit alteration");
      hardware.screenB((selectedAlteration % 12) + RARROW + controlledModule.alterations[selectedAlteration % 12]);
    } else {
      hardware.screenA(controlledModule.name);
    }
  }
  var updateHardware = function (hardware) {
    updateScreen(hardware);
    updateLeds(hardware);
  }
  var passiveUpdateHardware = function () {
    engagedHardwares.forEach(function (hardware) {
      updateLeds(hardware);
    })
  }
  var updateLeds = function (hardware) {
    // stepsBmp = makeAnimationBitmap({x:2,y:2},animf);


    var altMaps = [];
    var n = 0;
    for (var alt of controlledModule.alterations) {
      if (alt < -1) {
        altMaps[0] |= 1 << n;
      } else if (alt < 0) {
        altMaps[1] |= 1 << n;
      } else if (alt == 0) {
        altMaps[2] |= 1 << n;
      } else if (alt > 0) {
        altMaps[3] |= 1 << n;
      } else if (alt < 1) {
        altMaps[4] |= 1 << n;
      }
      n++;
    }
    var c = 0;
    var colors = [[0, 0, 0], [60, 60, 60], [120, 120, 120], [180, 180, 0], [240, 240, 0]];
    for (var map of altMaps) {
      map |= map << 12;
      // map|=0xFFFF;
      hardware.drawColor([map, map >> 8], colors[c]);
      c++;
    }
    if (editMode) {
      var selectBmp = 1 << selectedAlteration;
      var selectValue = controlledModule.alterations[selectedAlteration % 12];
      var m = selectValue * 32;
      var selectColor = [127, 127 + m, 255];
      if (!selectColor) selectColor = colors[0]
      selectBmp |= selectBmp << 12;
      selectBmp &= 0xFFFF;
      hardware.drawColor([selectBmp, selectBmp >> 8], selectColor);
    } else {
    }

  }
  // setInterval(function(){
  //   engagedHardwares.forEach(function(hardware){
  //     updateLeds(hardware);
  //   })
  // }, 700);
}