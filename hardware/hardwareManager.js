'use strict';
//baudrate is applied to all devices in order to check their type via Serial.
//if a device needed a faster baud, it's controller could implement a negotiation
var baudRate= 19200;
var SerialPort = require('serialport');
const GETVERSION = 0x40;

var hardwareDriverPrototypes={X16v0:require("./driver-X16v0.js")};

var SerialPort = require('serialport');
/**
Hardware manager
*/
module.exports=(function(environment){
  environment.hardwares=[];

  var listPromise=SerialPort.list(function (err, ports) {
    if(err){
      console.error(err);
    }
    ports.forEach(function(port) {
      try{
        console.log(port.comName);
        console.log(port.pnpId);
        console.log(port.manufacturer);
        // portNameList.push(port.comName);
        createHardwareController(port.comName);
        // comName=port.comName;
      }catch(e){
        console.error(e);
      }
    });
  });
  listPromise.catch(function(e){console.log(e);});
  //https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise/catch

/**
Pendant: detect the hardware type
*/
  function createHardwareController(portName){
    var err=0;
    let newPort = new SerialPort(portName, {
      baudRate: baudRate
    });

  //  console.log("newPort",newPort);
      console.log('creating hardware controller');
      environment.hardwares.push(new hardwareDriverPrototypes.X16v0(environment,{serial:newPort}));

  }
});

