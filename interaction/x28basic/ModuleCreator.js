
/**
 *Tiny pseudo-interactor that is used to choose what module to isntantiate when we press on an empty slot of the "patchboard" (i.e. button that is not lid)
 */
function ModuleCreator(myHardware,environment) {
  var possibleModules = [];
  var possibleModulesBitmap = 0;
  var moduleToCreateOnDisengage = false;
  var lastMatrixButton = false;
  this.invokerButton = 0;
  var modules=environment.modules;
  this.engaged = false;
  var self=this;
  function updatePossibleModulesList() {
    possibleModules = environment.modules.getRegistered();
    possibleModulesBitmap = ~(0xffff << possibleModules.length);
  }

  function updateHardware() {
    myHardware.sendScreenA("create module");
    var head = 0;
    if (lastMatrixButton) head = 1 << lastMatrixButton;
    myHardware.draw([possibleModulesBitmap | head, 0 | head, possibleModulesBitmap | head]);
  }
  this.engage = function(event) {
    if (possibleModules.length == 0) updatePossibleModulesList();
    updateHardware();
    self.invokerButton=event.button;
    self.engaged = true;
  }
  this.disengage = function() {
    var ret = moduleToCreateOnDisengage;
    self.engaged = false;
    return ret;
  }
  this.matrixButtonPressed = function(evt) {
    if (evt.data[0] < possibleModules.length) {
      lastMatrixButton = evt.data[0];
      moduleToCreateOnDisengage = possibleModules[evt.data[0]];
      myHardware.sendScreenA("Release to create");
      myHardware.sendScreenB("+" + moduleToCreateOnDisengage);
    } else {
      moduleToCreateOnDisengage = false;
      this.disengage();
    }
  }
  this.matrixButtonReleased = function(evt) {}
}
module.exports=ModuleCreator;