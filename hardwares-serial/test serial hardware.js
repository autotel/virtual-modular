'use strict'
var baudRate = 19200;
var SerialPort = require('serialport');
var openPorts={};


setInterval(function () {
    var listPromise = SerialPort.list(function (err, ports) {
        if (err) {
            console.error(err);
        }
        ports.forEach(function (port) {
            if (!openPorts[port.comName]) {
                let newPort = new SerialPort(port.comName, {
                    baudRate: baudRate
                });
                
                openPorts[port.comName]=newPort;
                new X8Cont(newPort);
                console.log("New Serial Hardware. Name:" + port.comName);
                // console.log(port.pnpId);
                // console.log(port.manufacturer);
            }
        });
    });
    listPromise.catch(function (e) {
        console.log(e);
    });
}, 3000);

var X8Cont=function(serialport){
    // console.log(port);
    serialport.on('data', console.log);
    setInterval(function(){
        serialport.write(new Buffer([0x40]), function (error) {
            if (error) {
                console.log("error sending init val", error);
            }
        });

        serialport.write(new Buffer([0x80,0xcc]), function (error) {
            if (error) {
                console.log("error sending init val", error);
            }
        });
    },1000);
}