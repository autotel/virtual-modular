'use strict';
console.log("-----------start-------------");

var X28Hardware=require('./hardwares/DriverX28v0.js');
var X16Hardware=require('./hardwares/DriverX16v0.js');

/** Environment is the lower-level global scope, objects that have environment can access the hardware, modules and others */
var environment = new(require('./environment'))();
environment.useHardware(X28Hardware);

/**
TODO:
hardwaremanager should be part of environment and should in index like:

var environment=require('./environment');
var SerialHardware=require('SerialHardware');
SerialHardware.add(require('./SerialHardware-x16'));
SerialHardware.add(require('./SerialHardware-x28'));
CLI=require('CLI');

environment.useHardware(SerialHardware);
environment.useHardware(CLI);

also interactionManager

*/

/** interactionMan is responsible for relating hardware events to actions in the modular environment */
environment.interactionMan = require("./interaction/interactionManager.js")(environment);



var modulesToLoad = {
  'Bus': {},
  'ClockGenerator': {},
  'GameOfLife': {},
  'Harmonizer': {},
  'MidiIO': {},
  'MultiTape': {},
  'Narp': {},
  'PresetKit': {},
  'Sequencer': {},
};
for (var a in modulesToLoad) {
  console.log("requiring module " + a);
  modulesToLoad[a] = require('./modules/' + a);
}
//
environment.vars = {
  light: 56,
  advancedRecording: false,
  messagePriority: 50,
  interfacePriority: 15,
  interfaceMaxStack: 15,
}

/** modulesMan is responsible for the modular environment */
// environment.modules=require("./modules/modulesManager.js")(environment);
for (var a in modulesToLoad) {
  environment.module(modulesToLoad[a]);
  //  for testing
  // environment.modules.instantiate(a, {});
}
environment.modules.instantiate('Bus',{name:"global"});

setTimeout(function(){
  try{
    environment.modules.applyProperties(require('./default-patch.js'));
  }catch(e){
    console.error("error while loading default patch: ",e);
  }
},100);

environment.handle('created');


module.exports = environment;