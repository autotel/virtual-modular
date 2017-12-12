'use strict';
console.log("-----------start-------------");
var onHandlers=require('onhandlers');
/** Environment is the lower-level global scope, objects that have environment can access the hardware, modules and others */
var environment={};

environment.vars={
  light:56,
  advancedRecording:false,
  messagePriority:50,
  interfacePriority:15,
  interfaceMaxStack:15,
}

onHandlers.call(environment);
/** hardwareMan is responsible for the connected user-interaction hardware  */
environment.hardwareMan=require("./hardware/hardwareManager.js")(environment);
/** interactionMan is responsible for relating hardware events to actions in the modular environment */
environment.interactionMan=require("./interaction/interactionManager.js")(environment);
/** modulesMan is responsible for the modular environment */
environment.modulesMan=require("./modules/modulesManager.js")(environment);
environment.handle('created');

//startup actions
try{
  environment.modulesMan.applyProperties(require('./default-patch.js'));
}catch(e){
  console.error("error while loading default patch: ",e);
}
