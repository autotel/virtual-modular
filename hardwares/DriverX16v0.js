'use strict';
var SerialHardware=require('./SerialHardware.js');

console.log("x16v0 serial on ",process.platform);

const comConsts={
    "tHeaders": {
        "null": 0,
        "hello": 1,
        "ledMatrix": 2,
        "screenA": 3,
        "screenB": 4,
        "setInteractionMode": 5,
        "currentStep": 6,
        "comTester": 7,
        "getId": 0x40,
    },
    "tLengths": [0, 0, 6, "unknown", "unknown", 4, 2, 1, "unknown"],
    "rHeaders": {
        "null": 0,
        "hello": 1,
        "matrixButtonPressed": 2,
        "matrixButtonReleased": 3,
        "matrixButtonHold": 4,
        "matrixButtonVelocity": 5,
        "selectorButtonPressed": 6,
        "selectorButtonReleased": 7,
        "encoderScrolled": 8,
        "encoderPressed": 9,
        "encoderReleased": 10,
        "comTester": 11,
        "hardwareId": 0x40
    },
    "rHNames": {},
    "rLengths": [0, 0, 4, 4, 4, 3, 2, 2, 2, 1, 1, 1,"unknown"],
    //"baudRate": 19200,
    "eoString": 3
};
//create inverse list of indexes for easier lookup
for(var a in comConsts.rHeaders){
  comConsts.rHNames[comConsts.rHeaders[a]]=a;
}

var tHeaders=comConsts.tHeaders;
var tLengths=comConsts.tLengths;
var rHeaders=comConsts.rHeaders;
var rHNames=comConsts.rHNames;
var rLengths=comConsts.rLengths;
var baudRate=comConsts.baudRate;
var eoString=comConsts.eoString;



var lastSentBitmap={
  bitmap:[0,0,0],
  screenA:"",
  screenB:""
};


/**
DEPRECATED DOC

 * @type {HardwareDriver};
 * Prototype of a DriverX16v0. Instanced for every hardware of this type that is connected. It handles communication with the hardware. It creates events for every hardware event. These events are forwarded to the corresponding  hardwareInteractor
 * @param {environment} input needed to create it's own interactor instance
 * @param {properties} properties.serial required
 * @returns {number} that number, plus one.
 * @example function createHardwareController(portName){
   var err=0;
   let newPort = new SerialPort(portName, {
     baudRate: 19200
   });

   //console.log("newPort",newPort);
     console.log('creating hardware controller');
     environment.hardwares.push(new hardware_prototypes.x16v0(environment,{serial:newPort}));

 }

 */
 var instances=0;
var DriverX16v0=function(properties,environment){
  properties.rLengths=rLengths;
  properties.tLengths=tLengths;

    SerialHardware.call(this,properties,environment);
  var myInstanceNumber=instances;
  instances++;

  var myInteractionPattern=environment.interactionMan.newSuperInteractor("x16basic",this);

  var tHardware=this;

  this.onDataReceived =function(chd){
    // console.log("------------packet",chd);
    // console.log(data);
    if(chd&&chd[0]!==rHeaders.null){
      // console.log("-------handle",chd);
      var event={
        type:rHNames[chd[0]],
        data:chd.slice(1),
        originalMessage:chd,
        hardware:tHardware
      }

      event.data=Array.from(event.data);
      if(event.type=="matrixButtonVelocity"){
        event.data[1]=event.data[1]|(event.data[2]<<8);
        event.data[1]*=0.5;
        var bar=event.data[1]+"|";
        for(var a=0;a<event.data[1]; a+=8){
          bar+="#";
        }
        console.log(bar+"|");/**/
      }
      if(event.type=="matrixButtonPressed"){
        event.data[2]=event.data[2]|(event.data[3]<<8);
      }
      if(event.type=="matrixButtonReleased"){
        event.data[2]=event.data[2]|(event.data[3]<<8);
      }
      if((/button/i).test(event.type)){
        event.button=event.data[0];
        // console.log("buttton",event.type);
      }
      // console.log("recv",chd);
      myInteractionPattern.handle('interaction',event);
      // console.log("interaction",event);
      // if(event.type=="matrixButtonVelocity") console.log(event.data[1]);z
      //convert encoder scrolls to signed (it can only be -1 or -2)
      if(event.type=="encoderScrolled"){
        // event.data
        event.data[1]=(event.data[1]==0xFF?-1:event.data[1]);
        event.data[1]=(event.data[1]==0xFE?-2:event.data[1]);
        event.delta=event.data[1];
      }
      myInteractionPattern.handle(event.type,event);
    }
  }
  setTimeout(function(){
    sendScreenA("initialized n."+myInstanceNumber);
    sendScreenB("autotel x16v0");
    myInteractionPattern.engage();
  },200);

  return this;
};
module.exports = DriverX16v0;
