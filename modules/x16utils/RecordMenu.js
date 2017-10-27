var MyInteractorBase=require('../../interaction/x16basic/interactorBase.js');
/**
user interface pattern that allows to tweak parameters
@param {interactor} parentInteractor the module interactor that posesses this
@param {Object} properties {values:{@link array}(deep copy),name:{@link String},varNames:{@link Array} (shallow copy)},
@param {Object} vars the tree of variables that one wants to assign to this controller. The tree is shallow-copied, and each var value is not in the var directly, but in the var.value, otherwise the reference would be lost (same way as in tween.js). This also allows to attach additional parameters such as "onValueChange" function and the so
*/

var RecordMenu=function(parentInteractor,properties){
  if(!properties.environment) throw "RecordMenu needs you to pass the environment in the properties";
  if(!properties.controlledModule) throw "RecordMenu needs you to pass the controlledModule in the properties";
  var environment=properties.environment;
  var controlledModule=properties.controlledModule;
  var moduleInstances=environment.modulesMan.moduleInstances;
  var moduleInstancesArray=Array.from(moduleInstances);
  var recordingOuptutsBitmap=0;
  function refreshModuleInstanceNames(){
    if(moduleInstances.size!==moduleInstancesArray.length){
      moduleInstancesArray=Array.from(moduleInstances);
      // console.log(moduleInstancesArray);
    }
  }
  if(properties===undefined) properties={};

  MyInteractorBase.call(this);

  // this.vars={};
  // var varNames=[];

  this.name="set";
  thisInteractor=this;
  //
  // this.addVars=function(nvars){
  //   for(var a in nvars){
  //     thisInteractor.vars[a]=nvars[a];
  //   }
  //   watchvarNames();
  // }

  // function watchvarNames(){
  //   varNames=Object.keys(thisInteractor.vars);
  // }
  if(properties.name) this.name=properties.name;
  var selectedModuleNumber=0;

  var engagedHardwares=new Set();

  if(properties.values){
    this.vars=properties.values;
  }
  // watchvarNames();

  var valueChanged=function(){
    //value can change while not engaged
    for (let hardware of engagedHardwares) {
      updateLeds(hardware);
    }
  }
  var updateLeds=function(hardware){
    refreshModuleInstanceNames();
    // var selectBmp=1<<selectedModuleNumber;

    var eventLengthBmp=~(0xFFFF<<moduleInstancesArray.length);
    hardware.draw([
      recordingOuptutsBitmap|eventLengthBmp,
      eventLengthBmp^recordingOuptutsBitmap,
      eventLengthBmp^recordingOuptutsBitmap
    ]);
  }
  var updateScreen=function(hardware){
    hardware.sendScreenA("Rec dest");
    hardware.sendScreenB(">"+moduleInstancesArray[selectedModuleNumber].name);
  }
  this.matrixButtonPressed=function(event){
    refreshModuleInstanceNames();
    var hardware=event.hardware;
    if(event.data[0]<moduleInstancesArray.length){
      selectedModuleNumber=event.data[0];
      if(controlledModule.toggleRecordOutput(moduleInstancesArray[selectedModuleNumber])){
        recordingOuptutsBitmap|=1<<selectedModuleNumber;
      }else{
        recordingOuptutsBitmap&=~(1<<selectedModuleNumber);
      }
      updateLeds(hardware);
      updateScreen(hardware);
    }
  };
  this.matrixButtonReleased=function(event){
    var hardware=event.hardware;
  };
  this.selectorButtonPressed=function(event){
    var hardware=event.hardware;
  };
  this.selectorButtonReleased=function(event){
    var hardware=event.hardware;
  };
  this.encoderScrolled=function(event){
    var hardware=event.hardware;
    if(thisInteractor.vars.length>selectedModuleNumber){
      thisInteractor.vars[selectedModuleNumber].value+=event.data[1];
      updateScreen(hardware);
    }
  };
  this.encoderPressed=function(event){
    var hardware=event.hardware;
  };
  this.encoderReleased=function(event){
    var hardware=event.hardware;
  };
  this.engage=function(event){
    var hardware=event.hardware;
    engagedHardwares.add(hardware);
    updateLeds(hardware);
    updateScreen(hardware);
  };
  this.disengage=function(event){
    var hardware=event.hardware;
    engagedHardwares.delete(hardware);
  }
};
module.exports=RecordMenu;