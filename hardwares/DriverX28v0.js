'use strict';
var SerialHardware=require('./SerialHardware.js');

console.log("x28v0 serial on ", process.platform);

//TODO:cache to save startup time
var fs = require('fs');
var file = fs.readFileSync('./firmware/x28/_name_signals.h', "utf8");

var lines = file.split('\n');

var comConsts = {};
for (var line of lines) {
  var words = line.split(/ +/g);
  if (words[0] == "#define") {
    var subWords = words[1].split('_');

    function recurse(what, inObject, topCallback, level = 0) {
      if (what[level]) {
        try {
          if (!inObject[what[level]]) inObject[what[level]] = {};
          recurse(what, inObject[what[level]], topCallback, level + 1);
        } catch (e) {}
      }
      if (!what[level + 1]) {
        topCallback.call(inObject, what[level]);
      }
    }
    recurse(subWords, comConsts, function(topName) {
      this[topName] = parseInt(words[2]);
    });
  }
}

//microcontroller's receive is transmit in the computer side, and vice-versa
comConsts.transmits = comConsts.RH;
comConsts.receives = comConsts.TH;
delete comConsts.RH;
delete comConsts.TH;


//create inverse list of indexes for easier lookup
comConsts.rHNames = {};
for (var a in comConsts.receives) {
  comConsts.rHNames[comConsts.receives[a].head] = a;
}
comConsts.rLengths = {};
for (var a in comConsts.receives) {
  comConsts.rLengths[comConsts.receives[a].head] = comConsts.receives[a].len;
}
comConsts.tLengths = {};
for (var a in comConsts.transmits) {
  comConsts.tLengths[comConsts.transmits[a].head] = comConsts.transmits[a].len;
}

// console.log(comConsts);
var transmits = comConsts.transmits;
var tLengths = comConsts.tLengths;
var receives = comConsts.receives;
var rHNames = comConsts.rHNames;
var rLengths = comConsts.rLengths;
var baudRate = comConsts.baudRate;
var eoString = comConsts.eoString;




var lastSentBitmap = {
  bitmap: [0, 0, 0],
  screenA: "",
  screenB: ""
};

// console.log(comConsts);

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


