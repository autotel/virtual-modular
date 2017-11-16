'use strict';
var HardwareDriver=require('./hardwareDriver.js');
console.log("x28v0 serial based, on ",process.platform);

//TODO:cache to save startup time
var fs = require('fs');
var file = fs.readFileSync('./firmware/x28/_name_signals.h', "utf8");

var lines=file.split('\n');

var comConsts={};
for(var line of lines){
  var words=line.split(/ +/g);
  if(words[0]=="#define"){
    var subWords=words[1].split('_');
    function recurse(what,inObject,topCallback,level=0){
      if(what[level]){
        try{
          if(!inObject[what[level]])inObject[what[level]]={};
          recurse(what,inObject[what[level]],topCallback,level+1);
        }catch(e){
        }
      }
      if(!what[level+1]){
        topCallback.call(inObject,what[level]);
      }
    }
    recurse(subWords,comConsts,function(topName){
      this[topName]=parseInt(words[2]);
    });
  }
}

//microcontroller's receive is transmit in the computer side, and vice-versa
comConsts.transmits=comConsts.RH;
comConsts.receives=comConsts.TH;
delete comConsts.RH;
delete comConsts.TH;


//create inverse list of indexes for easier lookup
comConsts.rHNames={};
for(var a in comConsts.receives){
  comConsts.rHNames[comConsts.receives[a].head]=a;
}
comConsts.rLengths={};
for(var a in comConsts.receives){
  comConsts.rLengths[comConsts.receives[a].head] = comConsts.receives[a].len;
}
comConsts.tLengths={};
for(var a in comConsts.transmits){
  comConsts.tLengths[comConsts.transmits[a].head] = comConsts.transmits[a].len;
}

// console.log(comConsts);
var transmits=comConsts.transmits;
var tLengths=comConsts.tLengths;
var receives=comConsts.receives;
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

