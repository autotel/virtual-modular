var InteractorBase=require('../Interactor.js');
/**
 base template for interactors when they are x16basic compatible
*/
module.exports=function(controlledModule){
  InteractorBase.call(this);
  this.buttonMatrixPressed=function(event){};
  this.buttonMatrixReleased=function(event){};
  this.buttonMatrixHold=function(event){};
  this.selectorButtonPressed=function(event){};
  this.selectorButtonReleased=function(event){};
  this.encoderScrolled=function(event){};
  this.encoderPressed=function(event){};
  this.encoderReleased=function(event){};
  this.engage=function(event){};
}