var instances = 0;
var DriverX28v0 = function(properties, environment) {
  properties.rLengths=rLengths;
  properties.tLengths=tLengths;
  properties.recognitionString="28";
  SerialHardware.call(this,properties,environment);
  var myInstanceNumber = instances;
  instances++;
  var self=this;
  //TODO: myInteractionPattern should be part of HardwareDriver, since all HardwareDriver must have a myInteractionPattern here
  var myInteractionPattern = environment.interactionMan.newSuperInteractor("x28basic", this);
  myInteractionPattern.handle('serialopened');
  this.lastScreenValues = [];
  var sendScreenA = function(str) {
    self.lastScreenValues[0] = str;
    self.sendString(transmits.screenA.head, str.substring(0, 16));
  }

  var sendScreenB = function(str) {
    self.lastScreenValues[1] = str;
    self.sendString(transmits.screenB.head, str.substring(0, 16));
  }
  this.sendScreenA = sendScreenA;
  this.sendScreenB = sendScreenB;
  var setLedsToColor = this.paintColorFromLedN = function(bitmaps, color = [255, 0, 0], start = 0, add = true) {
    var oparray=[];

    var reform=[];
    if(bitmaps.length){
      reform=bitmaps;
    }else{
      let sh=0;
      while(0xff&(bitmaps>>(sh*8)) > 0){
        // console.log("SH"+sh);
        reform.push((bitmaps>>(sh*8))&0xff);
        sh++;
      }
    }
    oparray=oparray.concat(color);
    oparray=oparray.concat([start]);
    oparray=oparray.concat(reform);

    // if(oparray.length>=7)
    // console.log(oparray.length);

    // console.log("OPRR",Buffer.from(oparray));
    if (add) {
      self.sendArray(transmits.addColorMonoMapsToColorFrom.head, oparray);
    } else {
      self.sendArray(transmits.setColorMonoMapsToColorFrom.head, oparray);
    }
  }
  var drawColor = this.drawColor = function(bitmap, color = [255, 0, 0],add = true) {

    setLedsToColor(bitmap,color,8,add);
  }
  var drawLowerSelectorButtonsColor = this.drawLowerSelectorButtonsColor = function(bitmap, color = [255, 0, 0],add = true) {
    setLedsToColor(bitmap,color,24,add);
  }
  var clear=this.clear=function(){
    self.draw([0,0,0]);
  }
  // this.drawLayers = function(layers){
  //   var resultLayer={bitmap:0,color:[0,0,0]}
  //   var n=0;
  //   for(var layer of layers){
  //     n++;
  //     if(!layer.strength){
  //       layer.strength=0.5;
  //     }
  //     panton.mixColors(resultLayer.color,layer.color,layer.strength/n);
  //   }
  //   drawColor(resultLayer.bitmap,resultLayer.color,true);
  // }
  var updateLeds = function(bitmaps, paintSelectButtons = false, intensity = 0xff) {
    bitmaps[3] &= 0xf0;
    bitmaps[7] &= 0xf0;
    bitmaps[11] &= 0xf0;
    bitmaps[3] |= 0xf & (intensity / 17);
    bitmaps[7] |= 0xf & (intensity / 17);
    bitmaps[11] |= 0xf & (intensity / 17);
    if (paintSelectButtons) {
      self.sendx8_32(transmits.setMonoMaps.head, bitmaps);
      lastSentBitmap.bitmap = bitmaps;
    } else {
      if (!Array.isArray(bitmaps)) {
        throw "when updating the LED's, I need an array of three ints";
      }
      // self.sendx8_16(tHeaders.ledMatrix,[0xff,0xff,1,1,0xff,0xff]);
      self.sendx8_16(transmits.setMatrixMonoMap.head, bitmaps);
      lastSentBitmap.bitmap = bitmaps;
    }
  }
  var updateSelectorLeds = function(bitmaps) {
    if (!Array.isArray(bitmaps)) {
      throw "when updating the LED's, I need an array of three ints";
    }
    self.sendx8_16(transmits.setSelectorMonoMap.head, bitmaps);
  }
  self.testByte = function(byte) {
    self.sendx8(transmits.comTester.head, [byte]);
  }
  self.draw = updateLeds;
  self.drawSelectors = updateSelectorLeds;
  // TODO: : make a function that takes shorter to communicate
  self.updateLayer = function(n, to) {
    if (n < 3) {
      lastSentBitmap[n] = to & 0xffff;
      updateLeds(bitmaps);
    } else {
      console.error("tried to update layer " + n + " which doesnt exist");
    }
  }


  var matrixButtonsBitmap = 0;

  /*object that evaluates buttons whose time pressed overlap, forming a button chain*/
  var chainedButtons=new(function(){
    var compChain=[];
    var chain=this.chain=[];
    this.eval=function(evt){
      if(evt.type){
        if(evt.type.indexOf("Press")!==-1){
          if(pressed(evt))
            if(chain.length>1)
              evt.tied=chain;
        }
        if(evt.type.indexOf("Release")!==-1){
          if(released(evt))
            if(chain.length>1){
              evt.tied=chain;
            }else{
              evt.tied=false;
            }
        }
        // console.log(evt);
      }
    }
    function pressed(event){
      let cpev=comp(event);
      // console.log(String(cpev,2));
      if(cpev) chainadd(cpev,event);
      return(cpev);
    }
    function released(event,identifier){
      let cpev=comp(event);
      // console.log(String(cpev,2));
      if(cpev) chainrmv(cpev);
      return(cpev);
    }
    //compress data into a comparable string
    function comp(evt){
      var ret=false;
      if(evt.type.indexOf("selectorButton")!==-1){
        var ret=[(0x1<<8)|(evt.data[0])];
      }
      if(evt.type.indexOf("matrixButton")!==-1){
        var ret=[(0x2<<8)|(evt.data[0])];
      }
      if(evt.type.indexOf("bottomButton")!==-1){
        // var ret=[(0x3<<8)|(evt.data[0])];
        var ret=0;
      }
      // if(evt.type.match(/encoder(Pressed|Released)/).length){
      //   var ret=[(0x4<<8)|(evt.data[0])];
      // }
      return ret;
    }

    function chainadd(cp,evt){
      compChain.push(cp);
      chain.push(evt);
      // console.log("CHAIN",compChain.length);
      // console.log("    +",chain.length);
    }
    function chainrmv(cp,evt){
      var iof=(compChain.includes(cp));
      // console.log("IOF",iof,cp);
      if(iof>=0){
        compChain.splice(iof,1);
        chain.splice(iof,1);
      }else{
        console.error("released a button that was never pressed?",evt.type);
      }
      // console.log("CHAIN",compChain.length);
      // console.log("    +",chain.length);
    }
    return this;
  })();

  /* when an event is received from the hardware device*/
  this.onDataReceived = function(chd) {

    // console.log("------------packet",chd);
    // console.log(data);
    if (chd && chd[0] !== receives.null.head) {
      // console.log("-------handle",chd);
      var event = {
        type: rHNames[chd[0]],
        data: chd.slice(1),
        originalMessage: chd,
        hardware: self
      }
      event.data = Array.from(event.data);
      if (event.type == "matrixButtonPressed") {
        // console.log("rr");
        matrixButtonsBitmap |= 1 << event.data[0];
        event.data[2] = matrixButtonsBitmap;
        event.data[3] = 0;
        // console.log(matrixButtonsBitmap);
      }

      if (event.type == "matrixButtonReleased") {
        matrixButtonsBitmap &= ~(1 << event.data[0]);
        event.data[2] = matrixButtonsBitmap;
        event.data[3] = 0;
        // console.log(matrixButtonsBitmap);
      }
      if ((/button/i).test(event.type)) {
        event.button = event.data[0];
        // console.log("buttton",event.type);
        chainedButtons.eval(event);
      }
      // console.log("recv",chd);
      // console.log("Iinteraction",event);
      // myInteractionPattern.on('interaction',console.log);
      //convert encoder scrolls to signed (it can only be -1 or -2)
      if (event.type == "encoderScrolled") {
        event.data[0] = (event.data[0] == 0xFF ? -1 : event.data[0]);
        event.data[0] = (event.data[0] == 0xFE ? -2 : event.data[0]);
        event.delta = event.data[0];
      }
      if (event.type == "bottomButtonPressed" || event.type == "bottomButtonReleased") {
        if (event.data[0] == 0) {
          event.button = "left";
        } else {
          event.button = "right";
        }
      }
      myInteractionPattern.handle('interaction', event);
      // console.log(event);
      myInteractionPattern.handle(event.type, event);
    }
  }
  this.connectAndStart=function(){
    setTimeout(function() {
      // console.log(comConsts.transmits.engageControllerMode.head);
      self.sendx8(comConsts.transmits.engageControllerMode.head, [comConsts.transmits.engageControllerMode.head]);
      sendScreenA("initialized n." + myInstanceNumber);
      sendScreenB("autotel x28v0");
      myInteractionPattern.engage();
    }, 200);
  }

  return this;
};
DriverX28v0.initialization=SerialHardware.initialization;
SerialHardware.availableSerialDrivers['28']=DriverX28v0;
module.exports = DriverX28v0;