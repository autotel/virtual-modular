"use strict";
var RARROW = String.fromCharCode(126);
/**
Definition of hardware specific translations of hardware events into internal events
things such as "when the user press a button" become "view the sequencer user interface"

A superInteractor defines the main context for the interactors of the specific hardware. A superinteractor is the entry point to any of the other interfaces. For instance, if somebody created a hardware that is designed only for one specific module, the superinteractor would be in charge of routing the compatible module to that hardware device. If the module is supposed to be able to create and route modules (like in this case), a superinteractor defines the user interaction patterns of how the modules are created; and how one switches between interface.
*/
module.exports = {};
var onHandlers = require("onhandlers");
var patchingMenu = require("./patchingMenu");

var moduleInterfaces = [];
/**
 * @constructor
 * singleton
 * @param {environment} input to pass the environment. Needed to access the modulesMan, for things such as adding modules, jumping to modules, etc.
 */
var X16SuperInteractorsSingleton = function(environment) {
  /**check compatibility of a certain interactor*/
  var compatibilityTags = ["x28v0"];
  var compatible = function(tagSet) {
    for (var tag of tagSet) {
      if (compatibilityTags.indexOf(tag) != -1) {
        return true;
      }
    }
    return false;
  }
  /**
  affects all the X16SuperInteractor. Depending on how much sense it makes, there could be a function that adds an interactor only to a certain hardware instance.
  */
  this.appendModuleInteractor = function(what) {
    // console.log("APPM",what.name);
    if (what.type == "interactor") {
      if (compatible(what.compatibilityTags)) {
        moduleInterfaces.push(what);
      }
    } else {
      throw "tried to add an object to a SuperInteractor that is not an interactor";
    }
  }
  /** get the list of interactors @return array*/
  this.getModuleInteractors = function() {
    return moduleInterfaces;
  }
  /**
   *Tiny pseudo-interactor that is used to choose what module to isntantiate when we press on an empty slot of the "patchboard" (i.e. button that is not lid)
   */
  function ModuleCreator(myHardware) {
    var possibleModules = [];
    var possibleModulesBitmap = 0;
    var moduleToCreateOnDisengage = false;
    var lastMatrixButton = false;
    this.engaged = false;

    function updatePossibleModulesList() {
      possibleModules = Object.keys(environment.modulesMan.modulePrototypesList);
      possibleModulesBitmap = ~(0xffff << possibleModules.length);
    }

    function updateHardware() {
      myHardware.sendScreenA("create module");
      var head = 0;
      if (lastMatrixButton) head = 1 << lastMatrixButton;
      myHardware.draw([possibleModulesBitmap | head, 0 | head, possibleModulesBitmap | head]);
    }
    this.engage = function() {
      if (possibleModules.length == 0) updatePossibleModulesList();
      updateHardware();
      this.engaged = true;
    }
    this.disengage = function() {
      var ret = false;
      this.engaged = false;
      if (moduleToCreateOnDisengage) {
        var defaultProps = {};
        environment.modulesMan.addModule(moduleToCreateOnDisengage, defaultProps);
        ret = moduleInterfaces[moduleInterfaces.length - 1];
      }
      return ret;
    }
    this.matrixButtonPressed = function(evt) {
      /*if(evt.data[0]===lastMatrixButton){ deprecated create module on second tap.
        this.disengage();
      }else */
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

  /**
   * @constructor
   * Super interactor instance: one per connected ui. hardware
   * X16SuperInteractor a {@link superInteractor} prototype for x16basic {@link HardwareDriver}.
   * @param {x16Hardware}
   * @returns {undefined} no return
   */
  this.SuperInteractor = function(myHardware) {
    /** @private @var engagedInterface stores the module that is currently engaged, the interaction events are forwarded to the {@link moduleInterface} that is referenced here*/
    var engagedInterface = false;

    var muteMode = false;
    var deleteMode = false;
    /** @private @var selectedInterface stores the {@link moduleInterface} that will become engaged once the patching button is released / the superInteractor disengaged.
    selectedInterface is also subject to patching
    */
    var selectedInterface = false;
    var thisInteractor = this;
    /** store what are the modules over which a button was pressed
    this allows to switch to another module and still detect the
    release in the module where the button was pressed. Furthermore,
    if we are using some sort of expression out of the pressure sensing,
    we can assign it to the module where it was pressed
    @private @var matrixButtonOwners={};
    @private @var selectorButtonOwners={};
    */
    var matrixButtonOwners = {};
    var selectorButtonOwners = {};
    //for the matrix button pressed event, it indicates if this is the only matrix button that is pressed or not (allows selecting a module's outputs)
    var firstPressedMatrixButton = false;
    onHandlers.call(this);
    var myModuleCreator = new ModuleCreator(myHardware);
    this.on('interaction', function(event) {
      // console.log("28 int");
      if (engagedInterface) {
        engagedInterface.handle('interaction', event);
      }
    });
    // this.on('interaction',console.log);
    environment.on('module created', function(evt) {
      if (!(engagedInterface || myModuleCreator.engaged)) {
        updateHardware();
      }
    });
    this.on('matrixButtonPressed', function(event) {
      if (myModuleCreator.engaged) {
        myModuleCreator.matrixButtonPressed(event);
      } else if (!engagedInterface) {
        if (firstPressedMatrixButton === false) {
          selectedInterface = moduleInterfaces[event.data[0]];
          firstPressedMatrixButton = event.data[0];
          updateHardware();
        } else {
          if (selectedInterface && moduleInterfaces[event.data[0]]) try {
            var connected = selectedInterface.controlledModule.toggleOutput(moduleInterfaces[event.data[0]].controlledModule);
            myHardware.sendScreenB((connected ? RARROW : "X") + moduleInterfaces[event.data[0]].controlledModule.name);
          } catch (e) {
            console.error(e);
            myHardware.sendScreenB("X");
          }
          updateLeds();
        }
        if (!selectedInterface) {
          selectedInterface = false;
          if (event.data[0] == moduleInterfaces.length) myModuleCreator.engage();
          if(deleteMode || muteMode){
            deleteMode=muteMode=false;
          }
        }else{
          if(muteMode){
            selectedInterface.controlledModule.mute=(false==selectedInterface.controlledModule.mute);

          }else if(deleteMode){
            if(selectedInterface.controlledModule.remove()){
              moduleInterfaces.splice(event.button,1);
              selectedInterface=false;
            }
          }else{
          }
          updateLeds();
        }
      } else {
        engagedInterface.matrixButtonPressed(event);
        matrixButtonOwners[event.data[0]] = engagedInterface;
      }

    });
    this.on('matrixButtonReleased', function(event) {
      if (firstPressedMatrixButton === event.data[0]) {
        firstPressedMatrixButton = false;
      }
      // event.button=event.data[0];
      if (matrixButtonOwners[event.data[0]]) {
        matrixButtonOwners[event.data[0]].matrixButtonReleased(event);
        delete matrixButtonOwners[event.data[0]];
      } else {}
    });
    this.on('matrixButtonHold', function(event) {
      //  event.button=event.data[0];
      if (matrixButtonOwners[event.data[0]]) {
        matrixButtonOwners[event.data[0]].matrixButtonHold(event);
      } else {}
    });
    this.on('bottomButtonPressed', function(event) {
      if (engagedInterface) {
        // engagedInterface.disengage(event);
        // console.log(engagedInterface.controlledModule.outputs[event.data[0]-8]);
        // engagedInterface.controlledModule.inputs[event.data[0]].engage();
      }
    });
    this.on('bottomButtonReleased', function(event) {
      if (engagedInterface) {
        // engagedInterface.controlledModule.outputs[event.data[0]-8].disengage();
        // engagedInterface.engage(event);
      }
    });
    this.on('selectorButtonPressed', function(event) {
      //if the button is the patchMenu button}
      //  console.log(event.button);
      if (event.button == 7) {
        if (engagedInterface) {
          engagedInterface.disengage(event);
          thisInteractor.engage();
        }
      } else {
        //  event.button=event.data[0];
        if (engagedInterface) {
          engagedInterface.selectorButtonPressed(event);
          selectorButtonOwners[event.data[0]] = engagedInterface;
        } else {
          if (event.button == 6) {
            // deleteMode=!deleteMode;
            deleteMode=true;
            // console.log("DEL",deleteMode);
            // console.log("DEL");
            updateHardware();
          } else if (event.button == 5) {
            // muteMode=!muteMode;
            muteMode=true;
            // console.log("DEL");
            updateHardware();
          } else{
            thisInteractor.engage(event);
          }
        }
      }
    });
    this.on('selectorButtonReleased', function(event) {
      // event.button=event.data[0];
      if (selectorButtonOwners[event.data[0]]) {
        selectorButtonOwners[event.data[0]].selectorButtonReleased(event);
        delete selectorButtonOwners[event.data[0]];
      } else {
        if(deleteMode || muteMode){
          if(event.button==6||event.button==5){
            deleteMode=false;
            muteMode=false;
            
          }
        }else{
          var newCreated = false;
          if (myModuleCreator.engaged) newCreated = myModuleCreator.disengage();
          if (newCreated) selectedInterface = newCreated;
          if (selectedInterface) {
            engagedInterface = selectedInterface;
            // console.log("engaged",engagedInterface);
            selectedInterface.engage(event);
          }
        }
        updateHardware();
      }
    });
    this.on('encoderPressed', function(event) {
      if (!engagedInterface) {} else {
        engagedInterface.encoderPressed(event);
      }
    });
    this.on('encoderReleased', function(event) {
      if (!engagedInterface) {} else {
        engagedInterface.encoderReleased(event);
      }
    });
    this.on('encoderScrolled', function(event) {
      if (!engagedInterface) {} else {
        engagedInterface.encoderScrolled(event);
      }
    });
    this.engage = function(evt) {
      paintSelectButtons();
      updateHardware();
      engagedInterface = false;
    }

    function updateHardware() {
      if(muteMode){
        myHardware.sendScreenA("Mute module");
      }else if(deleteMode){
        myHardware.sendScreenA("Delete module!");
      }else{
        myHardware.sendScreenA("Select module");
      }
      myHardware.sendScreenB((selectedInterface ? selectedInterface.name : "none") + "");
      updateLeds();
    }

    function updateLeds() {
      var outputsBmp = 0;
      var mutedBitmap=0;
      for(let a in moduleInterfaces){
        let amodule=moduleInterfaces[a];
        if(amodule.controlledModule.mute) mutedBitmap|=1<<a;
      }
      if (selectedInterface) {
        //displaying the selected module output is rather awkward:
        //for each output of the module that the interface controls
        // console.log(selectedInterface.controlledModule.outputs)
        for (var siOpts of selectedInterface.controlledModule.outputs) {
          //we add a bit to the array position of the interactor that iterated output module has
          outputsBmp |= 1 << moduleInterfaces.indexOf(siOpts.interactor);
        }
      }

      var creatorBtn = 1 << moduleInterfaces.length;
      var selectable = ~(0xffff << moduleInterfaces.length);
      var selected = 1 << moduleInterfaces.indexOf(selectedInterface);
      //selected module is white
      //outputs of selected modules are red
      //selectable modules are blue
      //perhaps I could make inputs green?
      myHardware.draw([(selected | outputsBmp)^mutedBitmap, (selected | creatorBtn), (selected | (selectable ^ outputsBmp)) | creatorBtn]);
    }

    function paintSelectButtons() {
      myHardware.drawSelectors([0xf6f, 0xf2f, 0xf8f]);
    }
    this.disengage = function() {
      console.log(this);
      throw "oops superInteractor must never disengage";
      engagedInterface = 0;
    }
  }
};

module.exports = X16SuperInteractorsSingleton;