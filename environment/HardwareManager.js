'use strict';

var SerialHardwareDetector = require('./SerialHardwareDetector.js');
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
    console.log(`Add hardwareConstructors[${Constructor.name}]=${Constructor};`);
    hardwareConstructors[Constructor.name] = Constructor;
  }
  this.list = [];
  // setTimeout(process.exit,500);
  var detector = new SerialHardwareDetector({
    onSerialResponse: function(event) {
      if (event.response.indexOf("28") > -1) {
        var hardwareCreated = new hardwareConstructors.DriverX28v0({
          serial: event.serialPort
        }, environment);
        environment.hardwares.list.push(hardwareCreated);
        return true;
      } else if (event.response.indexOf("16") > -1) {
        var hardwareCreated = new hardwareConstructors.DriverX16v0({
          serial: event.serialPort
        }, environment);
        environment.hardwares.list.push(hardwareCreated);
        return true;
      }
      return false;
    }
  }, environment);
  // environment.on('created',detector.start);
}