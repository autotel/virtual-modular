"use strict";
var RARROW = String.fromCharCode(126);
/**
Definition of hardware specific translations of hardware events into internal events
things such as "when the user press a button" become "view the sequencer user interface"

A superInteractor defines the main context for the interactors of the specific hardware. A superinteractor is the entry point to any of the other interfaces. For instance, if somebody created a hardware that is designed only for one specific module, the superinteractor would be in charge of routing the compatible module to that hardware device. If the module is supposed to be able to create and route modules (like in this case), a superinteractor defines the user interaction patterns of how the modules are created; and how one switches between interface.
*/
module.exports = {};
var onHandlers = require("onhandlers");
var ModuleCreator = require('./ModuleCreator');

/**
 * @constructor
 * singleton
 * @param {environment} input to pass the environment. Needed to access the modulesMan, for things such as adding modules, jumping to modules, etc.
 */
var SuperInteractorsSingleton = function(environment) {
  /**
   * @constructor
   * Super interactor instance: one per connected ui. hardware
   * X16SuperInteractor a {@link superInteractor} prototype for x16basic {@link HardwareDriver}.
   * @param {x16Hardware}
   * @returns {undefined} no return
   */
  this.SuperInteractor = function(myHardware) {

    /** @private @var engagedInterface stores the module that is currently engaged, the interaction events are forwarded to the {@link moduleInterface} that is referenced here*/

    var muteMode = false;
    var deleteMode = false;

    var modulesMan=environment.modulesMan;

    /** @private @var selectedInterface stores the {@link moduleInterface} that will become engaged once the patching button is released / the superInteractor disengaged.
    selectedInterface is also subject to patching
    */
    var selectedModule = false;
    var selectedInterface=false;
    var selectedModuleNumber=false;
    /**
    keeps the interface that is currently engaged
    */
    var engagedInterface = false;
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
    var myModuleCreator = new ModuleCreator(myHardware,environment);
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
          selectedModule = tryGetModuleN(event.button);
          selectedInterface=tryGetInterfaceN(event.button);
          selectedModuleNumber=(selectedModule?event.button:false);
          firstPressedMatrixButton = event.data[0];
          updateHardware();
        } else {
          var modulea = tryGetModuleN(firstPressedMatrixButton);
          var moduleb = tryGetModuleN(event.button);

          if (modulea && moduleb) try {
            var connected = modulea.toggleOutput(moduleb);
            myHardware.sendScreenB((connected ? RARROW : "X") + moduleb.name);
          } catch (e) {
            console.error(e);
            myHardware.sendScreenB("X");
          }
          updateLeds();

        }
        if (!selectedInterface) {
          selectedInterface = false;
          if (event.data[0] == modulesMan.modules.length) myModuleCreator.engage();
        } else {
          if (muteMode) {
            selectedInterface.controlledModule.mute = (false == selectedInterface.controlledModule.mute);

          } else if (deleteMode) {
            if (environment.modulesMan.removeModuleN(event.button)) {
              modulesMan.modules.splice(event.button, 1);
              selectedInterface = false;
            }
          } else {}
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
      if (event.button == 0) {
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
            deleteMode = true;
            // console.log("DEL",deleteMode);
            // console.log("DEL");
            updateHardware();
          } else if (event.button == 5) {
            // muteMode=!muteMode;
            muteMode = true;
            // console.log("DEL");
            updateHardware();
          } else {
            thisInteractor.engage(event);
          }
        }
      }
    });
    this.on('selectorButtonReleased', function(event) {
      // event.button=event.data[0];
      if (deleteMode || muteMode) {
        if (event.button == 6 || event.button == 5) {
          deleteMode = false;
          muteMode = false;
        }
      } else if (selectorButtonOwners[event.data[0]]) {
        selectorButtonOwners[event.data[0]].selectorButtonReleased(event);
        delete selectorButtonOwners[event.data[0]];
      } else {
        {
          var newCreated = false;
          if (myModuleCreator.engaged) newCreated = myModuleCreator.disengage();
          if (newCreated){
            selectedInterface = newCreated.interface;
            selectedModuleNumber=newCreated.number;
            selectedModule=newCreated.module;
          };
          if (selectedInterface) {
            engagedInterface = selectedInterface;
            // console.log("engaged",engagedInterface);
            selectedInterface.engage(event);
          }
        }

        if (!engagedInterface)
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
      updateHardware();
      engagedInterface = false;
    }

    function updateHardware() {
      if (muteMode) {
        myHardware.sendScreenA("Mute module");
      } else if (deleteMode) {
        myHardware.sendScreenA("Delete module!");
      } else {
        myHardware.sendScreenA("Select module");
      }
      myHardware.sendScreenB((selectedModule ? selectedModule.name : "none") + "");
      updateLeds();
    }

    function updateLeds() {
      var outputsBmp = 0;
      var mutedBitmap = 0;
      //calculate bitmap for muted modules
      for (let a in modulesMan.modules) {
        let amodule = modulesMan.modules[a];
        if (amodule.mute) mutedBitmap |= 1 << a;
      }
      if (selectedModule) {
        //displaying the selected module output is rather awkward:
        //for each output of the module that the interface controls
        // console.log(selectedInterface.controlledModule.outputs)
        for (var siOpts of selectedModule.outputs) {
          //we add a bit to the array position of the interactor that iterated output module has
          outputsBmp |= 1 << modulesMan.modules.indexOf(siOpts);
        }
      }

      var creatorBtn = 1 << (modulesMan.modules.length);
      var selectable = ~(0xffff << modulesMan.modules.length);

      var selectedBmp = (selectedModule?1 << selectedModuleNumber:0);

      myHardware.draw([
        (selectedBmp | outputsBmp) ^ mutedBitmap,
        (selectedBmp | creatorBtn),
        (selectedBmp | (selectable ^ outputsBmp)) | creatorBtn
      ]);
    }


    function tryGetModuleN(number) {
      if (number < modulesMan.modules.length) {
        return modulesMan.modules[number];
      }
      return false;
    }
    function tryGetInterfaceN(number) {
      if (number < modulesMan.modules.length) {
        if(modulesMan.modules[number].x16Interface){
          return modulesMan.modules[number].x16Interface;
        }else{
          console.log(modulesMan.modules[number].name," had no x16Interface property");
        }
      }
      return false;
    }
  }
};

module.exports = SuperInteractorsSingleton;