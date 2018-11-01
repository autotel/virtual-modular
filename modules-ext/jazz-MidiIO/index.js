/**
Module that enables interconnectivity with midi inputs and midi outputs, presumably via USB.
*/
'use strict';

var MidiInterface = undefined;


var EventMessage = require('../../src/datatypes/EventMessage');
var InteractorX16 = require('./InteractorX16');

var headers = EventMessage.headers;

// var fs = require('fs');
// var path = require('path');
// var midiOptions = require('./midi-options.js');
//detect if running on electron 
// var userAgent = navigator.userAgent.toLowerCase();
// if (userAgent.indexOf(' electron/') > -1) {
//   jazz = require('jazz-midi-electron');
// } else {
//   jazz = require('jazz-midi');
// }
/**
@constructor ModuleSingleton
singleton, only one per run of the program
every module needs to run at the beginning of the runtime to register it's interactor in the interactionManager
*/
var defaultMessage = new EventMessage({
  value: [0, 36, 0, 90]
});
var instanced = 0;
var getName = function () {
  this.name = this.baseName + " " + instanced;
  instanced++;
}

/**
@constructor
the instance of the of the module, ment to be instantiated multiple times.
require to moduleBase.call. it is created via ModulesManager.addModule
*/

var MidiIO = function (properties, environment) {
  this.preventBus = true;
  this.deviceName = "none";
  this.baseName = (properties.name ? properties.name : "Midi");
  getName.call(this);
  var hangingNotes = {};
  var self = this;
  if (properties.name) this.name = properties.name;
  var midi = false;

  this.setMidi = function (to) {
    if (to) {
      console.log("set midi", to);
      midi = to;
      self.deviceName = to.name;
      // if(midi.in)
      midi.onIn = function (a, b, c) { midiReceived(a, b, c) };
    }
  }
  if (properties.midi) {
    var midiDevice = tryGetDeviceNamed(properties.midi);
    if (midiDevice) {
      this.setMidi(midiDevice);
    } else {
      console.warn("MIDI device not found", properties.midi);
    }
  }
  this.getPossibleInterfaces = function () {
    return MidiInterface.list;
  }

  console.log("midi device", midi.input);
  /*example midiInputCache={[0x80,0x01:{outputMessage:eventMessage,enabled:true}]}*/
  var midiInputCache = this.midiInputCache = {};
  var eachMidiMapping = this.eachMidiMapping = function (callback) {
    for (var index in midiInputCache) {
      callback.call(midiInputCache[index], index, midiInputCache[index]);
    }
  }

  this.interfaces.X16 = InteractorX16;
  var inputClockCount = 0;
  var midiReceived = function (t, midiMessage) {
    console.log("MIDIIN");
    var outputMessage=EventMessage.fromMidi(midiMessage);
    // console.log(self.name,outputMessage.value);
    var msgFn = outputMessage.value[0];
    var msgFv = outputMessage.value[1];
    var cachingIndex = msgFn; //[msgFn,msgFv]
    /*
    midi input messages are converted to the internal language standards, and it is added to a cache,
    in this way, it becomes possible to disble some messages or to change the input/output mapping
    by altering the midiInputCache
    */
    if (!midiInputCache[cachingIndex]) {
      midiInputCache[cachingIndex] = {
        outputMessage: outputMessage.clone(),
        enabled: true
      };
      midiInputCache[cachingIndex].outputMessage.value[2] = -1;
      midiInputCache[cachingIndex].outputMessage.value[3] = -1;
    }
    if (midiInputCache[cachingIndex].enabled) {
      self.output(outputMessage/*.superImpose(midiInputCache[cachingIndex].outputMessage)*/);

      self.recordOutput(outputMessage);

    }


    self.handle('midiin', {
      inputMidi: midiMessage,
      outputMessage: outputMessage,
      eventMessage: outputMessage
    });
  };
  var sendMidi = function (sig) {
    var a = sig[0];
    var b = sig[1];
    var c = sig[2];
    if (midi) {
      if (midi.out) {
        midi.out([a, b, c]);
        var isOn = (a & 0xf0) == 0x90;
        var isOff = (a & 0xf0) == 0x80;
        isOff |= isOn && (c == 0);
        if (isOn) {
          var chan = a & 0x0f;
          hangingNotes[[a, b]] = [a, b, c];
        }
        if (isOff) {
          delete hangingNotes[[a, b]];
        }
      }
    }
  };

  this.choke = function () {
    let choked = false;
    for (var a in hangingNotes) {
      choked = true;
      let h = hangingNotes[a];
      sendMidi([(h[0] & 0x0f) | 0x80, h[1], h[2]]);
    }
    if (!choked) {
      for (let a = 0; a < 16; a++) {
        for (let b = 0; b < 127; b++) {
          sendMidi([0x80 | a, b, 0]);
        }
      }
    }
    return choked;
  }
  var baseRemove = this.remove;
  this.messageReceived = function (evt) {
    if (self.mute) return;
    evt.eventMessage.underImpose(defaultMessage);
    var midiOut = EventMessage.toMidi(evt.eventMessage);
    if (midiOut)
      sendMidi(midiOut);
    else
      console.warn("midiout is ", midiOut);
  };
  this.onRemove = function () {
    return true;
    baseRemove();
  }
}
function tryGetDeviceNamed(name) {
  for (var interf of MidiInterface.list) {
    if (interf.name == name) {
      return interf
    } else if (interf.deviceName == name) {
      return interf
    } else if (interf.name.match(new RegExp(name)) !== null) {
      return interf
    }
  }
  return false;
}

MidiIO.setMidiInterface = function (_MidiInterface) {
  MidiInterface = _MidiInterface;
}


MidiIO.initialization = function (environment) {
  var nameToInterfaceList = {};
  function reMidiPort() {
    var fail = false;
    var pNum = 0;
    // var midi = new jazz.MIDI();
    var info = MidiInterface.listPorts();
    console.log("midi info:", info);
    var inList = info.inputs;
    var outList = info.outputs;
    var ioList = Array.from(new Set(inList.concat(outList)));
    // console.log("iolist",ioList);
    for (var portName of ioList) {
      var midiInterface;
      if (nameToInterfaceList[portName] === undefined) {
        midiInterface = new MidiInterface();
        nameToInterfaceList[portName] = midiInterface;
      } else {
        midiInterface = nameToInterfaceList[portName];
      }
      if ((!midiInterface.in) && inList.indexOf(portName) !== -1) {
        midiInterface.openMidiIn(portName);
        console.log("connect new Midi in", portName);
      }
      if ((!midiInterface.out) && outList.indexOf(portName) !== -1) {
        midiInterface.openMidiOut(portName)
        console.log("connect new Midi out", portName);
      }
    }
    for (var midiInterface of MidiInterface.list) {
      if (midiInterface.in || midiInterface.out) {
        console.log("     - instancing midi");
        console.log("           -interface.name:", midiInterface.name);
        var ioString = "";
        if (midiInterface.in) ioString += "I";
        if (midiInterface.out) ioString += "O";
        ioString += midiInterface.name;
        midiInterface.name = ioString;
      }
    }
  }
  environment.on('created', reMidiPort);
  MidiInterface.onNewMidiDevice(function () {
    console.log("new Midi ports available");
    reMidiPort();
  });
}
MidiIO.color = [127, 127, 127];
module.exports = MidiIO;