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

  this.getModuleWithName=function(name){
    for(var a of modulesList){
      if(a.name==name){
        return a;
      }
    }
  }

  /** @function
  instanciate and register a new module.
  */
  this.addModule=function(moduleName,properties){
    if(!moduleName) moduleName="monoSequencer";
    if(!properties) properties={};
    if(! moduleSingletons[moduleName] ) throw "no module named "+moduleName+" is registered";
    var newInstance=new moduleSingletons[moduleName].Instance(properties);
    modules.push(newInstance);
    environment.handle('module created',{module:newInstance});
    // console.log(modules);
  }
  return this;
})};
module.exports=modulesManager;


