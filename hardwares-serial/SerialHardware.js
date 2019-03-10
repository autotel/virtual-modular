'use strict'
var utils = require('./utils.js');
var SerialHardwareDetector = require('./SerialHardwareDetector.js');
var requireProperties = utils.requireProperties;
var LazyQueue = utils.LazyQueue;


var DataChopper = function(rLengths) {
  var inBuff=new Buffer(1);
  var expectedLength;
  var byteNumber = 0;
  var recordingBuffer = false;
  this.wholePacketReady = function(packet) {
    // console.log("packet ready",packet);
  }
  this.incom = function(data) {
    for (var a = 0; a < data.length; a++) {
      if (!recordingBuffer) {
        //we are expecting a message header, so we check what header current byte is
        //if is successfull, we start gathering or recording a new data packet.

        //byte  is in our header list?
        recordingBuffer = rLengths[data[a]] !== undefined;
        if (recordingBuffer) {
          // console.log(rLengths[data[a]]);
          expectedLength = rLengths[data[a]];
          if (rLengths[data[a]] != -1)
            expectedLength += 1;
          inBuff = new Buffer(expectedLength);
          byteNumber = 0;
        }
        if (expectedLength == -1 && a > 0) {
          expectedLength = data[a];
        }
      }
      if (recordingBuffer) {
        if (byteNumber < expectedLength - 1) {
          //a new byte arrived and is added to the current packet
          inBuff[byteNumber] = data[a];
          byteNumber++;
        } else {
          //a whole expected packet arrived
          inBuff[byteNumber] = data[a];
          this.wholePacketReady(inBuff);
          recordingBuffer = false;
          // console.log(inBuff);
          byteNumber = 0;
        }
      } else {
        //a byte arrived, but there is no packet gathering bytes
        /**/
        console.log("invalid byte: ", data[a], "in the context of: ", data);
      }
    }
  }
  return this;
};
/**
.call this function to get the sendx8, sendx8_16, sendx8_32, sendString, sendArray functions.
@param properties.rLengths a list containing the message headers as key and the expected message lengths as values
*/
var SerialHardware = function(properties, environment) {
  var fails=requireProperties.call(properties,['rLengths','tLengths']);
  if(fails){
    console.error("a hardware couldn't be created because of problems the properties:",fails);
    return;
  }else{
    console.log("Creating hardware");
  }
  var rLengths=properties.rLengths;
  var tLengths=properties.tLengths;
  var dataChopper = new DataChopper(rLengths);
  var lazyQueue = new LazyQueue({messagePriority:15,maxStack:15});
  var serial;
  var self = this;


  this.newSerial=function(newSerial){
    serial=newSerial;

    serial.on('data', serialDataCallback );
  }

  this.newSerial(properties.serial);

  this.sendx8 = function(header, dataArray) {
    lazyQueue.enq(function() {
      if (dataArray.constructor !== Array)
        dataArray = Array.from(dataArray);
      dataArray.unshift(header & 0xff);
      var buf1 = Buffer.from(dataArray);
      // console.log("wr",buf1);
      serial.write(buf1);
    });
  }

  this.sendx8_16 = function(header, dataArray) {
    lazyQueue.enq(function() {
      var arr8 = [];
      for (var a of dataArray) {
        arr8.push(a & 0xff);
        arr8.push((a >> 8) & 0xff);
      }
      // console.log("aa");
      if (dataArray.constructor !== Array)
        dataArray = Array.from(dataArray);
      arr8.unshift(header & 0xff);
      var buf1 = Buffer.from(arr8);
      // console.log("wr",buf1);
      serial.write(buf1);

      // console.log("sent",buf1);
    });
  }
  this.sendx8_32 = function(header, dataArray) {
    lazyQueue.enq(function() {
      var arr8 = [];
      for (var a of dataArray) {
        arr8.push(a & 0xff);
        arr8.push((a >> 8) & 0xff);
        arr8.push((a >> 16) & 0xff);
        arr8.push((a >> 24) & 0xff);
      }
      // console.log("aa");
      if (dataArray.constructor !== Array)
        dataArray = Array.from(dataArray);
      arr8.unshift(header & 0xff);
      var buf1 = Buffer.from(arr8);
      // console.log("wr",buf1);
      serial.write(buf1);

      // console.log("sent",buf1);
    });
  }
  this.sendString = function(header, string) {
    if (tLengths[header] !== -1) {
      console.warn("warning: this header is not specified for unknown lengths");
    }
    lazyQueue.enq(function() {
      // console.log(header,string);

      var arr8 = [];
      for (var a in string) {
        arr8.push(string.charCodeAt(a));
        // console.log(string.charCodeAt(a));
      }
      arr8.push('\0');
      arr8.unshift(0xff & arr8.length);
      arr8.unshift(header & 0xff);
      // console.log(arr8.length);
      // arr8.push(eoString);
      var buf1 = Buffer.from(arr8);
      // console.log(buf1);
      // console.log("string of "+buf1.length);
      // console.log("send str len"+buf1.length);
      serial.write(buf1);
      // console.log("sent",buf1);
    });
  }
  this.sendArray = function(header, array) {
    lazyQueue.enq(function() {
      if (tLengths[header] !== -1) {
        console.warn("warning: this header is not specified for unknown lengths");
      }
      array.unshift(array.length);
      array.unshift(header);
      array.map(function(a) {
        return a & 0xFF;
      })

      // array.push(0);

      var buf1 = Buffer.from(array);
      // console.log("OPB",buf1);
      serial.write(buf1);
    });
  }

  function serialDataCallback(data){

    try {
      dataChopper.incom(data);
    } catch (e) {
      console.error(e);
    }
  };
  this.onDataReceived = function(choppedData) {
    console.log("RECIEVED", choppedData);
  }
  dataChopper.wholePacketReady = function(choppedData) {
    self.onDataReceived(choppedData);
  }
  this.connectAndStart=function(){

  }
}

//detector is contains an instance of the SerialHardwareDetector. Only one is instanced, thus the static scope
SerialHardware.detector=false;
//Keeps a list of drivers for serial devices, using the "hardwareId" (the string that the wardware tells the system about his type) name as key
SerialHardware.availableSerialDrivers={};
//keeps the serial ports for which a driver has been instanced
SerialHardware.connectedPortHardwares={};


SerialHardware.initialization=function(environment){
  if(!SerialHardware.detector){
    SerialHardware.detector = new SerialHardwareDetector({
      onSerialConnected: function(event) {
        if(SerialHardware.connectedPortHardwares[event.portName]){
          console.log("Driver exists");
          SerialHardware.connectedPortHardwares[event.portName].newSerial(event.serialPort);
          SerialHardware.connectedPortHardwares[event.portName].connectAndStart();
          return true;
        }else{
          // console.log(SerialHardware.availableSerialDrivers);
          for(var recogName in SerialHardware.availableSerialDrivers){
            // console.log("ONSERIAL");
            if (event.response.indexOf(recogName) > -1) {
              var hardwareCreated = new SerialHardware.availableSerialDrivers[recogName]({
               serial: event.serialPort
              }, environment);
              environment.hardwares.list.push(hardwareCreated);
              hardwareCreated.connectAndStart();
              SerialHardware.connectedPortHardwares[event.portName]=hardwareCreated;
              return true;
            }else{
              // console.log("event.response.indexOf(recogName)",event.response.indexOf(recogName));
            }
          }
        }
        return false;
      },
      onSerialClosed: function(event){
      }
    }, environment);
  }else{
    // console.log("THERE",SerialHardware.availableSerialDrivers.length);
  }
}
module.exports=SerialHardware