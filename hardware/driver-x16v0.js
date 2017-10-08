'use strict';
var HardwareDriver=require('./hardwareDriver.js');
console.log("x16v0 serial based, on ",process.platform);

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
        "encoderScroll": 8,
        "encoderPressed": 9,
        "encoderReleased": 10,
        "comTester": 11,
        "hardwareId": 0x40
    },
    "rHNames": {},
    "rLengths": [0, 0, 4, 4, 4, 4, 2, 2, 2, 1, 1, 1,"unknown"],
    "baudRate": 19200,
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



var lazyStack=new (function(){
  var stack=[];
  var interval=1;
  this.enq=function(cb){
    stack.push(cb);
  }
  setInterval(function(){
    if(stack.length>0){
      stack[0]();
      stack.splice(0,1);
    }
  },interval);
})();

var lastSentBitmap={
  bitmap:[0,0,0],
  screenA:"",
  screenB:""
};

// console.log(comConsts);

var dataChopper=new(function(){
  var inBuff;
  var expectedLength;
  var byteNumber=0;
  var recordingBuffer=false;
  this.wholePacketReady=function(packet){
    // console.log("packet ready",packet);
  }
  this.incom= function(data){
    for(var a=0; a<data.length; a++){
      if(!recordingBuffer){
        //we are expecting a message header, so we check what header current byte is
        //if is successfull, we start gathering or recording a new data packet.

        //byte  is in our header list?
        recordingBuffer=rLengths.length>=data[a];
        if(recordingBuffer){
          // console.log(rLengths[data[a]]);
          expectedLength=rLengths[data[a]];
          if(rLengths[data[a]]!="unknown")
            expectedLength+=1;
          inBuff=new Buffer(expectedLength);
          byteNumber=0;
        }
        if(expectedLength=="unknown" && a>0){
          expectedLength=data[a];
        }
      }
      if(recordingBuffer){
        if(byteNumber<expectedLength-1){
          //a new byte arrived and is added to the current packet
          inBuff[byteNumber]=data[a];
          byteNumber++;
        }else{
          //a whole expected packet arrived
          inBuff[byteNumber]=data[a];
          this.wholePacketReady(inBuff);
          recordingBuffer=false;
          // console.log(inBuff);
          byteNumber=0;
        }
      }else{
        //a byte arrived, but there is no packet gathering bytes
        /**/console.log("invalid byte: ",data[a], "in the context of: ", data);
      }
    }
  }
  return this;
})();

/**
 * @type {HardwareDriver};
 * Prototype of a DriverX16v0. Instanced for every hardware of this type that is connected. It handles communication with the hardware. It creates events for every hardware event. These events are forwarded to the corresponding  hardwareInteractor
 * @param {environment} input needed to create it's own interactor instance
 * @param {properties} properties.serial required
 * @returns {number} that number, plus one.
 * @example function createHardwareController(portName){
   var err=0;
   let newPort = new SerialPort(portName, {
     baudRate: baudRate
   });

   //console.log("newPort",newPort);
     console.log('creating hardware controller');
     environment.hardwares.push(new hardware_prototypes.x16v0(environment,{serial:newPort}));

 }

 */
var DriverX16v0=function(environment,properties){
  HardwareDriver.call(this);
  // console.log(environment.interactionMan.entryInteractors.x16basic);
  var myInteractionPattern=environment.interactionMan.newSuperInteractor("x16basic",this);
  var serial=properties.serial;
  var tHardware=this;
  // var serial = new Serial({baudRate:baudRate,portId:serialPort});

  serial.write(new Buffer([tHeaders.hello]));
  // console.log("wrote hello");


  var sendx8=function(header,dataArray){
    lazyStack.enq(function(){
      if(dataArray.constructor !== Array)
        dataArray=Array.from(dataArray);
      dataArray.unshift(header&0xff);
      var buf1 = Buffer.from(dataArray);
      serial.write(buf1);
    });
  }

  var sendx8_16=function(header,dataArray){
    lazyStack.enq(function(){
      var arr8=[];
      for(var a of dataArray){
        arr8.push(a&0xff);
        arr8.push((a>>8)&0xff);
      }
      // console.log("aa");
      if(dataArray.constructor !== Array)
        dataArray=Array.from(dataArray);
      arr8.unshift(header&0xff);
      var buf1 = Buffer.from(arr8);
      serial.write(buf1);

      // console.log("sent",buf1);
    });
  }
  var sendString=function(header,string){
    lazyStack.enq(function(){
      // console.log(header,string);
      if(tLengths[header]!=="unknown"){
        console.warn("warning: this header is not specified for unknown lengths");
      }
      var arr8=[];
      for(var a in string){
        arr8.push(string.charCodeAt(a));
        // console.log(string.charCodeAt(a));
      }
      arr8.push('\0');
      arr8.unshift(0xff&arr8.length);
      arr8.unshift(header&0xff);
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
  var sendScreenA=function(str){
    sendString(tHeaders.screenA,str.substring(0,16));
  }
  var sendScreenB=function(str){
    sendString(tHeaders.screenB,str.substring(0,16));
  }
  this.sendScreenA=sendScreenA;
  this.sendScreenB=sendScreenB;
  var updateLeds=function(bitmaps){
    if(!Array.isArray(bitmaps)){
      throw "when updating the LED's, I need an array of three 32 bit ints";
    }
    // tHardware.sendx8_16(tHeaders.ledMatrix,[0xff,0xff,1,1,0xff,0xff]);
    sendx8_16(tHeaders.ledMatrix,bitmaps);
    lastSentBitmap.bitmap=bitmaps;
    // sendx8(tHeaders.ledMatrix,bitmaps);
  }
  tHardware.testByte=function(byte){
    sendx8(tHeaders.comTester,[byte]);
  }
  tHardware.draw=updateLeds;
  // TODO: : make a function that takes shorter to communicate
  tHardware.updateLayer=function(n,to){
    if(n<3){
      lastSentBitmap[n]=to&0xffff;
      updateLeds(bitmaps);
    }else{
      console.error("tried to update layer "+n+" which doesnt exist");
    }
  }
  myInteractionPattern.handle('serialopened');

  serial.on('data', (data) => {
    try{
      dataChopper.incom(data);
    }catch(e){
      console.error(e);
    }
  });

  dataChopper.wholePacketReady=function(chd){
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
      // console.log("recv",chd);
      myInteractionPattern.handle('interaction',event);
      myInteractionPattern.handle(event.type,event);
    }
  }
  setTimeout(function(){
    sendScreenA("initialized");
    sendScreenB("autotel x16v0");
  },2000);

  return this;
};
module.exports = DriverX16v0;