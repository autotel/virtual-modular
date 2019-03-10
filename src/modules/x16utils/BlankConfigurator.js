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

  this.name="";
  var thisInteractor=this;


  this.addVars=function(nvars){
    var defaultIntChangeFunction=function(thisVar,delta){
      thisVar.value+=delta;
    }
    var defaultBoolChangeFunction=function(thisVar,delta){
      if(thisVar.value==true){
        thisVar.value=false
      }else{
        thisVar.value=true
      }
    }
    var defaultSelectFunction=function(thisVar){
    }
    var defaultDisengageFunction=function(thisVar){
    }
    var defaultNameFunction=function(thisVar){
      return "to "+thisVar.value;
    }
    for(var a in nvars){
      if(nvars[a]==undefined) throw `error while adding vars to a BlankConfigurator: vars[${a}] is undefined`;

      switch (typeof nvars[a].value) {
        case "boolean":
            if(nvars[a].changeFunction===undefined) nvars[a].changeFunction=defaultBoolChangeFunction;
          break;
        default:
          if(nvars[a].changeFunction===undefined) nvars[a].changeFunction=defaultIntChangeFunction;

      }

      if(nvars[a].disengageFunction===undefined) nvars[a].disengageFunction=defaultDisengageFunction;
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
  var selectedVarNumber={};

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
  function getSelectedVar(hardware){
    if(!selectedVarNumber[hardware.instanceNumber]) selectedVarNumber[hardware.instanceNumber]=0;
    return thisInteractor.vars[varNames[selectedVarNumber[hardware.instanceNumber]]]
  }
  function passiveUpdateHardware(){
    for(var hardware of engagedHardwares){
      updateScreen(hardware);
      updateLeds(hardware);
    }
  }
  var updateLeds=function(hardware){
    var selectBmp=1<<selectedVarNumber[hardware.instanceNumber];
    var eventLengthBmp=~(0xFFFF<<varNames.length);
    hardware.draw([
      selectBmp|eventLengthBmp,
      selectBmp,
      selectBmp|eventLengthBmp
    ]);
  }
  function updateScreen(hardware){
    // console.log(thisInteractor.vars);
    var selectedVar=getSelectedVar(hardware);
    hardware.sendScreenA(varNames[selectedVarNumber[hardware.instanceNumber]]);
    hardware.sendScreenB(selectedVar.nameFunction(selectedVar));
  }
  // this.select=function(n,update = true){
  //   selectedVarNumber[hardware.instanceNumber]=n;
  //   if(update)
  //   passiveUpdateHardware();
  // }
  this.matrixButtonPressed=function(event){
    var hardware=event.hardware;
    if(event.data[0]<varNames.length){
      selectedVarNumber[hardware.instanceNumber]=event.data[0];
      var selectedVar=getSelectedVar(hardware);
      selectedVar.selectFunction(selectedVar);
      updateLeds(hardware);
      updateScreen(hardware);
    }
  };
  this.encoderScrolled=function(event){
    var hardware=event.hardware;
    // console.log("a");
    if(varNames.length>selectedVarNumber[hardware.instanceNumber]){
      // console.log("b");
      var thisVar=getSelectedVar(hardware);
      // console.log(thisVar);
      thisVar.changeFunction(thisVar,event.delta,event);
      updateScreen(hardware);
    }
  };
  // this.setCurrentVarValue=function(to){
  //   if(varNames.length>selectedVarNumber[hardware.instanceNumber]){
  //     var thisVar=getSelectedVar(hardware);
  //     var delta=thisVar.value-to;
  //     thisVar.changeFunction(thisVar,delta);
  //     passiveUpdateHardware();
  //   }
  // }
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
    var svar=getSelectedVar(hardware)
    svar.selectFunction(svar);
    updateLeds(hardware);
    updateScreen(hardware);
  };
  this.disengage=function(event){
    var hardware=event.hardware;
    var svar=getSelectedVar(hardware);
    if(svar)
    svar.disengageFunction(svar);
    if(properties.disengageFunction){
      properties.disengageFunction(thisInteractor);
    }
    var hardware=event.hardware;
    engagedHardwares.delete(hardware);
  }
};
module.exports=BlankConfigurator;
