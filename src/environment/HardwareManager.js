'use strict';

//
// var hardwareDriverPrototypes={
//   X16v0:require("../hardwares/driver-x16v0.js"),
//   X28v0:require("../hardwares/driver-x28v0.js"),
//   Defcli:require("../hardwares/driver-defcli.js")
// };

var SerialPort = require('serialport');
/**
Hardware manager
*/
module.exports = function(environment) {
  var hardwareConstructors = {};
  this.addConstructor = function(Constructor) {
    // console.log(`Add hardwareConstructors[${Constructor.name}]=${Constructor};`);
    hardwareConstructors[Constructor.name] = Constructor;
  }
  this.list = [];
  // setTimeout(process.exit,500);

  // environment.on('created',detector.start);
}