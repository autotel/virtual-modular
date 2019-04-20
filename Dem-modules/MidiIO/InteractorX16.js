"use strict";
var EventMessage = require('../../src/datatypes/EventMessage');
var getHeaderName = {
  0x03: "abs.clock",
  0x00: "clock tick",
  0x01: "on/start",
  0x02: "off/stop"
};

//TODO: this stuff should be provided by the environment
var base = require('../../src/interaction/x16basic/interactorBase.js');
var RecordMenu = require('../../src/modules/x28utils/RecordMenu');// interaction / x28utils / RecordMenu.js

/**
definition of a monoSequencer interactor for the x16basic controller hardware
*/
module.exports = function(controlledModule,environment) {
  base.call(this);
  /**
  plan for the midi io module:
  you can select each one of the outputs, and then select a filter function that dictates what midi input events are routed to each output.
  -should midi input be mapped to their corresponfing EventMessages according to my internal standard?
  */
  var selectedOutputNumber = false;
  var selectedInputNumber = false;
  var engagedHardwares = new Set();
  var selectedDeviceNumber=0;
  this.name = controlledModule.name;
  var chokeMode = false;
  var selectDeviceMode=false;
  var midiInputCache = controlledModule.midiInputCache;
  //updated on updateLeds
  var indexedMidiInputCache = [];
  var inputMode = true;

  var lastEngagedConfigurator=false;
  var engagedConfigurator=false;
  var configurators={};
  configurators.record = new RecordMenu(this, {
    environment: environment,
    controlledModule: controlledModule
  });
  // controlledModule.on('midiin',function(event){
  //
  // });
  //this because on midi in could become too frequent
  // setInterval(function(){
  //   for(var hardware of engagedHardwares){
  //     updateHardware(hardware);
  //   }
  // },30);
  this.matrixButtonPressed = function(event) {
    if (inputMode) {
      if (event.button < indexedMidiInputCache.length) {
        // console.log(selectedInputNumber,"kll");
        selectedInputNumber = event.button;
        indexedMidiInputCache[selectedInputNumber].enabled = (indexedMidiInputCache[selectedInputNumber].enabled == false);
      } else {
        // console.log(midiInputCache,midiInputCache.length);
      }
    } else {
      if (event.button < controlledModule.outputs.size)
        selectedOutputNumber = event.button;
    }
    updateHardware(event.hardware);
  };
  this.matrixButtonReleased = function(event) {};
  this.matrixButtonHold = function(event) {};
  this.selectorButtonPressed = function(event) {
    if (event.button == 2) {
      selectDeviceMode = true;
      updateHardware(event.hardware);
    }
    if (event.button == 0) {
      inputMode = false;
      updateHardware(event.hardware);
    }
    if (event.button == 1) {
      chokeMode = true;
      controlledModule.choke();
      updateHardware(event.hardware);
    }
    if (event.button >= 8) {
      lastEngagedConfigurator = engagedConfigurator = configurators.record;
    }
    if (engagedConfigurator) engagedConfigurator.engage(event);
  };
  this.selectorButtonReleased = function(event) {
    if (engagedConfigurator) {
      engagedConfigurator.disengage(event);
      engagedConfigurator = false;
    }
    if (event.button == 2) {
      selectDeviceMode = false;
      updateHardware(event.hardware);
    }
    if (event.button == 0) {
      inputMode = true;
      updateHardware(event.hardware);
    }
    if (event.button == 1) {
      chokeMode = false;

    }
  };
  this.outsideScroll = function(event) {
    var ret = "choke ";
    if (controlledModule.choke()) {
      ret += "hanging";
    } else {
      ret += "scan";
    };
    return ret;
  };
  var possibleDevices=[];
  this.encoderScrolled = function(event) {
    if(selectDeviceMode){
      possibleDevices=controlledModule.getPossibleInterfaces();
      selectedDeviceNumber+=event.delta;
      if(selectedDeviceNumber<0) selectedDeviceNumber=possibleDevices.length;
      if(selectedDeviceNumber>=possibleDevices.length)selectedDeviceNumber=0;
      event.hardware.sendScreenB(possibleDevices[selectedDeviceNumber].name);
    }
  };
  this.encoderPressed = function(event) {};
  this.encoderReleased = function(event) {};
  this.engage = function(event) {
    engagedHardwares.add(event.hardware);
    updateHardware(event.hardware);
  };
  this.disengage = function(event) {
    engagedHardwares.delete(event.hardware);
  }
  configurators.record.autoEngageWindow();
  var updateHardware = function(hardware) {
    updateScreen(hardware);
    updateLeds(hardware);
  }
  var updateScreen = function(hardware) {
    hardware.sendScreenA("Midi IO");
    if (chokeMode) {
      hardware.sendScreenA("Choke");
    } else if (inputMode) {
      hardware.sendScreenA("Inputs");
      // hardware.sendScreenB(JSON.stringify(event.eventMessage.value));
      // try{
      if (selectedInputNumber !== false) {
        var outputCache = indexedMidiInputCache[selectedInputNumber];
        var state = outputCache.enabled;
        var name = getHeaderName[outputCache.outputMessage.value[0]] || "h." + outputCache.outputMessage.value[0];
        hardware.sendScreenB(name + " " + (state ? "on" : "off"));
      }
      // }catch(e){
      // console.log("no",selectedInputNumber,indexedMidiInputCache);
      // }
    } if(selectDeviceMode){
      hardware.sendScreenA("S.device<release");
      hardware.sendScreenB(controlledModule.deviceName);
      controlledModule.setMidi(possibleDevices[selectedDeviceNumber]);
    }else {
      hardware.sendScreenA("Outputs");
      if (controlledModule.outputs.size <= selectedOutputNumber) selectedOutputNumber = false;
      if (selectedOutputNumber !== false) {
        hardware.sendScreenB(Array.from(controlledModule.outputs)[selectedOutputNumber].name);
      } else {
        hardware.sendScreenB("");
      }
    }
  }
  var updateLeds = function(hardware) {
    if (inputMode) {
      var enabledBitmap = 0;
      // var disabledBitmap=0;
      var selectedBitmap = (selectedInputNumber !== false ? (1 << selectedInputNumber) : 0);
      var nn = 0;
      controlledModule.eachMidiMapping(function() {
        if (this.enabled) {
          enabledBitmap |= 1 << nn;
        } else {
          // disabledBitmap|=1<<index;
        }
        indexedMidiInputCache[nn] = (this);
        // console.log(this.name,this.outputMessage.value);
        nn++;
      });
      var avalInputsBmp = ~(0xFFFF << indexedMidiInputCache.length);
      hardware.draw([avalInputsBmp, enabledBitmap, enabledBitmap]);
    } else {
      var avalOutputsBmp = ~(0xFFFF << controlledModule.outputs.size);
      var selectedBitmap = (selectedOutputNumber !== false ? (1 << selectedOutputNumber) : 0);
      hardware.draw([selectedBitmap, avalOutputsBmp, avalOutputsBmp]);

    }
  }
}
