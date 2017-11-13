"use strict";
var myInteractorBase=require('./interactorBase.js');
var SuperInteractorSingleton=require('./superInteractor.js');
/**
each hardware needs a interface definition. The interface definition is instanced only once per run, and there is one different interface per each hardware. The interface instances the SuperInteractorSingleton, and provides the SuperInteractor constructor to the {@link interactionManager}. This avoids having to load one interactorBase, and one SuperInteractor for each different hardware that could exist.
*/
module.exports=(function(environment){
  /**
  definition of the base for interactors to be .called(this) on every interactor
  */
  this.interactorBase=myInteractorBase;
  /**
  my SuperInteractor singleton
  */
  this.superInteractorSingleton=new SuperInteractorSingleton(environment);
  this.SuperInteractor=this.superInteractorSingleton.SuperInteractor;
})