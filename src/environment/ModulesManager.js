"use strict";
// var modulePrototypesList=require('./modulePrototypesList');
var utils = require('./utils');
var ModuleInstanceBase = require('./ModuleInstanceBase');
/**
@constructor
ModulesManager manages the pattern modifying modules.
*/
var ModulesManager = function (environment) {
  var modules = this.list = [];
  var constructors = {};

  var thisMan = this;
  console.log("+ modulesManager");
  environment.handle('+modulesManager', this);
  this.addConstructor = function (Constructor) {
    console.log("modules constructor add " + Constructor.name, "color", Constructor.color);
    // console.log("instancing module: ",moduleName);
    try {
      // if(!moduleName) moduleName="unnamed";
      // if(!properties) properties={};
      if (constructors[Constructor.name]) { console.error("module named " + Constructor.name + " is registered"); }

    } catch (e) {
      console.error("error registering a module named " + Constructor.name, e);
    }
    constructors[Constructor.name] = Constructor;
  }
  this.getRegistered = function () {
    return constructors;
  }
  this.getModuleConstructors = function () {
    return constructors;
  }


  //this prevents the program from freezing in a case of extreme module feedback
  var lazyQueue = new utils.LazyQueue();

  this.getModuleWithName = function (name) {
    // console.log(modules);
    for (var module of modules) {
      if (module.name == name) {
        return module;
      }
    }
  }
  this.tryGetN = function (n) {
    if (this.list[n]) {
      return this.list[n];
    }
    return false;
  }
  this.removeModule = function (mod) {
    if (mod.remove()) {
      modules.splice(modules.indexOf(mod), 1);
      environment.handle('-module', { module: mod });
      return true;
    } else {
      return false;
    }
  }
  this.removeModuleN = function (n) {
    if (modules[n].remove()) {
      modules.splice(n, 1);
      environment.handle('-module', { module: modules[n] });
      return true;
    } else {
      return false;
    }
  }
  /** @function
  instanciate and register a new module.
  Two example uses of this function are in the superinteractor, when you create a new module using the buttons, and the midi IO, which creates one module per midi input
  */
  this.instantiate = function (moduleName, properties = {}, callback = false) {
    var newInstance = false;
    try {
      console.log("+module " + moduleName);
      newInstance = new ModuleInstanceBase(properties, environment)
      constructors[moduleName].call(newInstance, properties, environment);
      newInstance.enqueue = lazyQueue.enq;
      newInstance.type = moduleName;
      if (constructors[moduleName].color) {
        newInstance.color = constructors[moduleName].color;
      }
      modules.push(newInstance);
      if (typeof callback === "function") {
        callback(newInstance);
      }
      environment.handle('+module', { module: newInstance });

    } catch (e) {
      console.error("error instantiating module ", moduleName, e);
    }
    return newInstance;
  }


  this.applyProperties = function (props) {
    console.log("Creating modules net:");
    for (var n in props) {
      moduleDefinition = props[n];
      var newModule = thisMan.instantiate(moduleDefinition.type, moduleDefinition.properties);
      if (!props[n].properties) props[n].properties = {};
      props[n].properties.name = newModule.name;
    }
    console.log("patching modules net:");
    for (var moduleDefinition of props) {
      // console.log(moduleDefinition.properties.name);
      var module = thisMan.getModuleWithName(moduleDefinition.properties.name);
      console.log(" - patch module \"" + moduleDefinition.properties.name + "\" (" + moduleDefinition.type + ") ");

      if (moduleDefinition.outputs) for (var outputName of moduleDefinition.outputs) {
        console.log(" - to \"" + outputName + "\"");
        try {
          var output = thisMan.getModuleWithName(outputName);
          if (!output) throw "  -couldn't find module named " + outputName
          module.addOutput(output);
        } catch (e) {
          // console.log(module);
          console.error(" -could't set output of " + moduleDefinition.properties.name + " to " + outputName + ": \n", e);
        }
      }
    }
  }
  return this;
};
module.exports = ModulesManager;


