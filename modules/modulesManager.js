"use strict";
var modulesList=require('./modulesList');
var moduleSingletons={};
var modules=[];

/**
@constructor
ModulesManager is a singleton that manages the pattern modifying modules.
*/
var modulesManager=function(environment){ return new(function(){
  console.log("-modulesManager");
  for(var a in modulesList){
    try{
      console.log(" -"+a+" module available");
      moduleSingletons[a]=require(modulesList[a])(environment);
      environment.interactionMan.appendInteractorSingleton(
        moduleSingletons[a].InteractorSingleton);
    }catch(e){
      console.error(" -"+a+" module is not valid:",e);
    }
  }
  /** @function
  instanciate and register a new module.
  */
  this.addModule=function(){
    var newInstance=new moduleSingletons.monoSequencer.Instance(environment)
    modules.push(newInstance);
    environment.handle('module created',{module:newInstance});
    // console.log(modules);
  }
  return this;
})};
module.exports=modulesManager;


