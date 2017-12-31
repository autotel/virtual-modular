"use strict";
var onHandlers=require('onhandlers');
/**
@typedef {Object} SuperInteractor are the interactors that ultimately receive the events from the hardware and forward these events to the corresponding interactor. It also defines the interaction pattern when there is no Interactor engaged (e.g. at the start)
@typedef {Object} Interactor are the patterns of interaction that will most likely be designed by users. They serve to produce changes in some {@link Module}s. They have a specific definition of compatible hardware interfaces.
*/
var interactorBase=function(controlledModule){
  onHandlers.call(this);
  this.compatibilityTags=[];
  this.name="empty interactor";
  this.type="interactor";
  this.controlledModule=controlledModule;
}
module.exports=interactorBase;