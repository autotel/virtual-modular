onHandlers=require("onhandlers");
patchingMenu=require("./patchingMenu");
module.exports=function(environment,myHardware){
  var myModules=new Set();
  var engagedModule=false;
  var thisInteractor=this;
  /*store what are the modules over which a button was pressed
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
    console.log(event);
    if(!engagedModule){

      console.log(myModules.keys());
      if(!myModules.keys[event.data[0]]){
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
      myModules.forEach(function(interactor){
        interactor.buttonMatrixReleased(event);
      });
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
      thisInteractor.engage();
    }else{
      engagedModule.buttonMatrixPressed(event);
      selectorButtonOwners[event.data[0]]=engagedModule;
    }
  });
  this.on('selectorButtonReleased',function(event){
    if(selectorButtonOwners[event.data[0]]){
      buttonMatrixOwners[event.data[0]].selectorButtonReleased(event);
      delete buttonMatrixOwners[event.data[0]];
    }else{
      engagedModule=preselectedModule;
      preselectedModule.engage();
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
  //     myModules.forEach(function(interactor){
  //       interactor.serialopened(event);
  //     });
  //   }
  // });
  this.engage=function(){
    myHardware.sendScreenA("select module");
    var b=~(0xffff<<myModules.size);
    myHardware.draw([b,b,b]);
    engagedModule=false;
  }
  this.disengage=function(){
    throw "oops";
    engagedModule=0;
  }
  this.addModule=function(what){
    myModules.add(what);
  }

}