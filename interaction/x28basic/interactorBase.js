"use strict";
var InteractorBase=require('../Interactor.js');
/**
 base template for interactors when they are x16basic compatible
*/
var x28InteractorBase=function(controlledModule){
  var thisInteractor=this;

  var thisInteractor=this;
  this.controlledModule=controlledModule;
  InteractorBase.call(this,controlledModule);
  this.compatibilityTags=["x28v0"];
  // console.log(".....",this.compatibilityTags);
  this.matrixButtonPressed=function(event){};
  this.matrixButtonReleased=function(event){};
  this.matrixButtonHold=function(event){};
  this.matrixButtonVelocity=function(event){};
  this.selectorButtonPressed=function(event){};
  this.selectorButtonReleased=function(event){};
  this.encoderScrolled=function(event){};
  this.encoderPressed=function(event){};
  this.encoderReleased=function(event){};
  this.engage=function(event){};
  this.disengage=function(event){}
  this.outsideScroll=function(event){};
}
module.exports=x28InteractorBase;