'use strict';
console.log("-----------start-------------");
/** Environment is the lower-level global scope, objects that have environment can access the hardware, modules and others */
var environment = new(require('./environment'))();

var Bus = require('./modules/bus');
//
environment.vars={
  light:56,
  advancedRecording:false,
  messagePriority:50,
  interfacePriority:15,
  interfaceMaxStack:15,
}

/** hardwareMan is responsible for the connected user-interaction hardware  */
environment.hardwareMan=require("./hardware/hardwareManager.js")(environment);
/** interactionMan is responsible for relating hardware events to actions in the modular environment */
environment.interactionMan=require("./interaction/interactionManager.js")(environment);
/** modulesMan is responsible for the modular environment */
// environment.modulesMan=require("./modules/modulesManager.js")(environment);
environment.handle('created');
environment.module(Bus);
//add the global bus
environment.modules.instantiate('Bus',{name:"global"});

//startup actions
// try{
//   environment.modules.applyProperties(require('./default-patch.js'));
// }catch(e){
//   console.error("error while loading default patch: ",e);
// }
module.exports=environment;
