'use strict';
console.log("-----------start-------------");
const onHandlers=require('onhandlers');
/** Environment is the lower-level global scope, objects that have environment can access the hardware, modules and others */
var environment={};
onHandlers.call(environment);
/** hardwareMan is responsible for the connected user-interaction hardware  */
environment.hardwareMan=require("./hardware/hardwareManager.js")(environment);
/** interactionMan is responsible for relating hardware events to actions in the modular environment */
environment.interactionMan=require("./interaction/interactionManager.js")(environment);
/** modulesMan is responsible for the modular environment */
environment.modulesMan=require("./modules/modulesManager.js")(environment);
