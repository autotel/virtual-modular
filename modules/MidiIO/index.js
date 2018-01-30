/**
Module that enables interconnectivity with midi inputs and midi outputs, presumably via USB.
*/
'use strict';
var CLOCKABSOLUTEHEADER = 0x03;
var CLOCKTICKHEADER = 0x00;
var TRIGGERONHEADER = 0x01;
var TRIGGEROFFHEADER = 0x02;
var RECORDINGHEADER = 0xAA;


var EventMessage = require('../../datatypes/EventMessage.js');
var InteractorX16 = require('./InteractorX16');

var fs = require('fs');
var path = require('path');
var midiOptions = require('./midi-options.js');

var jazz = require('jazz-midi');

/**
@constructor ModuleSingleton
singleton, only one per run of the program
every module needs to run at the beginning of the runtime to register it's interactor in the interactionManager
*/
var defaultMessage = new EventMessage({
  value: [0, 0, 45, 90]
});
var instanced = 0;
var getName = function() {
  this.name = this.baseName + " " + instanced;
  instanced++;
}

//open every possible midi ports i/o
var midiOpenFail = false;
var midiDevicesAmount = 1;
var currentPortNumber = 0;
var openedMidiPorts = [];

if (!midiOptions.outputs) {
  midiOptions.outputs = {};
}
if (!midiOptions.inputs) {
  midiOptions.inputs = {}
}
/**
@constructor
the instance of the of the module, ment to be instantiated multiple times.
require to moduleBase.call. it is created via ModulesManager.addModule
*/
var MidiIO = function(properties,environment) {
  this.preventBus = true;
  this.baseName = (properties.name ? properties.name : "Midi");
  this.color = [127, 127, 127];
  getName.call(this);
  var hangingNotes = {};
  var self = this;
  if (properties.name) this.name = properties.name;
  var midi = properties.midiPort;
  if(!midi){
    console.warn("can't create a MidiIO without properties.midiPort");
    return;
  }
  console.log("midi device", midi.input);
  /*example midiInputCache={[0x80,0x01:{outputMessage:eventMessage,enabled:true}]}*/
  var midiInputCache = this.midiInputCache = {};
  var eachMidiMapping = this.eachMidiMapping = function(callback) {
    for (var index in midiInputCache) {
      callback.call(midiInputCache[index], index, midiInputCache[index]);
    }
  }


  this.interfaces.X16 = new InteractorX16(this,environment);
  if (midi.input) {
    var inputClockCount = 0;
    midi.input.setCallback(function(t, midiMessage) {
      // console.log("SET CB");
      //midi to EventMessage conversion
      var outputMessage = new EventMessage({
        value: [
          (midiMessage[0] & 0xf0),
          (midiMessage[0] & 0xf),
          midiMessage[1],
          midiMessage[2]
        ]
      });
      switch (outputMessage.value[0]) {
        case 0x90:
          outputMessage.value[0] = TRIGGERONHEADER;
          break;
        case 0x80:
          outputMessage.value[0] = TRIGGEROFFHEADER;
          break;
        case 0xF0:
          {
            if (outputMessage.value[1] == 0x8) {
              outputMessage.value[0] = CLOCKTICKHEADER;
              outputMessage.value[1] = 6;
              outputMessage.value[2] = inputClockCount % 6;
              inputClockCount += 1;
              break;
            } else if (outputMessage.value[1] == 0xa) {
              outputMessage.value[0] = CLOCKABSOLUTEHEADER;
              outputMessage.value[1] = 0;
              outputMessage.value[2] = 0;
              inputClockCount = 0;
              break;
            } else if (outputMessage.value[1] == 0xb) {
              outputMessage.value[0] = TRIGGERONHEADER;
              break;
            } else if (outputMessage.value[1] == 0xc) {
              outputMessage.value[0] = TRIGGEROFFHEADER;
              break;
            }
          }
        default:
          // console.log("message header not transformed:",outputMessage.value);
      }
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
        self.output(outputMessage.superImpose(midiInputCache[cachingIndex].outputMessage));
      }
      self.handle('midi in', {
        inputMidi: midiMessage,
        outputMessage: outputMessage,
        eventMessage: outputMessage
      });
    });
  } else {
    // console.log(this.name,"no callback");
  }
  midi.out = function(a, b, c) {
    if (midi.output) {
      midi.output.MidiOut(a, b, c);
      var isOn = (a & 0xf0) == 0x90;
      var isOff = (a & 0xf0) == 0x80;
      isOff |= isOn && (c == 0);
      if (isOn) {
        var chan = a & 0x0f;
        hangingNotes[[a, b]] = [a, b, c];
      }
      if (isOff) {
        // console.log("DEL hangingNotes");
        delete hangingNotes[[a, b]];
      }
      // console.log("hanging notes"+self.name+":"+Object.keys(hangingNotes).length);
    }
  };

  this.choke = function() {
    // console.log("choke "+Object.keys(hangingNotes).length+" hanging notes");
    let choked = false;
    for (var a in hangingNotes) {
      choked = true;
      let h = hangingNotes[a];
      midi.out((h[0] & 0x0f) | 0x80, h[1], h[2]);
    }
    if (!choked) {
      for (let a = 0; a < 16; a++) {
        for (let b = 0; b < 127; b++) {
          midi.out(0x80 | a, b, 0);
        }
      }
    }
    return choked;
  }
  //todo: rename midi input listener to midi.in();
  //console.log(midi);

  // midi.out(0x90,60,100); midi.out(0x90,64,100); midi.out(0x90,67,100);
  // setTimeout(function(){
  //   midi.out(0x80,60,0); midi.out(0x80,64,0); midi.out(0x80,67,0);
  // }, 3000);

  var baseRemove = this.remove;
  this.eventReceived = function(evt) {
    if (self.mute) return;
    var eventMessage = evt.eventMessage;
    eventMessage.underImpose(defaultMessage);
    var midiOut = [0, 0, 0];
    // console.log("MIDI",evt);
    if (eventMessage.value[0] == TRIGGERONHEADER) {
      // console.log("mnoton");
      midiOut[0] = 0x90 | eventMessage.value[1];
      midiOut[1] = eventMessage.value[2];
      midiOut[2] = eventMessage.value[3];
    }
    if (eventMessage.value[0] == TRIGGEROFFHEADER) {
      // console.log("mnotff");
      midiOut[0] = 0x80 | eventMessage.value[1];
      midiOut[1] = eventMessage.value[2];
      midiOut[2] = 0;
    }
    // console.log("  midi.out("+midiOut[0]+","+midiOut[1]+","+midiOut[2]+");");
    midi.out(midiOut[0], midiOut[1], midiOut[2]);
  };
  this.onRemove = function() {
    return true;
    //for some reason app crashes deleting midi
    // if(midi.input) midi.input.MidiInClose();
    // if(midi.output) midi.output.MidiOutClose();
    baseRemove();
  }
}
/**
environment will call the static initialization function when it registers a new module; if such function is present.

*/
MidiIO.initialization=function(environment){

  var keepScanning = 40;
  while (keepScanning) {
    keepScanning--;
    var midi = new jazz.MIDI();

    var outPortName = midi.MidiOutOpen(currentPortNumber);
    if (outPortName) {
      if (midiOptions.outputs[outPortName] === undefined) {
        midiOptions.outputs[outPortName] = true;
        console.log("       -" + outPortName + " has no config. Setting to true");
      }
      if (midiOptions.outputs[outPortName] === true) {
        if (openedMidiPorts[outPortName] === undefined) openedMidiPorts[outPortName] = {};
        openedMidiPorts[outPortName].output = midi;

        console.log('     -openedMidiPorts [' + outPortName + '].output = opened Midi port');
      } else {
        console.log('    -openedMidiPorts [' + outPortName + '].output disabled in midi-options.json');
        if (midi) midi.MidiOutClose();
      }

    } else {
      // console.log('    -No out port '+currentPortNumber);
      midiOpenFail = true;
    }
    var midiInputCallbackContainer = function(a, b) {
      // console.warn("midiIO input function not defined");
    }

    function setInputCallback(cb) {
      midiInputCallbackContainer = cb;
    }
    var midiInputCallbackCaller = function(t, msg) {
      midiInputCallbackContainer(t, msg);
    }
    var inPortName = midi.MidiInOpen(currentPortNumber, midiInputCallbackCaller) || outPortName;
    if (inPortName) {
      midiOpenFail = false;
      try {
        if (midiOptions.inputs[inPortName] === undefined) {
          midiOptions.inputs[inPortName] = true;
          console.log("     -" + inPortName + " has no config. Setting to true");
        }
        if (midiOptions.inputs[inPortName] === true) {
          if (openedMidiPorts[inPortName] === undefined) openedMidiPorts[inPortName] = {};
          openedMidiPorts[inPortName].input = midi;
          openedMidiPorts[inPortName].input.setCallback = setInputCallback;
          console.log('     -openedMidiPorts [' + inPortName + '].input = opened Midi port');
        } else {
          console.log('    -openedMidiPorts [' + inPortName + '].input disabled in midi-options.json');
          // try {
          // if(midi) midi.MidiInClose();
          //} catch(e){
          //   console.console.error("couldnt close midi",midi);
          //   console.error(e);
          // }
        }
      } catch (e) {
        midiOpenFail = true;
        console.error(e);
      }

    } else {
      // console.log('    -No in port '+currentPortNumber);
      if (midiOpenFail) midiOpenFail = true;
    }
    currentPortNumber++;
  }
  fs.writeFile(path.join(__dirname, '/midi-options.js'), "module.exports=" + JSON.stringify(midiOptions, null, "\t"), 'utf8', console.log);


  environment.on('created', function() {
    for (var midiItem in openedMidiPorts) {
      console.log("     - instancing midi");
      var ioString = "";
      if (openedMidiPorts[midiItem].input !== undefined) ioString += "I";
      if (openedMidiPorts[midiItem].output !== undefined) ioString += "O";
      if (!midiOptions.rename) midiOptions.rename = {};
      if (midiOptions.rename[midiItem]) {
        environment.modules.instantiate("MidiIO", {
          midiPort: openedMidiPorts[midiItem],
          name: midiOptions.rename[midiItem]
        });
      } else {
        environment.modules.instantiate("MidiIO", {
          midiPort: openedMidiPorts[midiItem],
          name: ioString + "-" + midiItem
        });
      }
    }
  });
}

module.exports=MidiIO;