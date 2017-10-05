'use strict';
//baudrate is applied to all devices in order to check their type via Serial.
//if a device needed a faster baud, it's controller could implement a negotiation
var baudRate= 115200;
var SerialPort = require('serialport');
const GETVERSION = 0x40;
var hardware_prototypes={x16v0:require("./x16v0.js")};
var SerialPort = require('serialport');

module.exports=(function(environment){
  environment.hardwares=[];
  // console.log(environment);
  // var portNameList=[];
  SerialPort.list(function (err, ports) {
    if(err){
      console.error(err);
    }
    ports.forEach(function(port) {
      console.log(port.comName);
      console.log(port.pnpId);
      console.log(port.manufacturer);
      // portNameList.push(port.comName);
      try{
        createHardwareController(port.comName);
      }catch(e){
        console.error(e);
      }
    });
  });

  // for(var a of portNameList){
  // }

  function createHardwareController(portName){
    var err=0;
    let newPort = new SerialPort(portName, {
      baudRate: baudRate
    });
    newPort.on('error', (error) => {
      throw error
    });
    // setTimeout(function(){
    // newPort.write(new Buffer([GETVERSION]), function() {
      // if (err) {
        // return console.log('Error on hardware detection: ', err.message);
      // }
      /*
      TODO: multi-device loading
      open the port
      write a hello message to the port
      if there is an answer  that contains a hardware name and version
        create a hardware controller for that serial port
      else
        just log a message that the listed port is not a compatible device
        */
      //for now, just stupidly connect to any serial assuming it is one hardware

      console.log('creating hardware controller');
      environment.hardwares.push(new hardware_prototypes.x16v0(environment,{serial:newPort}));

    // });
    // },3000);
  }
});

