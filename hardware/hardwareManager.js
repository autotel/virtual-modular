'use strict';
//baudrate is applied to all devices in order to check their type via Serial.
//if a device needed a faster baud, it's controller could implement a negotiation
var baudRate= 19200;
var SerialPort = require('serialport');
const GETVERSION = 0x40;

var hardwareDriverPrototypes={
  X16v0:require("./driver-x16v0.js"),
  X28v0:require("./driver-x28v0.js"),
  Defcli:require("./driver-defcli.js")
};

var SerialPort = require('serialport');
/**
Hardware manager
*/
module.exports=(function(environment){
  environment.on('created',init);
  function init(){
    environment.hardwares=[];
    //open virtual user-interfaces
    environment.hardwares.push(new  hardwareDriverPrototypes.Defcli(environment,{/*perhaps we can have several cli's over LAN*/}));
    //open Serial hardware interfaces
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

    function createHardwareController(portName){
      var err=0;
      let newPort = new SerialPort(portName, {
        baudRate: baudRate
      });
      newPort.on('open', function() {

        //now we communicate with the serial device to define what kind of hardware controller to use
        //connect, request the hardware version, and expect it's response
        var alreadyCreated=false;
        var getVersionInterval;
        //note that this data listener is only to get the version number
        newPort.on('data', (data) => {
          if(!alreadyCreated){
            if(!getVersionInterval){
              getVersionInterval=setInterval(function(){
                newPort.write(new Buffer([0x40]),function(error){
                  if(error){ console.log("error sending init val",error); }
                });
                console.log("req");
              },500);
            }

            try{
              var string="";
              var started=false;
              var finished=false;
              var hardwareCreated=false;
              for (var i = 0; i < data.length && !finished; i++) {
                if(started){
                  string += String.fromCharCode(parseInt(data[i]));
                }else{
                  string="";
                  started = (data[i]==0x40);
                }
                if(data[i]==3){
                  finished=true;
                }
              }
              console.log(string);
              if(data.indexOf("28")>-1){
                clearInterval(getVersionInterval);
                alreadyCreated=true;
                console.log('creating hardware controller');
                hardwareCreated=new hardwareDriverPrototypes.X28v0(environment,{serial:newPort});
                environment.hardwares.push(hardwareCreated);
              }else if(data.indexOf("16")>-1){
                clearInterval(getVersionInterval);
                alreadyCreated=true;
                console.log('creating hardware controller');
                hardwareCreated=new hardwareDriverPrototypes.X16v0(environment,{serial:newPort});
                environment.hardwares.push(hardwareCreated);
              }
            }catch(e){
              console.error(e);
            }
          }
        });
      });
    }
  }
});

