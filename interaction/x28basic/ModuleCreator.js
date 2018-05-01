'use strict';
var panton = require('./panton');
/**
 *Tiny pseudo-interactor that is used to choose what module to isntantiate when we press on an empty slot of the "patchboard" (i.e. button that is not lid)
 */
function ModuleCreator(myHardware,environment) {
  var possibleModules = [];
  var possibleModulesBitmap = 0;
  var possibleModuleConstructors={};
  var colors=[];
  var moduleToCreateOnDisengage = false;
  var lastMatrixButton = false;
  this.invokerButton = 0;
  var modules=environment.modules;
  this.engaged = false;
  var self=this;
  function updatePossibleModulesList() {
    possibleModuleConstructors = environment.modules.getRegistered();
    possibleModules = Object.keys(possibleModuleConstructors);
    possibleModulesBitmap = ~(0xffff << possibleModules.length);
    for(var mnum in possibleModules){
      var mname=possibleModules[mnum];
      var iscolor=possibleModuleConstructors[mname].color;
      console.log(mname,"module color",iscolor);
      if(!iscolor){
        iscolor=[25,25,25];
      }
      colors[mnum]=iscolor;
    }
  }

  function updateHardware() {
    myHardware.sendScreenA("create module");
    var head = 0;
    myHardware.draw([possibleModulesBitmap | head, 0 | head, possibleModulesBitmap | head]);
    paintModuleColors();
    if (lastMatrixButton) head = 1 << lastMatrixButton;
  }
  function paintModuleColors(){
    let lowLight=environment.vars.light;
    for (let button = 0; button<16; button++) {
      var color=colors[button]
      if(color){
        var posBmp=1<<button;

        color=panton.homogenize(color,button===lastMatrixButton?lowLight*5/3:lowLight*2/3);
        myHardware.drawColor(posBmp,color);
      }
    }
  }
  this.engage = function(event,buttonLoc) {
    if (possibleModules.length == 0) updatePossibleModulesList();
    updateHardware();
    self.invokerButton=buttonLoc;
    self.engaged = true;
  }
  this.disengage = function() {
    var ret = moduleToCreateOnDisengage;
    self.engaged = false;
    return ret;
  }
  this.matrixButtonPressed = function(evt) {
    lastMatrixButton = evt.button;
    if (evt.data[0] < possibleModules.length) {
      moduleToCreateOnDisengage = possibleModules[evt.data[0]];
      myHardware.sendScreenA("Release to create");
      myHardware.sendScreenB("+" + moduleToCreateOnDisengage);
    } else {
      moduleToCreateOnDisengage = false;
      this.disengage();
    }
    updateHardware();
  }
  this.matrixButtonReleased = function(evt) {}
}
module.exports=ModuleCreator;