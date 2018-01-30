var Observable=require('onhandlers');

var ModulesManager=require('./ModulesManager');

var HardwareManager=require("./HardwareManager.js");
var utils=require('./utils.js');
var requireProperties=utils.requireProperties;

var Environment=function(){
  Observable.call(this);
  var self=this;
  this.on('a',console.log)

  /**
  TODO:
  interactionMan is not yet re-structured. do a project search of interactionmanager and see how to get nobody to depend on it.

   interactionMan is responsible for relating hardware events to actions in the modular environment */
  this.interactionMan = require("../interaction/interactionManager.js")(this);

  var modules=this.modules=new ModulesManager(this);

  this.module=function(Constructor){
    var fails=requireProperties.call(Constructor,['name','constructor']);
    if(fails){
      console.error("a module couldn't be added because of problems the properties:",fails);
      return;
    }else{
      console.log("added module",Constructor.name);
    }
    if(typeof Constructor.initialization==="function"){
      Constructor.initialization(self);
    }
    modules.addConstructor(Constructor);
    return this;
  }

  var hardwares=this.hardwares= new HardwareManager(this);

  this.useHardware=function(Constructor){
    var fails=requireProperties.call(Constructor,['name','constructor']);
    if(fails){
      console.error("a module couldn't be added because of problems the properties:",fails);
      return;
    }else{
      console.log("added hardware",Constructor.name);
    }
    if(typeof Constructor.initialization==="function"){
      Constructor.initialization(self);
    }
    hardwares.addConstructor(Constructor);
    return this;
  }
}



module.exports=Environment;