"use strict";
var RARROW=String.fromCharCode(126);
/**
Definition of hardware specific translations of hardware events into internal events
things such as "when the user press a button" become "view the sequencer user interface"
*/
module.exports={};
var onHandlers=require("onhandlers");
var patchingMenu=require("./patchingMenu");

var moduleInterfaces=[];
/**
* @constructor
* singleton
* @param {environment} input to pass the environment. Needed to access the modulesMan, for things such as adding modules, jumping to modules, etc.
*/
var X16SuperInteractorsSingleton=function(environment){
  /**check compatibility of a certain interactor*/
  var compatibilityTags=["x16v0"];
  var compatible=function(tagSet){
    for(var tag of tagSet){
      if(compatibilityTags.indexOf(tag)!=-1){
        return true;
      }
    }
    return false;
  }
  /**
  affects all the X16SuperInteractor. Depending on how much sense it makes, there could be a function that adds an interactor only to a certain hardware instance.
  */
  this.appendModuleInteractor=function(what){
    if(what.type=="interactor"){
      if(compatible(what.compatibilityTags)){
        moduleInterfaces.push(what);
      }else{
        console.log(what);
          throw "x16v0 Superinteractor is incompatible with interface",what;
      }
    }else{
      throw "tried to add an object to a SuperInteractor that is not an interactor";
    }
  }
  /** get the list of interactors @return array*/
  this.getModuleInteractors=function(){
    return moduleInterfaces;
  }
  /**
  *Tiny pseudo-interactor that is used to choose what module to isntantiate when we press on an empty slot of the "patchboard" (i.e. button that is not lid)
  */
  function ModuleCreator(myHardware){
    var possibleModules=[];
    var possibleModulesBitmap=0;
    var moduleToCreateOnDisengage=false;
    var lastMatrixButton=false;
    this.engaged=false;
    function updatePossibleModulesList(){
      possibleModules=Object.keys(environment.modulesMan.modulePrototypesList);
      possibleModulesBitmap=~(0xffff<<possibleModules.length);
    }
    function updateHardware(){
      myHardware.sendScreenA("create module");
      var head=0;
      if(lastMatrixButton) head=1<<lastMatrixButton;
      myHardware.draw([possibleModulesBitmap|head,0|head,possibleModulesBitmap|head]);
    }
    this.engage=function(){
      if(possibleModules.length==0) updatePossibleModulesList();
      updateHardware();
      this.engaged=true;
    }
    this.disengage=function(){
      var ret=false;
      this.engaged=false;
      if(moduleToCreateOnDisengage){
        var defaultProps={};
        environment.modulesMan.addModule(moduleToCreateOnDisengage,defaultProps);
        ret=moduleInterfaces[moduleInterfaces.length-1];
      }
      return ret;
    }
    this.matrixButtonPressed=function(evt){
      if(evt.data[0]===lastMatrixButton){
        this.disengage();
      }else if(evt.data[0]<possibleModules.length){
        lastMatrixButton=evt.data[0];
        moduleToCreateOnDisengage=possibleModules[evt.data[0]];
        myHardware.sendScreenA("+"+moduleToCreateOnDisengage);
      }else{
        moduleToCreateOnDisengage=false;
        this.disengage();
      }
    }
    this.matrixButtonReleased=function(evt){}
  }

  /**
  * @constructor
  * Super interactor instance: one per connected ui. hardware
  * X16SuperInteractor a {@link superInteractor} prototype for x16basic {@link HardwareDriver}.
  * @param {x16Hardware}
  * @returns {undefined} no return
  */
  this.SuperInteractor=function(myHardware){
    /** @private @var engagedModule stores the module that is currently engaged, the interaction events are forwarded to the {@link moduleInterface} that is referenced here*/
    var engagedModule=false;
    /** @private @var selectedInterface stores the {@link moduleInterface} that will become engaged once the patching button is released / the superInteractor disengaged.
    selectedInterface is also subject to patching
    */
    var selectedInterface=false;
    var thisInteractor=this;
    /** store what are the modules over which a button was pressed
    this allows to switch to another module and still detect the
    release in the module where the button was pressed. Furthermore,
    if we are using some sort of expression out of the pressure sensing,
    we can assign it to the module where it was pressed
    @private @var matrixButtonOwners={};
    @private @var selectorButtonOwners={};
    */
    var matrixButtonOwners={};
    var selectorButtonOwners={};
    //for the matrix button pressed event, it indicates if this is the only matrix button that is pressed or not (allows selecting a module's outputs)
    var firstPressedMatrixButton=false;
    onHandlers.call(this);

    var myModuleCreator=new ModuleCreator(myHardware);
    // this.on('interaction',console.log);
    environment.on('module created',function(evt){
      if(!(engagedModule||myModuleCreator.engaged)){
      updateHardware();
      }
    });
    this.on('matrixButtonPressed',function(event){
      event.button=event.data[0];
      // console.log(event);
      if(myModuleCreator.engaged){
        myModuleCreator.matrixButtonPressed(event);
      }else if(!engagedModule){
        if(firstPressedMatrixButton===false){
          selectedInterface=moduleInterfaces[event.data[0]];
          firstPressedMatrixButton=event.data[0];
          updateHardware();
        }else{
          if(selectedInterface&&moduleInterfaces[event.data[0]])try{
            var connected=selectedInterface.controlledModule.toggleOutput(moduleInterfaces[event.data[0]].controlledModule);
            myHardware.sendScreenB((connected?RARROW:"X")+moduleInterfaces[event.data[0]].controlledModule.name);
          }catch(e){
            console.error(e);
            myHardware.sendScreenB("X");
          }
          updateLeds();
        }
        if(!selectedInterface){
          selectedInterface=false;
          //  environment.modulesMan.addModule();
          if(event.data[0]==moduleInterfaces.length) myModuleCreator.engage();
          // selectedInterface=moduleInterfaces[moduleInterfaces.length-1];
          //  console.log();
        }
      }else{
        engagedModule.matrixButtonPressed(event);
        matrixButtonOwners[event.data[0]]=engagedModule;
      }
    });
    this.on('matrixButtonReleased',function(event){
      if(firstPressedMatrixButton===event.data[0]){
       firstPressedMatrixButton=false;
      }
      event.button=event.data[0];
      if(matrixButtonOwners[event.data[0]]){
       matrixButtonOwners[event.data[0]].matrixButtonReleased(event);
       delete matrixButtonOwners[event.data[0]];
      }else{
      }
    });
    this.on('matrixButtonHold',function(event){
     event.button=event.data[0];
     if(matrixButtonOwners[event.data[0]]){
        matrixButtonOwners[event.data[0]].matrixButtonHold(event);
     }else{
     }
    });
    this.on('selectorButtonPressed',function(event){
     //if the button is the patchMenu button
     if(event.data[0]==0){
       if(engagedModule){
         engagedModule.disengage(event);
         thisInteractor.engage();
       }
     }else{
       event.button=event.data[0];
       if(engagedModule){
         engagedModule.selectorButtonPressed(event);
         selectorButtonOwners[event.data[0]]=engagedModule;
       }else{
         thisInteractor.engage(event);
       }
     }
    });
    this.on('selectorButtonReleased',function(event){
      event.button=event.data[0];
      if(selectorButtonOwners[event.data[0]]){
       selectorButtonOwners[event.data[0]].selectorButtonReleased(event);
       delete selectorButtonOwners[event.data[0]];
      }else{
       var newCreated=false;
       if(myModuleCreator.engaged) newCreated=myModuleCreator.disengage();
       if(newCreated) selectedInterface=newCreated;
       if(selectedInterface){
         engagedModule=selectedInterface;
         // console.log("engaged",engagedModule);
         selectedInterface.engage(event);
       }else{
         updateHardware();
       }
      }
    });
    this.on('encoderPressed',function(event){
      if(!engagedModule){}else{
        engagedModule.encoderPressed(event);
      }
    });
    this.on('encoderReleased',function(event){
      if(!engagedModule){}else{
        engagedModule.encoderReleased(event);
        }
      });
    this.on('encoderScrolled',function(event){
      if(!engagedModule){
      }else{
        engagedModule.encoderScrolled(event);
      }
    });
    this.engage=function(evt){
      updateHardware();
      engagedModule=false;
    }
    function updateHardware(){
     myHardware.sendScreenA("select module");
     myHardware.sendScreenB((selectedInterface?selectedInterface.name:"none")+"");
     updateLeds();
    }
    function updateLeds(){
      var outputs=0;
      if(selectedInterface){
      //displaying the selected module output is rather awkward:
      //for each output of the module that the interface controls
      // console.log(selectedInterface.controlledModule.outputs)
      for(var siOpts of selectedInterface.controlledModule.outputs){
        //we add a bit to the array position of the interactor that iterated output module has
        outputs|=1 << moduleInterfaces.indexOf(siOpts.interactor);
      }}
      var creatorBtn=1<<moduleInterfaces.length;
      var selectable=~(0xffff<<moduleInterfaces.length);
      var selected=1<<moduleInterfaces.indexOf(selectedInterface);
      //selected module is white
      //outputs of selected modules are red
      //selectable modules are blue
      //perhaps I could make inputs green?
      myHardware.draw([selected|outputs,selected|creatorBtn,selected|(selectable^outputs)|creatorBtn]);
    }
    this.disengage=function(){
     throw "oops";
     engagedModule=0;
    }

    //note that the module interface is added to all equal interfaces, but it wouldnt be hard to make an add that is exclusive to one hardware instance
  }
};

module.exports=X16SuperInteractorsSingleton;

