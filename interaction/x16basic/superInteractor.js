/**
Definition of hardware specific translations of hardware events into internal events
things such as "when the user press a button" become "view the sequencer user interface"
*/
module.exports={};
onHandlers=require("onhandlers");
patchingMenu=require("./patchingMenu");

var moduleInterfaces=[];
/**
* @constructor
* singleton
* @param {environment} input to pass the environment. Needed to access the modulesMan, for things such as adding modules, jumping to modules, etc.
*/
var X16SuperInteractorsSingleton=function(environment){
  /**
  affects all the X16SuperInteractor. Depending on how much sense it makes, there could be a function that adds an interactor only to a certain hardware instance.
  */
  this.addModuleInteractor=function(what){
    console.log(".",what);
    moduleInterfaces.push(what);
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
     var buttonMatrixOwners={};
     var selectorButtonOwners={};
     onHandlers.call(this);
     // this.on('interaction',console.log);

     this.on('buttonMatrixPressed',function(event){
       // console.log(event);
       if(!engagedModule){
         preselectedInterface=moduleInterfaces[event.data[0]];
         //console.log(moduleInterfaces[event.data[0]]);
         if(!preselectedInterface){
           preselectedInterface=false;
           //console.log(environment);
           environment.modulesMan.addModule();
         }
       }else{
         engagedModule.buttonMatrixPressed(event);
         buttonMatrixOwners[event.data[0]]=engagedModule;
       }
     });
     this.on('buttonMatrixReleased',function(event){
       if(buttonMatrixOwners[event.data[0]]){
         buttonMatrixOwners[event.data[0]].buttonMatrixReleased(event);
         delete buttonMatrixOwners[event.data[0]];
       }else{
       }
     });
     this.on('buttonMatrixHold',function(event){
       if(buttonMatrixOwners[event.data[0]]){
         buttonMatrixOwners[event.data[0]].buttonMatrixHold(event);
       }else{
       }
     });
     this.on('selectorButtonPressed',function(event){
       if(!engagedModule){
         thisInteractor.engage(event);
       }else{
         engagedModule.selectorButtonPressed(event);
         selectorButtonOwners[event.data[0]]=engagedModule;
       }
     });
     this.on('selectorButtonReleased',function(event){
       if(selectorButtonOwners[event.data[0]]){
         buttonMatrixOwners[event.data[0]].selectorButtonReleased(event);
         delete buttonMatrixOwners[event.data[0]];
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

