'use strict';
/**/console.log("-----------start-------------");

var environment = require('./virtualModularEnvironment').environment;
console.log("W",environment);

var X28Hardware=require('../hardwares-serial/DriverX28v0.js');
var Http = require('../hardwares-http/hardware.js');

var MidiIO = require('../modules-ext/jazz-MidiIO');
MidiIO.setMidiInterface(require('./CmdMidiInterface.js'));
environment.module(MidiIO);

environment.useHardware(Http);
environment.useHardware(X28Hardware);

environment.handle('created');

setTimeout(function () {
    try {
        environment.modules.applyProperties(require('../patches/default-patch.js'));
    } catch (e) {
        console.error("error while loading default patch: ", e);
    }
}, 100);


module.exports = environment;
// return environment;