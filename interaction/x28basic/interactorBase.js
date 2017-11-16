"use strict";
var InteractorBase=require('../Interactor.js');
/**
 base template for interactors when they are x16basic compatible
*/
var x16InteractorBase=function(controlledModule){
  var thisInteractor=this;
  this.controlledModule=controlledModule;
  InteractorBase.call(this,controlledModule);
  this.compatibilityTags=["x32v0"];
  // console.log(".....",this.compatibilityTags);
  this.matrixButtonPressed=function(event){};
  this.matrixButtonReleased=function(event){};
  this.matrixButtonHold=function(event){};
  this.selectorButtonPressed=function(event){};
  this.selectorButtonReleased=function(event){};
  this.encoderScrolled=function(event){};
  this.encoderPressed=function(event){};
  this.encoderReleased=function(event){};
  this.engage=function(event){};
  this.disengage=function(event){}
}
module.exports=x16InteractorBase;