"use strict";
var InteractorBase=require('../Interactor.js');
/**
 base template for interactors when they are x16basic compatible
*/
var DefCLiInteractor=function(controlledModule){
  var thisInteractor=this;
  this.controlledModule=controlledModule;
  InteractorBase.call(this,controlledModule);
  this.compatibilityTags=["cli"];
  this.commandInput=function(){}
  this.engage=function(event){};
  this.disengage=function(event){}
}
module.exports=DefCLiInteractor;