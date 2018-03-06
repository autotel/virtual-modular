'use strict';
/**/console.log("-----------start-------------");

var X28Hardware=require('./hardwares/DriverX28v0.js');
var X16Hardware=require('./hardwares/DriverX16v0.js');
var Http=require('./hardwares/Driver-http.js');

/** Environment is the lower-level global scope, objects that have environment can access the hardware, modules and others */
var environment = new(require('./environment'))();
environment.useHardware(X28Hardware);
environment.useHardware(Http);

var modulesToLoad = {
  'Bus': {},
  'ClockGenerator': {},
  'Operator': {},
  'MidiIO': {},
  'Harmonizer': {},
  'PresetKit': {},
  'Narp': {},
  'GameOfLife': {},
  'Arpeggiator': {},
  'MultiTape': {},
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