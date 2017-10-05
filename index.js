'use strict';
// const onHandlers=require('onhandlers');
var environment={};
// onHandlers.call(environment);
environment.hardwareMan=require("./hardware")(environment);
environment.interactionMan=require("./interactionManager")(environment);
environment.modulesMan=require("./modules")(environment);
