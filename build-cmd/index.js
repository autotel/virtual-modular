'use strict';
/**/console.log("-----------start-------------");

var environment = require('./virtualModularEnvironment').environment;
console.log("W",environment);

var X28Hardware=require('../hardwares-serial/DriverX28v0.js');

var MidiIO = require('../modules-ext/jazz-MidiIO');
MidiIO.setMidiInterface(require('./CmdMidiInterface.js'));
environment.module(MidiIO);

environment.useHardware(X28Hardware);

environment.handle('created');

module.exports = environment;
// return environment;