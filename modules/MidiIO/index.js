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
// var midiOptions = require('./midi-options.js');

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

// if (!midiOptions.outputs) {
//   midiOptions.outputs = {};
// }
// if (!midiOptions.inputs) {
//   midiOptions.inputs = {}
// }
/**
@constructor
the instance of the of the module, ment to be instantiated multiple times.
require to moduleBase.call. it is created via ModulesManager.addModule
*/

var MidiIO = function(properties,environment) {
  this.preventBus = true;
  this.deviceName="none";
  this.baseName = (properties.name ? properties.name : "Midi");
  getName.call(this);
  var hangingNotes = {};
  var self = this;
  if (properties.name) this.name = properties.name;
  var midi = false;

  this.setMidi=function(to){
    if(to){
      console.log("set midi",to);
      midi=to;
      self.deviceName=to.name;
      // if(midi.in)
      midi.onIn=function(a,b,c){midiReceived(a,b,c)};
    }
  }
  if(properties.midi){
    var midiDevice=tryGetDeviceNamed(properties.midi);
    if(midiDevice){
      this.setMidi(midiDevice);
    }else{
      console.warn("MIDI device not found",properties.midi);
    }
  }
  this.getPossibleInterfaces=function(){
    return MidiInterface.list;
  }

  console.log("midi device", midi.input);
  /*example midiInputCache={[0x80,0x01:{outputMessage:eventMessage,enabled:true}]}*/
  var midiInputCache = this.midiInputCache = {};
  var eachMidiMapping = this.eachMidiMapping = function(callback) {
    for (var index in midiInputCache) {
      callback.call(midiInputCache[index], index, midiInputCache[index]);
    }
  }

  this.interfaces.X16 = InteractorX16;
  var inputClockCount = 0;
  var midiReceived=function(t, midiMessage) {
    // console.log("MIDIIN");
    var outputMessage = new EventMessage({
      value: [
        (midiMessage[0] & 0xf0),
        (midiMessage[0] & 0xf),
        midiMessage[1],
        midiMessage[2]
      ]
    });
    switch (outputMessage.value[0]) {
      case 0x90:{
        if(outputMessage.value[3]){
          outputMessage.value[0] = TRIGGERONHEADER;
        }else{
          outputMessage.value[0] = TRIGGEROFFHEADER;
        }
        break;
      }
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
        self.output(outputMessage/*.superImpose(midiInputCache[cachingIndex].outputMessage)*/);

        self.recordOutput(outputMessage);

      }


      self.handle('midi in', {
        inputMidi: midiMessage,
        outputMessage: outputMessage,
        eventMessage: outputMessage
      });
  };
  var sendMidi = function(a, b, c) {
    if(midi){
      if (midi.out) {
        midi.out(a, b, c);
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
    }
  };

  this.choke = function() {
    // console.log("choke "+Object.keys(hangingNotes).length+" hanging notes");
    let choked = false;
    for (var a in hangingNotes) {
      choked = true;
      let h = hangingNotes[a];
      sendMidi((h[0] & 0x0f) | 0x80, h[1], h[2]);
    }
    if (!choked) {
      for (let a = 0; a < 16; a++) {
        for (let b = 0; b < 127; b++) {
          sendMidi(0x80 | a, b, 0);
        }
      }
    }
    return choked;
  }
  //todo: rename midi input listener to midi.in();
  //console.log(midi);

  // sendMidi(0x90,60,100); sendMidi(0x90,64,100); sendMidi(0x90,67,100);
  // setTimeout(function(){
  //   sendMidi(0x80,60,0); sendMidi(0x80,64,0); sendMidi(0x80,67,0);
  // }, 3000);

  var baseRemove = this.remove;
  this.messageReceived = function(evt) {
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
    // console.log("  sendMidi("+midiOut[0]+","+midiOut[1]+","+midiOut[2]+");");
    sendMidi(midiOut[0], midiOut[1], midiOut[2]);
  };
  this.onRemove = function() {
    return true;
    //for some reason app crashes deleting midi
    // if(midi.input) midi.input.MidiInClose();
    // if(sendMidiput) sendMidiput.MidiOutClose();
    baseRemove();
  }
}
function tryGetDeviceNamed(name){
  for(var interf of MidiInterface.list){
    if(interf.name==name){
      return interf
    }else if(interf.deviceName==name){
      return interf
    }else if( interf.name.match(new RegExp(name))!==null ){
      return interf
    }
  }
  return false;
}
var MidiInterface=function(midi){
  var self=this;
  this.name="unnamed";
  this.deviceName="none";
  this.out=false;
  this.openMidiOut=function(str){
    self.name=midi.MidiOutOpen(str);
    self.deviceName=self.name;
    self.out=function(a,b,c){midi.MidiOut(a,b,c)};
    return this.name;
  }
  this.onIn=false;
  this.in=false;
  this.openMidiIn=function(str){
    self.onIn=function(a,b){ console.log("no callback");};
    var inCaller=function(a,b){
      // console.log("HELLOOO",self.onIn);
      if(self.in){
        // console.log("in");
        self.onIn(a,b);
      }
    };
    self.name=midi.MidiInOpen(str, inCaller);
    self.in=true;
    return this.name;
  }
  MidiInterface.list.push(this);
}
MidiInterface.list=[];
/**
environment will call the static initialization function when it registers a new module; if such function is present.

*/
MidiIO.initialization=function(environment){
  // fs.writeFile(path.join(__dirname, '/midi-options.js'), "module.exports=" + JSON.stringify(midiOptions, null, "\t"), 'utf8', console.log);
  environment.on('created', function() {
    var fail=false;
    var pNum=0;
    var midi=new jazz.MIDI();
    var inList=midi.MidiInList();
    var outList=midi.MidiOutList();
    var ioList=Array.from(new Set(inList.concat(outList)));
    for(var portName of ioList){
      midi=new jazz.MIDI();
      var midiInterface=new MidiInterface(midi);
      if(inList.indexOf(portName)!==-1){
        midiInterface.openMidiIn(portName);
      }
      if(outList.indexOf(portName)!==-1){
        midiInterface.openMidiOut(portName);
      }
      console.log(midiInterface);
    }
    for (var midiInterface of MidiInterface.list) {
      if(midiInterface.in||midiInterface.out){
        console.log("     - instancing midi");
        var ioString = "";
        if (midiInterface.in) ioString += "I";
        if (midiInterface.out) ioString += "O";
        ioString+=midiInterface.name;
        midiInterface.name=ioString;
      }
    }
  });
}
MidiIO.color = [127, 127, 127];
module.exports=MidiIO;