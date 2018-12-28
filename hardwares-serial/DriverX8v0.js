'use strict';
var SerialHardware = require('./SerialHardware.js');

console.log("x8v0 serial on ", process.platform);
const fs = require('fs');

var file = fs.readFileSync('./hardwares-serial/name_signals-x8.h', "utf8");

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
        } catch (e) { }
      }
      if (!what[level + 1]) {
        topCallback.call(inObject, what[level]);
      }
    }
    recurse(subWords, comConsts, function (topName) {
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
}


var instances = 0;
var DriverX8v0 = function (properties, environment) {
  properties.rLengths = rLengths;
  properties.tLengths = tLengths;
  SerialHardware.call(this, properties, environment);
  var myInstanceNumber = instances;
  this.instanceNumber = myInstanceNumber;
  instances++;
  var self = this;

  var myInteractionPattern = environment.interactionMan.newSuperInteractor("x8basic", this);

  this.lastScreenValues = [];
  var sendBitmap = self.bitmap = function (bmp) {
    // console.log("send",transmits.bitmap.head,bmp);
    self.sendx8(transmits.bitmap.head, [bmp]);
  }

  /*object that evaluates buttons whose time pressed overlap, forming a button chain*/
  var chainedButtons = new (function () {
    var compChain = [];
    var chain = this.chain = [];
    this.eval = function (evt) {
      if (evt.type) {
        if (evt.type.indexOf("Press") !== -1) {
          if (pressed(evt))
            if (chain.length > 1)
              evt.tied = chain;
        }
        if (evt.type.indexOf("Release") !== -1) {
          if (released(evt))
            if (chain.length > 1) {
              evt.tied = chain;
            } else {
              evt.tied = false;
            }
        }
        // console.log(evt);
      }
    }
    function pressed(event) {
      let cpev = comp(event);
      // console.log(String(cpev,2));
      if (cpev) chainadd(cpev, event);
      return (cpev);
    }
    function released(event, identifier) {
      let cpev = comp(event);
      // console.log(String(cpev,2));
      if (cpev) chainrmv(cpev);
      return (cpev);
    }
    //compress data into a comparable string
    function comp(evt) {
      var ret = false;
      if (evt.type.indexOf("selectorButton") !== -1) {
        var ret = [(0x1 << 8) | (evt.data[0])];
      }
      if (evt.type.indexOf("matrixButton") !== -1) {
        var ret = [(0x2 << 8) | (evt.data[0])];
      }
      if (evt.type.indexOf("bottomButton") !== -1) {
        var ret = 0;
      }
      return ret;
    }

    function chainadd(cp, evt) {
      compChain.push(cp);
      chain.push(evt);
    }
    function chainrmv(cp, evt) {
      var iof = (compChain.includes(cp));
      if (iof >= 0) {
        compChain.splice(iof, 1);
        chain.splice(iof, 1);
      } else {
        console.error("released a button that was never pressed?", evt.type);
      }
    }
    return this;
  })();

  /* when an event is received from the hardware device*/
  this.onDataReceived = function (chd) {
    var matrixButtonsBitmap;
    if (chd && chd[0] !== receives.null.head) {
      var event = {
        type: rHNames[chd[0]],
        data: chd.slice(1),
        originalMessage: chd,
        hardware: self
      }
      event.data = Array.from(event.data);
      if (event.type == "butonPressed") {
        matrixButtonsBitmap |= 1 << event.data[0];
        event.data[2] = matrixButtonsBitmap;
        event.data[3] = 0;
      }

      if (event.type == "buttonReleased") {
        matrixButtonsBitmap &= ~(1 << event.data[0]);
        event.data[2] = matrixButtonsBitmap;
        event.data[3] = 0;
      }
      if ((/button/i).test(event.type)) {
        event.button = event.data[0];
        chainedButtons.eval(event);
      }
      myInteractionPattern.handle('interaction', event);
      myInteractionPattern.handle(event.type, event);
      console.log(event);
    }
  }
  this.connectAndStart = function () {
    // var c=0;
    // setInterval(function () {
    //   // self.sendx8(comConsts.transmits.engageControllerMode.head, [comConsts.transmits.engageControllerMode.head]);
    //   // sendScreenA("initialized n." + myInstanceNumber);
    //   // sendScreenB("autotel x8v0");
    //   sendBitmap(c);
    //   c++;
    
    myInteractionPattern.handle('serialopened');
    myInteractionPattern.engage(self);
    // }, 200);
  }

  return this;
};
DriverX8v0.initialization = SerialHardware.initialization;
SerialHardware.availableSerialDrivers['x8'] = DriverX8v0;
module.exports = DriverX8v0;