var DataChopper=function(){
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
        recordingBuffer=rLengths[data[a]]!==undefined;
        if(recordingBuffer){
          // console.log(rLengths[data[a]]);
          expectedLength=rLengths[data[a]];
          if(rLengths[data[a]]!=-1)
            expectedLength+=1;
          inBuff=new Buffer(expectedLength);
          byteNumber=0;
        }
        if(expectedLength==-1 && a>0){
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
};

/**
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
var DriverX28v0=function(environment,properties){
  HardwareDriver.call(this);
  var myInstanceNumber=instances;
  instances++;
  var dataChopper=new DataChopper();
  // console.log(environment.interactionMan.entryInteractors.x16basic);
  //TODO: myInteractionPattern should be part of HardwareDriver, since all HardwareDriver must have a myInteractionPattern here
  var myInteractionPattern=environment.interactionMan.newSuperInteractor("x28basic",this);
  myInteractionPattern.handle('serialopened');


  var serial=properties.serial;
  var tHardware=this;

  var sendx8=function(header,dataArray){
    lazyStack.enq(function(){
      if(dataArray.constructor !== Array)
        dataArray=Array.from(dataArray);
      dataArray.unshift(header&0xff);
      var buf1 = Buffer.from(dataArray);
      // console.log("wr",buf1);
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
      // console.log("wr",buf1);
      serial.write(buf1);

      // console.log("sent",buf1);
    });
  }
  var sendx8_32=function(header,dataArray){
    lazyStack.enq(function(){
      var arr8=[];
      for(var a of dataArray){
        arr8.push(a&0xff);
        arr8.push((a>>8)&0xff);
        arr8.push((a>>16)&0xff);
        arr8.push((a>>24)&0xff);
      }
      // console.log("aa");
      if(dataArray.constructor !== Array)
        dataArray=Array.from(dataArray);
      arr8.unshift(header&0xff);
      var buf1 = Buffer.from(arr8);
      // console.log("wr",buf1);
      serial.write(buf1);

      // console.log("sent",buf1);
    });
  }
  var sendString=function(header,string){
    lazyStack.enq(function(){
      // console.log(header,string);
      if(tLengths[header]!==-1){
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
  this.lastScreenValues=[];
  var sendScreenA=function(str){
    tHardware.lastScreenValues[0]=str;
    sendString(transmits.screenA.head,str.substring(0,16));
  }
  var sendScreenB=function(str){
    tHardware.lastScreenValues[1]=str;
    sendString(transmits.screenB.head,str.substring(0,16));
  }
  this.sendScreenA=sendScreenA;
  this.sendScreenB=sendScreenB;
  var updateLeds=function(bitmaps,paintSelectButtons=false,intensity=0xff){
    bitmaps[3]&=0xf0;
    bitmaps[7]&=0xf0;
    bitmaps[11]&=0xf0;
    bitmaps[3]|=0xf&(intensity/17);
    bitmaps[7]|=0xf&(intensity/17);
    bitmaps[11]|=0xf&(intensity/17);
    if(paintSelectButtons){
      sendx8_32(transmits.setMonoMaps.head,bitmaps);
      lastSentBitmap.bitmap=bitmaps;
    }else{
      if(!Array.isArray(bitmaps)){
        throw "when updating the LED's, I need an array of three ints";
      }
      // tHardware.sendx8_16(tHeaders.ledMatrix,[0xff,0xff,1,1,0xff,0xff]);
      sendx8_16(transmits.setMatrixMonoMap.head,bitmaps);
      lastSentBitmap.bitmap=bitmaps;
    }
  }
  var updateSelectorLeds=function(bitmaps){
    if(!Array.isArray(bitmaps)){
      throw "when updating the LED's, I need an array of three ints";
    }
    sendx8_16(transmits.setSelectorMonoMap.head,bitmaps);
  }
  tHardware.testByte=function(byte){
    sendx8(transmits.comTester.head,[byte]);
  }
  tHardware.draw=updateLeds;
  tHardware.drawSelectors=updateSelectorLeds;
  // TODO: : make a function that takes shorter to communicate
  tHardware.updateLayer=function(n,to){
    if(n<3){
      lastSentBitmap[n]=to&0xffff;
      updateLeds(bitmaps);
    }else{
      console.error("tried to update layer "+n+" which doesnt exist");
    }
  }


  serial.on('data', (data) => {
    // console.log(data);
    try{
      dataChopper.incom(data);
    }catch(e){
      console.error(e);
    }
  });
  var matrixButtonsBitmap=0;
  dataChopper.wholePacketReady=function(chd){
    // console.log("------------packet",chd);
    // console.log(data);
    if(chd&&chd[0]!==receives.null.head){
      // console.log("-------handle",chd);
      var event={
        type:rHNames[chd[0]],
        data:chd.slice(1),
        originalMessage:chd,
        hardware:tHardware
      }
      event.data=Array.from(event.data);
      // if(event.type=="matrixButtonVelocity"){
      //   event.data[1]=event.data[1]|(event.data[2]<<8);
      // }
      if(event.type=="matrixButtonPressed"){
        // console.log("rr");
        matrixButtonsBitmap|=1<<event.data[0];
        event.data[2]=matrixButtonsBitmap;
        event.data[3]=0;
        // console.log(matrixButtonsBitmap);
      }
      if(event.type=="matrixButtonReleased"){
        matrixButtonsBitmap&=~(1<<event.data[0]);
        event.data[2]=matrixButtonsBitmap;
        event.data[3]=0;
        // console.log(matrixButtonsBitmap);
      }
      if((/button/i).test(event.type)){
        event.button=event.data[0];
        // console.log("buttton",event.type);
      }
      // console.log("recv",chd);
      // console.log("interaction",event);
      myInteractionPattern.handle('interaction',event);
      // myInteractionPattern.on('interaction',console.log);
      //convert encoder scrolls to signed (it can only be -1 or -2)

      if(event.type=="encoderScrolled"){
        event.data[0]=(event.data[0]==0xFF?-1:event.data[0]);
        event.data[0]=(event.data[0]==0xFE?-2:event.data[0]);
        event.delta=event.data[0];
      }

      console.log(event);
      myInteractionPattern.handle(event.type,event);
    }
  }
  setTimeout(function(){
    // console.log(comConsts.transmits.engageControllerMode.head);
    sendx8(comConsts.transmits.engageControllerMode.head,[comConsts.transmits.engageControllerMode.head]);
    sendScreenA("initialized n."+myInstanceNumber);
    sendScreenB("autotel x28v0");
    myInteractionPattern.engage();
  },200);

  return this;
};
module.exports = DriverX28v0;