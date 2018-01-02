"use strict";
var RARROW = String.fromCharCode(199);
var XMARK = String.fromCharCode(183);
var panton = require('./panton');
var BlankConfigurator = require( '../../modules/x16utils/BlankConfigurator.js' );

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

    var modules = environment.modules;

    /** @private @var selectedInterface stores the {@link moduleInterface} that will become engaged once the patching button is released / the superInteractor disengaged.
    selectedInterface is also subject to patching
    */
    var selectedModule = false;
    var selectedInterface = false;
    var engageOnRelease = false;
    var selectedModuleNumber = false;
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
    var myModuleCreator = new ModuleCreator(myHardware, environment);


    let enviroVars={}
    for(var a in environment.vars){
      enviroVars[a]={
        enviroVarName:a,
        value: environment.vars[a]
      }
      let thisEnviroVar=enviroVars[a];
      thisEnviroVar.selectFunction=thisEnviroVar.changeFunction=function(thisVar,delta){
        let envarn=thisEnviroVar.enviroVarName;
        if(delta)
        environment.vars[envarn]+=delta;
        thisVar.value=environment.vars[envarn];
        updateLeds();
      }
    }
    var enviroVarConfig = new BlankConfigurator(this, {
      name: "",
      vars: enviroVars
    });
    let lCompConfigurator= enviroVarConfig.vars["ambt. light"];

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
          selectedInterface = tryGetInterfaceN(event.button);
          selectedModuleNumber = (selectedModule ? event.button : false);
          engageOnRelease=true;
          firstPressedMatrixButton = event.data[0];
          updateHardware();
        } else {
          var modulea = tryGetModuleN(firstPressedMatrixButton);
          var moduleb = tryGetModuleN(event.button);

          if (modulea && moduleb) try {
            var connected = modulea.toggleOutput(moduleb);
            myHardware.sendScreenB((connected ? RARROW : XMARK) + moduleb.name);
          } catch (e) {
            console.error(e);
            myHardware.sendScreenB("X");
            updateLeds();
          }

        }
        if (!selectedInterface) {
          selectedInterface = false;
          if (event.data[0] == modules.list.length) myModuleCreator.engage();
        } else {
          if (muteMode) {
            selectedInterface.controlledModule.mute = (false == selectedInterface.controlledModule.mute);

          } else if (deleteMode) {
            if (environment.modules.removeModuleN(event.button)) {
              modules.list.splice(event.button, 1);
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
      if (event.button == 7) {
        if (engagedInterface) {
          engagedInterface.disengage(event);
          thisInteractor.engage();
          engageOnRelease=false;
        }
      } else {
        //  event.button=event.data[0];
        if (engagedInterface) {
          engagedInterface.selectorButtonPressed(event);
          selectorButtonOwners[event.data[0]] = engagedInterface;
        } else {
          if(event.button==0){
            engagedInterface=enviroVarConfig;
            engagedInterface.engage(event);
          }else if (event.button == 2) {
            // deleteMode=!deleteMode;
            deleteMode = true;
            // console.log("DEL",deleteMode);
            // console.log("DEL");
            updateHardware();
          } else if (event.button == 1) {
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
      // event.button=event.data[0]
      if(engagedInterface==enviroVarConfig){
        if(event.button==0){
          enviroVarConfig.disengage(event);
        }
      }else if (deleteMode || muteMode) {
        if (event.button == 2 || event.button == 1) {
          deleteMode = false;
          muteMode = false;
        }
        updateHardware();
      } else if (selectorButtonOwners[event.data[0]]) {
        selectorButtonOwners[event.data[0]].selectorButtonReleased(event);
        delete selectorButtonOwners[event.data[0]];
      } else {
        var newCreated = false;
        if (myModuleCreator.engaged) newCreated = myModuleCreator.disengage();
        if (newCreated) {
          selectedInterface = newCreated.interface;
          selectedModuleNumber = newCreated.number;
          selectedModule = newCreated.module;
        };
        if (selectedInterface&&engageOnRelease) {
          engagedInterface = selectedInterface;
          // console.log("engaged",engagedInterface);
          selectedInterface.engage(event);
        }
        engageOnRelease=true;

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
      if (!engagedInterface) {
        if(selectedInterface){
          let str=selectedInterface.outsideScroll(event);
          if(str){
            myHardware.sendScreenB(str);
          }
        }
      } else {
        engagedInterface.encoderScrolled(event);
      }
    });
    this.engage = function(evt) {
      paintSelectButtons();
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
      var mutedBmp = 0;
      //calculate bitmap for muted modules
      // for (let a in modules.list) {
      //   let amodule = modules.list[a];
      //   if (amodule.mute) mutedBmp |= 1 << a;
      // }
      if (selectedModule) {
        //displaying the selected module output is rather awkward:
        //for each output of the module that the interface controls
        // console.log(selectedInterface.controlledModule.outputs)
        for (var siOpts of selectedModule.outputs) {
          //we add a bit to the array position of the interactor that iterated output module has
          outputsBmp |= 1 << modules.list.indexOf(siOpts);
        }
      }

      var creatorBtn = 1 << (modules.list.length);
      var selectable = ~(0xffff << modules.list.length);

      var selectedBmp = (selectedModule ? 1 << selectedModuleNumber : 0);

      // myHardware.draw([
      //   (selectedBmp | outputsBmp) & ~mutedBmp,
      //   (selectedBmp | creatorBtn) & ~mutedBmp,
      //   (selectedBmp | (selectable ^ outputsBmp)) & ~mutedBmp | creatorBtn
      // ]);
      myHardware.clear();
      let lowLight=environment.vars.light;
      for (let a in modules.list) {
        var posBmp=1<<a;
        var color=[0,0,127];
        /*if(selectedModuleNumber==a){
          color=panton.homogenize(panton.selected,(modules.list[a].mute?lowLight:255));
        }else*/{
          if (modules.list[a].color){
            color=modules.list[a].color;
          }
          // if(selectedModuleNumber==a){
          //   color=color.map(function(c){return c*2})
          // }else{
          //   color=color.map(function(c){return c/2})
          // }
          if(modules.list[a].mute){
            color=panton.mixColors(panton.disabled,color,0.4);
            color=panton.homogenize(color,lowLight/16);
          }else{
            color=panton.homogenize(color,lowLight);
          }

          if(outputsBmp&posBmp){
            color=panton.mixColors(panton.connected,color,0.2);
          }
          if(selectedModuleNumber==a){
            color=panton.homogenize(color,Math.min((lowLight<<2),0xff));
          }

        }
        myHardware.drawColor(posBmp,color);
      }
      myHardware.drawColor(1<<modules.list.length,[100,255,255]);
      // myHardware.drawColor(1<<modules.list.length,[100,255,255]);


      // myHardware.drawColor(outputsBmp & mutedBmp,panton.mixColors(panton.disabled,panton.connected));
    }

    function paintSelectButtons() {
      myHardware.drawSelectors([0xff6, 0xff2, 0xff8]);
    }

    function tryGetModuleN(number) {
      if (number < modules.list.length) {
        return modules.list[number];
      }
      return false;
    }

    function tryGetInterfaceN(number) {
      if (number < modules.list.length) {
        if (modules.list[number].interfaces.X28) {
          return modules.list[number].interfaces.X28;
        } else if (modules.list[number].interfaces.X16) {
          // console.log("GET INTERFACE",modules.list[number].interfaces.X16);
          return modules.list[number].interfaces.X16;
        } else {
          console.log(modules.list[number].name, " had no interfaces.X28 property nor interfaces.X16 property");
        }
      }
      return false;
    }
  }
};

module.exports = SuperInteractorsSingleton;