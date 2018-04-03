'use strict'
var MyInteractorBase = require('../../interaction/x16basic/interactorBase.js');
/**
user interface pattern that allows to tweak parameters
@param {interactor} parentInteractor the module interactor that posesses this
@param {Object} properties {values:{@link array}(deep copy),name:{@link String},varNames:{@link Array} (shallow copy)},
@param {Object} vars the tree of variables that one wants to assign to this controller. The tree is shallow-copied, and each var value is not in the var directly, but in the var.value, otherwise the reference would be lost (same way as in tween.js). This also allows to attach additional parameters such as "onValueChange" function and the so
*/

var RecordMenu = function(parentInteractor, properties) {
  var self=this;
  if (!properties.environment) throw "RecordMenu needs you to pass the environment in the properties";
  if (!properties.controlledModule) throw "RecordMenu needs you to pass the controlledModule in the properties";
  var environment = properties.environment;
  var controlledModule = properties.controlledModule;
  var modules = environment.modules.list;
  var recordingOuptutsBitmap = 0;

  if (properties === undefined) properties = {};
  MyInteractorBase.call(this);
  this.name = "Rec";
  var thisInteractor = this;
  if (properties.name) this.name = properties.name;
  var selectedModuleNumber = 0;
  var engagedHardwares = new Set();

  if (properties.values) {
    this.vars = properties.values;
  }
  // watchvarNames();

  var limitOptions=function(){
    modules=[];
    for(var tmodule of environment.modules.list){
      if(tmodule.outputs.has(controlledModule)){
        modules.push(tmodule);
      }
    }

  }

  var valueChanged = function() {
    //value can change while not engaged
    for (let hardware of engagedHardwares) {
      updateLeds(hardware);
    }
  }
  var updateLeds = function(hardware) {
    var eventLengthBmp = ~(0xFFFF << modules.length);

    hardware.draw([
      recordingOuptutsBitmap | eventLengthBmp,
      eventLengthBmp ^ recordingOuptutsBitmap,
      eventLengthBmp ^ recordingOuptutsBitmap
    ]);

    hardware.drawLowerSelectorButtonsColor(eventLengthBmp,[0,32,32],false);
    hardware.drawLowerSelectorButtonsColor(recordingOuptutsBitmap,[255,0,0]);
  }
  var updateScreen = function(hardware) {
    if (modules[selectedModuleNumber]) {
      hardware.sendScreenA("Rec dest");
      hardware.sendScreenB(">" + modules[selectedModuleNumber].name);
    }
  }
  this.windowButtonPressed=function(button){
    if (button < modules.length) {
      selectedModuleNumber = button;
      if (controlledModule.toggleRecordOutput(modules[selectedModuleNumber])) {
        recordingOuptutsBitmap |= 1 << selectedModuleNumber;
      } else {
        recordingOuptutsBitmap &= ~(1 << selectedModuleNumber);
      }
    }
  }
  this.matrixButtonPressed = function(event) {
    var hardware = event.hardware;
    self.windowButtonPressed(event.button);

    updateLeds(hardware);
    updateScreen(hardware);
  };
  this.matrixButtonReleased = function(event) {
    var hardware = event.hardware;
  };
  this.selectorButtonPressed = function(event) {
    var hardware = event.hardware;
  };
  this.selectorButtonReleased = function(event) {
    var hardware = event.hardware;
  };
  this.encoderScrolled = function(event) {
    // var hardware=event.hardware;
    // if(thisInteractor.vars.length>selectedModuleNumber){
    //   thisInteractor.vars[selectedModuleNumber].value+=event.data[1];
    //   updateScreen(hardware);
    // }
  };
  this.encoderPressed = function(event) {
    var hardware = event.hardware;
  };
  this.encoderReleased = function(event) {
    var hardware = event.hardware;
  };
  this.redraw = function(hardware){
    updateLeds(hardware);
  }
  this.engage = function(event) {
    if(!environment.vars.advancedRecording) limitOptions();

    if(event.button>=8){
      self.windowButtonPressed(event.button-8);
      updateLeds(event.hardware);
      updateScreen(event.hardware);
    }

    var hardware = event.hardware;
    engagedHardwares.add(hardware);
    updateLeds(hardware);
    updateScreen(hardware);
  };
  this.disengage = function(event) {
    var hardware = event.hardware;
    engagedHardwares.delete(hardware);
  }
};
module.exports = RecordMenu;