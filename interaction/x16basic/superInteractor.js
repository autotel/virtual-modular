"use strict";
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
        console.log(".",what);
        moduleInterfaces.push(what);
      }else{
          console.warn("x16v0 Superinteractor is incompatible with interface"+what);
      }
    }else{
      console.warn("tried to add an object to a SuperInteractor that is not an interactor");
    }
  }

  /**
  * @constructor
  * one per connected ui. hardware
  * X16SuperInteractor a {@link superInteractor} prototype for x16basic {@link HardwareDriver}.
  * @param {x16Hardware}
  * @returns {undefined} no return
  */
  this.SuperInteractor=function(myHardware){
     var engagedModule=false;
     var preselectedInterface=false;
     var thisInteractor=this;
     /* store what are the modules over which a button was pressed
     this allows to switch to another module and still detect the
     release in the module where the button was pressed. Furthermore,
     if we are using some sort of expression out of the pressure sensing,
     we can assign it to the module where it was pressed
   */
     var matrixButtonOwners={};
     var selectorButtonOwners={};
     onHandlers.call(this);
     // this.on('interaction',console.log);

     this.on('matrixButtonPressed',function(event){
       event.button=event.data[0];
       // console.log(event);
       if(!engagedModule){
         preselectedInterface=moduleInterfaces[event.data[0]];
         //console.log(moduleInterfaces[event.data[0]]);
         if(!preselectedInterface){
           preselectedInterface=false;
           //console.log(environment);
           console.log("addModule");
           environment.modulesMan.addModule();
           updateHardware();
           console.log();
         }
       }else{
         engagedModule.matrixButtonPressed(event);
         matrixButtonOwners[event.data[0]]=engagedModule;
       }
     });
     this.on('matrixButtonReleased',function(event){
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
         if(preselectedInterface){
           engagedModule=preselectedInterface;
           // console.log("engaged",engagedModule);
           preselectedInterface.engage(event);
         }else{
           updateHardware();
         }
       }
     });
     this.on('encoderPressed',function(event){
       if(!engagedModule){}else{

       }
     });
     this.on('encoderReleased',function(event){
       if(!engagedModule){}else{

       }
     });
     this.on('encoderScroll',function(event){
       if(!engagedModule){}else{

       }
     });
     // this.on('serialopened',function(event){
     //   if(engaged){}else{
     //     moduleInterfaces.forEach(function(interactor){
     //       interactor.serialopened(event);
     //     });
     //   }
     // });
     this.engage=function(evt){
       updateHardware();
       engagedModule=false;
     }
     function updateHardware(){
       myHardware.sendScreenA("select module");
       var b=~(0xffff<<moduleInterfaces.length);
       myHardware.draw([b,b,b]);
     }

     this.disengage=function(){
       throw "oops";
       engagedModule=0;
     }

     //note that the module interface is added to all equal interfaces, but it wouldnt be hard to make an add that is exclusive to one hardware instance
  }
};

module.exports=X16SuperInteractorsSingleton;

