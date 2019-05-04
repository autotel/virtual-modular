/**
Module that enables interconnectivity with midi inputs and midi outputs, presumably via USB.
*/
'use strict';

var MidiInterface = undefined;


var EventMessage = require('../../Polimod/datatypes/EventMessage');

var headers = EventMessage.headers;
var defaultMessage = new EventMessage({
  value: [0, 36, 0, 90]
});
var instanced = 0;

const Base= require('../Base');
/**
@constructor
the instance of the of the module, ment to be instantiated multiple times.
require to moduleBase.call. it is created via ModulesManager.addModule
*/

var MidiIO = function (properties, environment) {
  Base.call(this,properties,environment);
  this.preventBus = true;
  this.deviceName = "none";
  this.name = (properties.name ? properties.name : "Midi"+instanced);
  instanced++;
  var hangingNotes = {};
  var self = this;
  
  var midi = false;

  var inList = false;
  var outList = false;
  var ioList = false;

  this.setMidi = function (to) {
    if (to) {
      // if(midi.in)
      midi = to;
      self.deviceName = to.name;
      midi.onIn = function (a, b, c) {
        // console.log("midi in");
        midiReceived(a, b, c)
       };

      // midi.onIn = console.log;
      console.log("set midi", to);
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

  var inputClockCount = 0;
  var midiReceived = function (midiMessage) {
    var outputMessage=EventMessage.fromMidi(midiMessage);
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
        var isOn = (a & 0xf0) == 0x90;
        var isOff = (a & 0xf0) == 0x80;
        midi.out([a, b, c]);
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
    for (var portNumber in ioList) {
      var portName=ioList[portNumber];

      var midiInterface;
      if (nameToInterfaceList[portName] === undefined) {
        midiInterface = new MidiInterface();
        nameToInterfaceList[portName] = midiInterface;
      } else {
        midiInterface = nameToInterfaceList[portName];
      }
      if ((!midiInterface.in) && inList.indexOf(portName) !== -1) {

        midiInterface.openMidiIn(portName,console.log);
        // midiInterface.openMidiIn(portName);
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
