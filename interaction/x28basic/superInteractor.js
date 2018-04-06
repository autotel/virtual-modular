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

  var modules = environment.modules;
  environment.on('+ modulesManager',function(man){
    modules=man;
  });
  // console.log("MODULEEES",module);
  // fail();
  //contains the module that is accessible through each button
  var moduleButtons=[];
  //function to transform a number to module
  function tryGetModuleInButton(button) {
    var ret=false;
    if(moduleButtons[button]) ret=moduleButtons[button][moduleButtons[button].length-1];

    return ret;
  }
  function tryGetButtonOfModule(module){
    for(var x in moduleButtons){
      for(var y in moduleButtons[x]){
        if(moduleButtons[x][y]===module){
          return x;
        }
      }
    }
  }
  function addModuleToButton(module,button){
    if(moduleButtons[button]){
      moduleButtons[button].push(module);
    }else{
      moduleButtons[button]=[module];
    }
  };
  environment.on('- module',function(event){
    for(var x in moduleButtons){
      for(var y in moduleButtons[x]){
        if(moduleButtons[x][y]===event.module){
          console.log("RM module from button",x,y);
          if(moduleButtons[x].length==1){
            console.log("UNDEF");
            moduleButtons[x]=undefined;
          }else{
            console.log("SPLICE");
            moduleButtons[x].splice(y,1);
          }
        }
      }
    }
  });
  var defaultButtonForNewModule=0;
  environment.on('+ module',function(event){
    console.log("+MODUL");
    if(tryGetButtonOfModule(event.module)===undefined){
      console.log("ASSIGN!");
      addModuleToButton(event.module,defaultButtonForNewModule);
      defaultButtonForNewModule++;
    }
  });
  function tryGetModuleInterface(moduleInstance){
    var ret=false;
    if(moduleInstance){
      if (moduleInstance._instancedInterfaces){
        if (moduleInstance._instancedInterfaces.X28){
          ret= moduleInstance._instancedInterfaces.X28;
        }else{
          if (moduleInstance.interfaces.X28) {
            moduleInstance._instancedInterfaces.X28 = new moduleInstance.interfaces.X28(moduleInstance,environment);
            ret= moduleInstance._instancedInterfaces.X28;
          } else if (moduleInstance.interfaces.X16) {
            moduleInstance._instancedInterfaces.X28 = new moduleInstance.interfaces.X16(moduleInstance,environment);
            ret= moduleInstance._instancedInterfaces.X28;
          } else {
            console.log(moduleInstance.name, " had no interfaces.X28 property nor interfaces.X16 property");
          }
        }
      }
    }
    return ret;
  }
  this.SuperInteractor = function(myHardware) {

    /** @private @var engagedInterface stores the module that is currently engaged, the interaction events are forwarded to the {@link moduleInterface} that is referenced here*/

    var muteMode = false;
    var deleteMode = false;


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

        // console.log("28 int",event);
      if (engagedInterface) {
        engagedInterface.handle('interaction', event);
      }
    });
    // this.on('interaction',console.log);
    environment.on('+ module', function(evt) {
      if (!(engagedInterface || myModuleCreator.engaged)) {
        updateHardware();
      }
    });
    environment.on('- module', function(evt) {
      if (!(engagedInterface || myModuleCreator.engaged)) {
        updateHardware();
      }
    });
    this.on('matrixButtonPressed', function(event) {
      if (myModuleCreator.engaged) {
        myModuleCreator.matrixButtonPressed(event);
      } else if (!engagedInterface) {
        if (firstPressedMatrixButton === false) {
          selectedModule=tryGetModuleInButton(event.button);
          selectedInterface = tryGetModuleInterface(selectedModule);
          selectedModuleNumber = (selectedModule ? event.button : false);
          engageOnRelease=true;
          firstPressedMatrixButton = event.data[0];
          updateHardware();
        } else {

          var modulea = tryGetModuleInButton(firstPressedMatrixButton);
          var moduleb = tryGetModuleInButton(event.button);

          if (modulea && moduleb) try {
            var connected = modulea.toggleOutput(moduleb);
            myHardware.sendScreenB((connected ? RARROW : XMARK) + moduleb.name);
          } catch (e) {
            console.error(e);
            myHardware.sendScreenB("X");
            updateLeds();
          }

        }
        if (!selectedModule) {
          selectedModule = false;
          myModuleCreator.engage(event);
        } else {
          if (muteMode) {
            selectedModule.mute = (false == selectedModule.mute);
            myHardware.sendScreenA(selectedModule.mute?"MUTED":"Active");

          } else if (deleteMode) {
            if (modules.removeModule(tryGetModuleInButton(event.button))) {
              selectedModule=false;
              selectedInterface = false;
              selectedModuleNumber=false;
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
    this.on('matrixButtonVelocity', function(event) {
      // console.log("VELO");
      if (matrixButtonOwners[event.data[0]]) {
        matrixButtonOwners[event.data[0]].matrixButtonVelocity(event);
        // console.log("YES",event.data);
      } else {
        // console.log("NO",matrixButtonOwners);
      }
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
      if (event.button == 3) {
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
        var create=false;
        if (myModuleCreator.engaged) create = myModuleCreator.disengage();

        if (create) {
          var defaultProps = {};
          environment.modules.instantiate(create, defaultProps, function(nmod){
            newCreated=nmod;
            addModuleToButton(newCreated,myModuleCreator.invokerButton);
          });
        }

        if (newCreated) {
          selectedModule = newCreated;
          selectedInterface = tryGetModuleInterface(newCreated);
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
      myHardware.clear();
      let lowLight=environment.vars.light;

      if (selectedModule) {
        console.log("SELECTEDMOD");
        //displaying the selected module outputs is rather awkward:
        //for each output of the module that the interface controls
        // console.log(selectedInterface.controlledModule.outputs)
        for (var siOpts of selectedModule.outputs) {
          //we add a bit to the array position of the interactor that iterated output module has
          var button=tryGetButtonOfModule(siOpts);
          outputsBmp |= (button!==undefined)? 1 << button:0;
        }
        // var selectedBmp = 1 << selectedModuleNumber;
      }

      for (let button = 0; button<16; button++) {
        var bmodule=tryGetModuleInButton(button);
        if(bmodule){
          var posBmp=1<<button;
          var color=[0,0,127];

          if (bmodule.color){
            color=bmodule.color;
          }

          if(bmodule.mute){
            color=panton.mixColors(panton.disabled,color,0.4);
            color=panton.homogenize(color,lowLight/16);
          }else{
            color=panton.homogenize(color,lowLight);
          }

          if(outputsBmp&posBmp){
            color=panton.mixColors(panton.connected,color,0.2);
          }
          if(selectedModuleNumber==button){
            color=panton.homogenize(color,Math.min((lowLight<<2),0xff));
          }


          myHardware.drawColor(posBmp,color);
        }
      }



      // myHardware.drawColor(1<<modules.list.length,[100,255,255]);


      // myHardware.drawColor(outputsBmp & mutedBmp,panton.mixColors(panton.disabled,panton.connected));
    }
    var bpaint={
      patching:1<<3,
      events:1<<1,
      config:1<<2,
      shift:1,
      whites:0xf<<4
    }
    bpaint.result=[
      bpaint.patching | bpaint.events                 | bpaint.whites,
      bpaint.patching                 | bpaint.shift  | bpaint.whites,
      bpaint.config   | bpaint.events | bpaint.shift  | bpaint.whites

    ];
    function paintSelectButtons() {
      myHardware.drawSelectors(bpaint.result);
    }

  }
};

module.exports = SuperInteractorsSingleton;