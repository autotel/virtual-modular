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
  // fail();
  //contains the module that is accessible through each button
  var moduleLocations=[];
  //function to transform a number to module
  function tryGetModuleInLoc(location) {
    if(location<0){ console.warn(`tryGetModuleInLoc(${location})`); return false};
    var ret=false;
    if(moduleLocations[location]){
      ret=moduleLocations[location][moduleLocations[location].length-1];
    }
    return ret;
  }
  function tryGetLocOfModule(module){
    for(var x in moduleLocations){
      for(var y in moduleLocations[x]){
        if(moduleLocations[x][y]===module){
          //console.log(`get location = ${x}(${y})`);
          return x;
        }
      }
    }
  }
  function addModuleToLoc(module,location){
    if(location<0){ console.warn("loc is",location); return false};
    if(moduleLocations[location]){
      var len=moduleLocations[location].push(module);
      //console.log(`module in location ${location},${len-1}`);
    }else{
      moduleLocations[location]=[module];
      //console.log(`module in location ${location},0`);

    }
  };
  environment.on('- module',function(event){

    for(var x in moduleLocations){
      for(var y in moduleLocations[x]){
        if(moduleLocations[x][y]===event.module){
          if(moduleLocations[x].length==1){
            moduleLocations[x]=undefined;
          }else{
            moduleLocations[x].splice(y,1);
          }
        }
      }
    }
  });
  var defaultButtonForNewModule=0;
  environment.on('+ module',function(event){

    if(tryGetLocOfModule(event.module)===undefined){
      addModuleToLoc(event.module,defaultButtonForNewModule);
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
    var pageOffset=0;

    /** @private @var engagedInterface stores the module that is currently engaged, the interaction events are forwarded to the {@link moduleInterface} that is referenced here*/

    var muteMode = false;
    var deleteMode = false;
    var pageMode = false;
    var inputsMode = false;
    var deleteList=new Set();
    /** @private @var selectedInterface stores the {@link moduleInterface} that will become engaged once the patching button is released / the superInteractor disengaged.
    selectedInterface is also subject to patching
    */
    var selectedModule = false;
    var selectedInterface = false;
    var engageOnRelease = false;
    var selectedModuleLoc = false;
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
    var firstPressedMatrixLoc = false;
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

      if (engagedInterface) {
        engagedInterface.handle('interaction', event);
      }
    });
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
      var location=event.button+pageOffset;
      if(location<0) return false;
      if (myModuleCreator.engaged) {
        myModuleCreator.matrixButtonPressed(event);
      } else if (!engagedInterface) {
        if (firstPressedMatrixLoc === false) {
          selectedModule=tryGetModuleInLoc(location);
          selectedInterface = tryGetModuleInterface(selectedModule);
          selectedModuleLoc = (selectedModule ? location : false);
          engageOnRelease=true;
          firstPressedMatrixLoc = location;
          firstPressedMatrixButton = event.button;
          updateHardware();
        } else {

          var modulea = tryGetModuleInLoc(firstPressedMatrixLoc);
          var moduleb = tryGetModuleInLoc(location);

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
          myModuleCreator.engage(event,location);
        } else {
          if (muteMode) {
            selectedModule.mute = (false == selectedModule.mute);
            myHardware.sendScreenA(selectedModule.mute?"MUTED":"Active");

          } else if (deleteMode) {
            if(deleteList.has(selectedModule)){
              deleteList.delete(selectedModule);
              selectedModule.mute = false;
              myHardware.sendScreenA("don't delete");
            }else{
              deleteList.add(selectedModule);
              selectedModule.mute = true;
              myHardware.sendScreenA("del on release");
            }
            selectedModule=false;
            selectedInterface = false;
            selectedModuleLoc=false;

          } else {}
          updateLeds();
        }
      } else {
        engagedInterface.matrixButtonPressed(event);
        matrixButtonOwners[event.data[0]] = engagedInterface;
      }

    });
    this.on('matrixButtonReleased', function(event) {
      var location=event.button+pageOffset;
      if (firstPressedMatrixButton === event.button) {
        firstPressedMatrixLoc = false;
        firstPressedMatrixButton=false;
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
    // this.on('bottomButtonPressed', function(event) {
    //   console.log("BBP");
    //   if (engagedInterface) {
    //     // engagedInterface.bottomButtonPressed(event);
    //   }else{
    //     if(event.data[0]==0){
    //       pageOffset-=4;
    //     }else{
    //       pageOffset+=4;
    //     }
    //     if(pageOffset<0) pageOffset=0;
    //     pageMode=true;
    //     updateHardware();
    //     pageMode=false;
    //   }
    // });
    // this.on('bottomButtonReleased', function(event) {
    //   if (engagedInterface) {
    //     // engagedInterface.bottomButtonReleased(event);
    //   }
    // });
    this.on('selectorButtonPressed', function(event) {
      //if the button is the patchMenu button}
      //  console.log(event.button);
      if (event.button == 3) {

        if (engagedInterface) {
          engagedInterface.disengage(event);
          thisInteractor.engage();
          engageOnRelease=false;
        }
      }else if(myModuleCreator.engaged){
        myModuleCreator.selectorButtonPressed(event);
      }else{
        //  event.button=event.data[0];
        if (engagedInterface) {
          engagedInterface.selectorButtonPressed(event);
          selectorButtonOwners[event.data[0]] = engagedInterface;
        } else {
          if(event.button==0){
            inputsMode = true;
            updateHardware();
            // engagedInterface=enviroVarConfig;
            // engagedInterface.engage(event);
          }else if (event.button == 2) {
            deleteList=new Set();
            deleteMode = true;
            updateHardware();
          } else if (event.button == 1) {
            // muteMode=!muteMode;
            muteMode = true;
            // console.log("DEL");
            updateHardware();
          }  else if (event.button < 8) {
            pageMode=true;
            if(event.button==4){
              pageOffset-=16;
            }else if(event.button==5){
              pageOffset-=4;
            }else if(event.button==6){
              pageOffset+=4;
            }else if(event.button==7){
              pageOffset+=16;
            }
            if(pageOffset<0){
              pageOffset=0;
            }
            updateHardware();
            paintSelectButtons();
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
      } else if(deleteMode && event.button==2){
        deleteList.forEach(function(item){
          console.log("DEL",item.name);
          if (modules.removeModule(item)) {
            selectedModule=false;
            selectedInterface = false;
            selectedModuleLoc=false;
          }
        });
        myHardware.sendScreenA("deleted sel");
        deleteMode = false;
      } else if ( muteMode || pageMode || inputsMode) {
        if (event.button == 2 || event.button == 1 || event.button == 0) {

          muteMode = false;
          inputsMode = false;
        }else if(event.button < 8 && event.button > 3){
          pageMode=false;
        }
        updateHardware();
      } else if (selectorButtonOwners[event.data[0]]) {
        selectorButtonOwners[event.data[0]].selectorButtonReleased(event);
        delete selectorButtonOwners[event.data[0]];
      } else if(event.button==3) {
        var newCreated = false;
        var create=false;
        if (myModuleCreator.engaged) create = myModuleCreator.disengage();

        if (create) {
          var defaultProps = {};
          environment.modules.instantiate(create, defaultProps, function(nmod){
            newCreated=nmod;
            addModuleToLoc(newCreated,myModuleCreator.invokerButton);
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
      } else if (myModuleCreator.engaged && event.button == 2){

        if (myModuleCreator.engaged) {
          console.log("cancel creation");
          myModuleCreator.disengage();
          thisInteractor.engage();          
        }
      }else if (myModuleCreator.engaged) {
        myModuleCreator.selectorButtonReleased(event);
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
        if(pageMode){
          pageOffset+=event.delta*4;
          if(pageOffset<0) pageOffset=0;
          updateHardware();
        }else if(selectedInterface){
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
        myHardware.sendScreenB((selectedModule ? ""+selectedModule.name : "none") + "");

      } else if (deleteMode) {
        myHardware.sendScreenA("Delete module!");
        myHardware.sendScreenB((selectedModule ? ""+selectedModule.name : "none") + "");

      } else  if (pageMode) {
        myHardware.sendScreenA("Set page");
        myHardware.sendScreenB("Page "+(pageOffset/16));
      } else  if (inputsMode) {
        myHardware.sendScreenA("Watching inputs");
        myHardware.sendScreenB((selectedModule ? "of "+selectedModule.name : "none") + "");
      } else {
        myHardware.sendScreenA("Select module");
        myHardware.sendScreenB((selectedModule ? selectedModule.name : "none") + "");
      }
      updateLeds();
    }

    function updateLeds() {
      var outputsBmp = 0;
      var mutedBmp = 0;
      myHardware.clear();
      let lowLight=environment.vars.light;

      // if (selectedModule && !inputsMode) {
      //   for (var optIt of selectedModule.outputs) {
      //     var loc=tryGetLocOfModule(optIt);
      //     outputsBmp |= (loc!==undefined)? 1<<(loc) : 0;
      //   }
      // }

      for (let button = 0; button<16; button++) {

        var location=button + pageOffset;
          var bmodule=tryGetModuleInLoc(location);
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
            if(selectedModule){
              if(inputsMode){
                if(bmodule.outputs.has(selectedModule)){
                  color=panton.mixColors(panton.isInput,color,0.5);
                }else{
                  color=panton.mixColors(panton.disabled,color,0.4);
                }
              }else{
                if(selectedModule.outputs.has(bmodule)){
                  color=panton.mixColors(panton.connected,color,0.5);
                }
              }
            }
            if(outputsBmp&posBmp){
              color=panton.mixColors(panton.connected,color,0.5);
            }
            if(selectedModuleLoc==location){
              color=panton.homogenize(color,Math.min((lowLight<<2),0xff));
            }


            myHardware.drawColor(posBmp,color);
          }
        // }
      }


      // myHardware.draw([outputsBmp,0,0],false);
      // myHardware.drawColor(1<<modules.list.length,[100,255,255]);


      // myHardware.drawColor(outputsBmp & mutedBmp,panton.mixColors(panton.disabled,panton.connected));
    }
    var bpaint={
      patching:1<<3,
      events:1<<1,
      config:1<<2,
      shift:1,
      // whites:0xf<<4,
      whites: 1 << (Math.round(pageOffset / 16) + 4)
    }

    function paintSelectButtons() {
      bpaint.whites = 1 << (Math.round(pageOffset/16) + 4)
      console.log(bpaint.whites);
        bpaint.result=[
          bpaint.patching | bpaint.events                 | bpaint.whites,
          bpaint.patching                 | bpaint.shift  | bpaint.whites,
          bpaint.config   | bpaint.events | bpaint.shift  | bpaint.whites
        ];
      myHardware.drawSelectors(bpaint.result);
    }

  }
};

module.exports = SuperInteractorsSingleton;
