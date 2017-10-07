//this module handles what happen when there is a hardware event (such as pressing a button)
let onHandlers=require('onhandlers');
let X16bs=require('./x16basic');

/**
InteractionManager contains a list of all the running instances of {@link HardwareDriver}s and links them to instances of {@link superInteractorPrototypes} and {@link Interactor}s
*/
var interactionManager=function(environment){
  var interfaces=this.interfaces={}
  interfaces.x16basic=this.interfaces.x16basic=new X16bs(environment);

  //entry interactors are the interactors that each hardware will use as starting point. they define how to patch and access modules
  var SuperInteractorPrototypes;
  var superInteractorInstances=[];

  this.newSuperInteractor=function(type,hardware){
    var ret=new interfaces[type].SuperInteractor(hardware);
    superInteractorInstances.push(ret);
    return ret;
  };
  this.registerInteractor=function(interactorSingleton){
    interactorSingleton(environment);
  }
  return this;
};
module.exports=interactionManager;