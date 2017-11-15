"use strict";
var InteractorBase=require('../Interactor.js');
/**
 base template for interactors when they are x16basic compatible
*/
var x16InteractorBase=function(controlledModule){
  var thisInteractor=this;
  InteractorBase.call(this,controlledModule);
  this.compatibilityTags=["x32v0","x16v0"];
  // console.log(".....",this.compatibilityTags);
  this.matrixButtonPressed=function(event){};
  this.matrixButtonReleased=function(event){};
  this.matrixButtonVelocity=function(event){};
  this.matrixButtonHold=function(event){};
  this.selectorButtonPressed=function(event){};
  this.selectorButtonReleased=function(event){};
  this.bottomButtonPressed=function(event){};
  this.bottomButtonReleased=function(event){};
  this.encoderScrolled=function(event){};
  this.encoderPressed=function(event){};
  this.encoderReleased=function(event){};
  this.engage=function(event){};
  this.disengage=function(event){}
}
module.exports=x16InteractorBase;