"use strict";
var modulePrototypesList=require('./modulePrototypesList');
var moduleSingletons={};
var modules=[];

/**
@constructor
ModulesManager is a singleton that manages the pattern modifying modules.
*/
var modulesManager=function(environment){ return new(function(){
  var thisMan=this;
  console.log("-modulesManager");
  this.modulePrototypesList=modulePrototypesList;
  for(var a in modulePrototypesList){
    try{
      console.log(" - initializing module \""+a+"\" ");
      moduleSingletons[a]=require(modulePrototypesList[a])(environment);
      environment.interactionMan.appendInteractorSingleton(moduleSingletons[a].InteractorSingleton);
    }catch(e){
      delete moduleSingletons[a];
      moduleSingletons["(X)"+a]=false;
      console.error('\x1b[33m - "'+a+'" module is not valid:\x1b[0m\n',e);
    }
  }

  this.getModuleWithName=function(name){
    // console.log(modules);
    for(var module of modules){
      if(module.name==name){
        return module;
      }
    }
  }

  /** @function
  instanciate and register a new module.
  */
  this.addModule=function(moduleName,properties){
    console.log("instancing singleton of module: ",moduleName);
    if(!moduleName) moduleName="unnamed";
    if(!properties) properties={};
    if(!moduleSingletons[moduleName] ) {console.error("module named "+moduleName+" is registered");}
    var newInstance=new moduleSingletons[moduleName].Instance(properties);
    modules.push(newInstance);
    environment.handle('module created',{module:newInstance});
    // console.log(modules);
    console.log("TODO: allow module names to be custom");
    return newInstance;
  }
  this.applyProperties=function(props){
    console.log("Creating modules net:");
    for(var module of props){
      thisMan.addModule(module.type,module.properties);
    }
    for(var moduleDefiner of props){
      // console.log(moduleDefiner.properties.name);
      var module=thisMan.getModuleWithName(moduleDefiner.properties.name);
      for(var outputName of moduleDefiner.outputs){
        try{
          var output=thisMan.getModuleWithName(outputName);
          if(!output)throw "  -couldn't find module named "+outputName
          module.addOutput(output);
        }catch(e){
          console.log(module);
          console.error(" -could't set output of "+moduleDefiner.properties.name+" to "+outputName+": \n",e);
        }
      }
    }
  }

  return this;
})};
module.exports=modulesManager;


