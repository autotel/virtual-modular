"use strict";
//this module handles what happen when there is a hardware event (such as pressing a button)
let onHandlers=require('onhandlers');
let X16bs=require('./x16basic');
let X28bs=require('./x28basic');
let DefCli=require('./defcli');

/**
InteractionManager contains a list of all the running instances of {@link HardwareDriver}s and links them to instances of {@link superInteractorPrototypes} and {@link Interactor}s
*/
var interactionManager=function(environment){ return new(function(){
  var interfaces=({});
  this.interfaces=interfaces;
  //entry interactors are the interactors that each hardware will use as starting point. they define how to patch and access modules
  var superInteractorSingletons=[];
  var superInteractorInstances=[];
  var moduleInteractorSingletons=[];
  var moduleInteractorInstances=[];
  //create the interface element and register it's singleton
  interfaces.x16basic=new X16bs(environment);
  superInteractorSingletons.push(interfaces.x16basic.superInteractorSingleton);
  interfaces.x28basic=new X28bs(environment);
  superInteractorSingletons.push(interfaces.x28basic.superInteractorSingleton);
  interfaces.DefCli=new DefCli(environment);
  superInteractorSingletons.push(interfaces.x28basic.superInteractorSingleton);
  /**
    @function
    called by a hardwareManager: when there is a new hardware connected, it is associated with a {@link superInteractor}
    @param {string} type specifies the SuperInteractor constructor to call
    @param {Object} HardwareDriver instance. The hardware to which to assign this SuperInteractor
  */
  this.newSuperInteractor=function(type,hardware){
    var ret=new interfaces[type].SuperInteractor(hardware);
    // console.log("...",ret);
    superInteractorInstances.push(ret);
    return ret;
  };

/**
  @param {prototype} interactorSingleton the constructor for the interactor's singleton. Every interactor needs a parent singleton, that is called by the interactionManager. It is called passing the environment as parameter, allowing all the interactors to share the environment. Some other initialization functions could be called in this construction according to the interactor needs.
*/
  this.appendInteractorSingleton=function(interactorSingleton){
    moduleInteractorSingletons.push(interactorSingleton);
  }

  environment.on('module created',function(evt){
    var newInteractor=evt.module.interactor;
    moduleInteractorInstances.push(newInteractor);
    for(var sis of superInteractorSingletons){
      sis.appendModuleInteractor(newInteractor);
    }
  })
  return this;
})};
module.exports=interactionManager;