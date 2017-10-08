"use strict";
var InteractorBase=require('../Interactor.js');
/**
 base template for interactors when they are x16basic compatible
*/
module.exports=function(controlledModule){
  InteractorBase.call(this);
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