'use strict';
var MyInteractorBase=require('../../interaction/x16basic/interactorBase.js');
/**
user interface pattern that allows to tweak parameters
@param {interactor} parentInteractor the module interactor that posesses this
@param {Object} properties {values:{@link array}(deep copy),name:{@link String},varNames:{@link Array} (shallow copy)},
@param {Object} vars the tree of variables that one wants to assign to this controller. The tree is shallow-copied, and each var value is not in the var directly, but in the var.value, otherwise the reference would be lost (same way as in tween.js). This also allows to attach additional parameters such as "onValueChange" function and the so
*/
var BlankConfigurator=function(parentInteractor,properties){

  MyInteractorBase.call(this);

  this.vars={};
  var varNames=[];

  this.name="set";
  var thisInteractor=this;


  this.addVars=function(nvars){
    var defaultChangeFunction=function(thisVar,delta){
      thisVar.value+=delta;
    }
    var defaultSelectFunction=function(thisVar){
    }
    var defaultNameFunction=function(thisVar){
      return "°"+thisVar.value
    }
    for(var a in nvars){
      if(nvars[a].changeFunction===undefined) nvars[a].changeFunction=defaultChangeFunction;
      if(nvars[a].selectFunction===undefined) nvars[a].selectFunction=defaultSelectFunction;
      if(nvars[a].nameFunction===undefined) nvars[a].nameFunction=defaultNameFunction;
      thisInteractor.vars[a]=nvars[a];
    }
    watchvarNames();
  }
  if(properties.variables){
    thisInteractor.addVars(properties.variables);
  }if(properties.vars){
    thisInteractor.addVars(properties.vars);
  }
  function watchvarNames(){
    varNames=Object.keys(thisInteractor.vars);
  }
  if(properties.name) this.name=properties.name;
  var selectedVarNumber=0;

  var engagedHardwares=new Set();

  if(properties.values){
    this.vars=properties.values;
  }

  // var valueChanged=function(){
  //   //value can change while not engaged
  //   for (let hardware of engagedHardwares) {
  //     updateLeds(hardware);
  //   }
  // }
  function getSelectedVar(){
    return thisInteractor.vars[varNames[selectedVarNumber]]
  }
  function passiveUpdateHardware(){
    for(var hardware of engagedHardwares){
      updateScreen(hardware);
      updateLeds(hardware);
    }
  }
  var updateLeds=function(hardware){
    var selectBmp=1<<selectedVarNumber;
    var eventLengthBmp=~(0xFFFF<<varNames.length);
    hardware.draw([
      selectBmp|eventLengthBmp,
      selectBmp,
      selectBmp|eventLengthBmp
    ]);
  }
  function updateScreen(hardware){
    // console.log(thisInteractor.vars);
    var selectedVar=getSelectedVar();
    hardware.sendScreenA(thisInteractor.name+" "+varNames[selectedVarNumber]);
    hardware.sendScreenB(selectedVar.nameFunction(selectedVar));
  }
  this.select=function(n,update = true){
    selectedVarNumber=n;
    if(update)
    passiveUpdateHardware();
  }
  this.matrixButtonPressed=function(event){
    var hardware=event.hardware;
    if(event.data[0]<varNames.length){
      selectedVarNumber=event.data[0];
      var selectedVar=getSelectedVar();
      updateLeds(hardware);
      updateScreen(hardware);
      selectedVar.selectFunction(selectedVar);
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
    // console.log("a");
    if(varNames.length>selectedVarNumber){
      // console.log("b");
      var thisVar=getSelectedVar();
      // console.log(thisVar);
      thisVar.changeFunction(thisVar,event.data[1]);
      updateScreen(hardware);
    }
  };
  this.setCurrentVarValue=function(to){
    if(varNames.length>selectedVarNumber){
      var thisVar=getSelectedVar();
      var delta=thisVar.value-to;
      thisVar.changeFunction(thisVar,delta);
      passiveUpdateHardware();
    }
  }
  this.encoderPressed=function(event){
    var hardware=event.hardware;
  };
  this.encoderReleased=function(event){
    var hardware=event.hardware;
  };
  this.engage=function(event){
    var hardware=event.hardware;
    engagedHardwares.add(hardware);
    if(properties.engageFunction){
      properties.engageFunction(thisInteractor);
    }
    updateLeds(hardware);
    updateScreen(hardware);
  };
  this.disengage=function(event){
    var hardware=event.hardware;
    engagedHardwares.delete(hardware);
  }
};
module.exports=BlankConfigurator;