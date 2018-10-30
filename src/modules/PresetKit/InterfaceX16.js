"use strict";
var EventMessage = require('../../datatypes/EventMessage.js');
var EventConfigurator = require('../x16utils/EventConfigurator.js');
var BlankConfigurator = require('../x16utils/BlankConfigurator.js');
var RecordMenu = require('../x28utils/RecordMenu.js');

var base = require('../../interaction/x16basic/interactorBase.js');
var SQUARE = String.fromCharCode(252);



/**
definition of a presetkit interactor for the x16basic controller hardware
*/
module.exports = function(controlledModule, environment) {
  base.call(this);
  var engagedHardwares = new Set();
  var self=this;
  var engagedConfigurator = false;
  var configurators = this.configurators = {};
  var muteBmp = 0;
  var muteMode = false;
  var muteAction = function(button) {
    var muted = controlledModule.togglePresetMute(button);
    (muted ? muteBmp |= 1 << button : muteBmp &= ~(1 << button));
  }
  configurators.event = new EventConfigurator(this);
  configurators.record = new RecordMenu(this, {
    environment: environment,
    controlledModule: controlledModule
  });
  configurators.global = new BlankConfigurator(this, {
    name: "",
    vars: {
      "auto map": {
        value: 0,
        list: [false, 1, 2, 3]
      },"use velocity": {
        value: false,
      }
    }
  });
  var usingVelocity=configurators.global.vars["use velocity"];
  configurators.global.vars["auto map"].selectFunction = function(thisVar) {
    thisVar.value=thisVar.list.indexOf(controlledModule.autoMap);
  };
  configurators.global.vars["auto map"].changeFunction = function(thisVar, delta) {
    // if(isNaN(thisVar.value)) thisVar.value=0;
    thisVar.value += delta;
    thisVar.value %= thisVar.list.length;
    controlledModule.autoMap = thisVar.list[thisVar.value];
  };

  configurators.global.vars["auto map"].nameFunction = function(thisVar) {
    if(controlledModule.kit[0].value[0]==EventMessage.headers.triggerOn){
      switch (thisVar.value) {
        case 0:
          return "off";
        case 1:
          return "1 (note)";
        case 2:
          return "2 (timbre)";
        case 3:
          return "3 (velo)";
        default: console.log("invalid var:",thisVar); return "?";
      }
    }else{
      switch (thisVar.value) {
        case 0:
          return "off";
        case 1:
          return num+thisVar.value;
        default: console.log("invalid var:", thisVar); return "?";
      }
    }
  };

  var muteMode = false;

  var lastEngagedConfigurator = configurators.event;

  var availablePresetsBitmap = 0;
  var highlightedBitmap = 0;
  var selectedPresetNumbers = [];

  function eachSelectedPresetNumber(cb) {
    selectedPresetNumbers.map(cb);
  }

  function lastSelectedPresetNumber(cb) {
    cb(selectedPresetNumbers[selectedPresetNumbers.length - 1], selectedPresetNumbers.length - 1);
  }
  controlledModule.on('extrigger', function(event) {
    highlightedBitmap |= 1 << event.preset;
    setTimeout(function() {
      var num = event.preset;
      highlightedBitmap &= ~(1 << num);
    }, 500);
  });

  setInterval(function() {
    passiveUpdateLeds();
  }, 1000 / 20);

  controlledModule.on('kitchanged', function() {
    updateAvailablePresetsBitmap();
  });

  this.matrixButtonVelocity = function(event) {
    //the if prevents retrigger the first time
    if(usingVelocity.value && !engagedConfigurator){
      // console.log(event);
      controlledModule.uiTriggerOn(event.data[0],event.data[1]/2);
    }
  };
  var pressedMatrixButtons=new Set();
  this.matrixButtonPressed = function(event) {
    var hardware = event.hardware;
    if (muteMode) {
      muteAction(event.button);
      updateLeds(hardware);
    } else if (engagedConfigurator) {
      var eventResponse=engagedConfigurator.matrixButtonPressed(event);
      if (engagedConfigurator == configurators.util) {
        updateLeds(hardware);
      } else {
        // engagedConfigurator.matrixButtonPressed(event);
      }
      if(eventResponse)if(eventResponse.presetSelected){
        if(controlledModule.autoMap!==false){
          controlledModule.kit[0] = configurators.event.getEventMessage();
        }else{
          eachSelectedPresetNumber(function(selectedPresetNumber) {
            controlledModule.kit[selectedPresetNumber] = configurators.event.getEventMessage();
          });
        }
      }
    } else {

      if (event.tied) {
        selectedPresetNumbers.push(event.button);
      } else {
        selectedPresetNumbers = [event.button];
      }
      if(!usingVelocity.value){
        controlledModule.uiTriggerOn(event.button);
      }
      pressedMatrixButtons.add(event.button);
      if(controlledModule.autoMap!==false){
        if (controlledModule.kit[0])
          configurators.event.setFromEventMessage(controlledModule.kit[0], hardware);
      }else if (controlledModule.kit[event.button])
        if (lastEngagedConfigurator == configurators.event) {
          // configurators.event.baseEvent=controlledModule.kit[selectedPresetNumber].on;
          lastSelectedPresetNumber(function(selectedPresetNumber) {
            configurators.event.setFromEventMessage(controlledModule.kit[selectedPresetNumber], hardware);
          });
        }
      updateHardware(hardware);
    }
  };

  this.matrixButtonReleased = function(event) {
    pressedMatrixButtons.delete(event.button);

    if (engagedConfigurator) {
      engagedConfigurator.matrixButtonReleased(event);
    } else {
      controlledModule.uiTriggerOff(event.button);
    }
  };

  this.matrixButtonHold = function(event) {
    if (engagedConfigurator) {
      engagedConfigurator.matrixButtonHold(event);
    } else {}
  };
  this.selectorButtonPressed = function(event) {
    if (engagedConfigurator) {
      engagedConfigurator.selectorButtonPressed(event);
    } else {
      if (event.button == 1) {
        lastEngagedConfigurator = engagedConfigurator = configurators.event;
      } else if (event.button == 2) {
        lastEngagedConfigurator = engagedConfigurator = configurators.global;

      } else if (event.button == 0 || event.button == 3) { //0 is used in x28 and 3 in x16
        muteMode = !muteMode;
        event.hardware.sendScreenA("mute");
      } else if (event.button >= 8) {
        lastEngagedConfigurator = engagedConfigurator = configurators.record;
      }
      if (engagedConfigurator) engagedConfigurator.engage(event);
    }
  };
  this.selectorButtonReleased = function(event) {
    if (engagedConfigurator) {
      engagedConfigurator.disengage(event);
      engagedConfigurator = false;
    } else {}
    muteMode = false;
    updateHardware(event.hardware);
  };
  var updateAvailablePresetsBitmap = function() {
    availablePresetsBitmap = 0;
    for (var a in controlledModule.kit) {
      availablePresetsBitmap |= 1 << a;
    }
  }
  this.encoderScrolled = function(event) {
    
    
    if (engagedConfigurator) {
      engagedConfigurator.encoderScrolled(event);
    } else {
      let configuratorResponse = lastEngagedConfigurator.encoderScrolled(event);
      if (lastEngagedConfigurator==configurators.event) {
        if (configuratorResponse) {
          if(controlledModule.autoMap!==false){
            if (!controlledModule.kit[0]) {
              controlledModule.kit[0] = configurators.event.getEventMessage();
            }
            controlledModule.kit[0].value[configuratorResponse.selectedValueNumber] = configuratorResponse.selectedValueValue;
          }else{
            eachSelectedPresetNumber(function(selectedPresetNumber) {
              if (!controlledModule.kit[selectedPresetNumber]) {
                controlledModule.kit[selectedPresetNumber] = configurators.event.getEventMessage();
              }
              controlledModule.kit[selectedPresetNumber].value[configuratorResponse.selectedValueNumber] = configuratorResponse.selectedValueValue;
            });
          }
          updateAvailablePresetsBitmap();
        };
      }
    }
    
    pressedMatrixButtons.forEach(function (itm) {
      console.log("active change, button", itm);
      controlledModule.uiTriggerOn(itm);
    });

    updateHardware(event.hardware);
  };
  let outsideScrollHeader = 0;
  let outsideScrollMutingUp = true;
  this.outsideScroll = function(event) {
    let delta = event.delta;
    let kit = controlledModule.kit;

    // console.log(outsideScrollHeader);

    kit[outsideScrollHeader].mute = (outsideScrollMutingUp ? (delta > 0) : (delta < 0));
    // console.log(`(${outsideScrollMutingUp}?(${delta>0}):(${delta<0}))=${(outsideScrollMutingUp?(delta>0):(delta<0))}`);

    if (kit[outsideScrollHeader].mute) {
      muteBmp |= 1 << outsideScrollHeader;
    } else {
      muteBmp &= ~(1 << outsideScrollHeader);
    }

    outsideScrollHeader += delta;
    if (outsideScrollHeader >= 16) {
      outsideScrollMutingUp = !outsideScrollMutingUp;
      outsideScrollHeader = 0;
    }
    if (outsideScrollHeader < 0) {
      outsideScrollMutingUp = !outsideScrollMutingUp;
      outsideScrollHeader = 15;
    }
    let ret = "";
    for (let a = 0; a < 16; a++) {
      ret += (kit[a].mute ? " " : SQUARE)
    }

    return (ret);
  }
  this.encoderPressed = function(event) {
    if (engagedConfigurator) {
      engagedConfigurator.encoderPressed(event);
    } else {}
  };
  this.encoderReleased = function(event) {
    if (engagedConfigurator) {
      engagedConfigurator.encoderReleased(event);
    } else {}
  };
  this.engage = function(event) {
    engagedHardwares.add(event.hardware);
    updateHardware(event.hardware);
  };
  this.disengage = function(event) {
    outsideScrollHeader = 0;
    engagedHardwares.delete(event.hardware);
  }
  configurators.record.autoEngageWindow();
  var updateHardware = function(hardware) {
    hardware.sendScreenA(controlledModule.name);
    updateLeds(hardware);
  }

  function passiveUpdateLeds() {
    if (!engagedConfigurator)
      for (let hardware of engagedHardwares) {
        updateLeds(hardware);
      }
  }
  var updateLeds = function(hardware) {
    var selectedPresetBitmap = 0;
    eachSelectedPresetNumber(function(selectedPresetNumber) {
      selectedPresetBitmap |= 1 << selectedPresetNumber;
    });
    hardware.draw([
      highlightedBitmap | selectedPresetBitmap,
      (highlightedBitmap | selectedPresetBitmap | availablePresetsBitmap) ^ muteBmp,
      selectedPresetBitmap | availablePresetsBitmap
    ]);
  }
}
