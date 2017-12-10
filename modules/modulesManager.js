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
  var moduleInstances=this.moduleInstances=this.modules=modules;
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
  //this prevents the program from freezing in a case of extreme module feedback
  var lazyStack = new(function() {
    var stackLimit = false;
    var stack = [];
    var interval = 1;
    var tPerStep=50;

    this.enq = function(cb) {
      if(!stack.length)
        setImmediate(deq);
      stack.push(cb);
      if(stack.length>tPerStep){
        console.warn("! EVENTS STACK: "+stack.length+"");
      }
    }
    function deq(){
      let count=0;
      while(stack.length && count<tPerStep){
        (stack.shift())();
        count++
      }
      if(stack.length)
        setImmediate(deq);
    };
  })();

  this.getModuleWithName=function(name){
    // console.log(modules);
    for(var module of modules){
      if(module.name==name){
        return module;
      }
    }
  }
  this.removeModuleN=function(n){
    if(moduleInstances[n].remove()){
      moduleInstances.splice(n,1);
      return true;
    }else{
      return false;
    }
  }
  /** @function
  instanciate and register a new module.
  Two example uses of this function are in the superinteractor, when you create a new module using the buttons, and the midi IO, which creates one module per midi input
  */
  this.addModule=function(moduleName,properties){
    console.log("instancing singleton of module: ",moduleName);
    if(!moduleName) moduleName="unnamed";
    if(!properties) properties={};
    if(!moduleSingletons[moduleName] ) {console.error("module named "+moduleName+" is registered");}
    var newInstance=new moduleSingletons[moduleName].Instance(properties);
    newInstance.enqueue=lazyStack.enq;
    modules.push(newInstance);
    environment.handle('module created',{module:newInstance});
    return newInstance;
  }

  //add the global bus
  this.addModule('bus',{name:"global"});

  this.applyProperties=function(props){
    console.log("Creating modules net:");
    for(var n in props){
      moduleDefinition=props[n];
      var newModule = thisMan.addModule(moduleDefinition.type,moduleDefinition.properties);
      if(!props[n].properties)props[n].properties={};
      props[n].properties.name=newModule.name;
    }
    console.log("patching modules net:");
    for(var moduleDefinition of props){
      // console.log(moduleDefinition.properties.name);
      var module=thisMan.getModuleWithName(moduleDefinition.properties.name);
      console.log(" - patch module \""+moduleDefinition.properties.name+"\" ("+moduleDefinition.type+") ");
      for(var outputName of moduleDefinition.outputs){
        console.log(" - to \""+outputName+"\"");
        try{
          var output=thisMan.getModuleWithName(outputName);
          if(!output)throw "  -couldn't find module named "+outputName
          module.addOutput(output);
        }catch(e){
          // console.log(module);
          console.error(" -could't set output of "+moduleDefinition.properties.name+" to "+outputName+": \n",e);
        }
      }
    }
  }

  return this;
})};
module.exports=modulesManager;


