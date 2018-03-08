'use strict';
var CLOCKTICKHEADER = 0x00;
var TRIGGERONHEADER = 0x01;
var TRIGGEROFFHEADER = 0x02;
var RECORDINGHEADER = 0xAA;
var EventMessage = require('../../datatypes/EventMessage.js');
// var EventPattern=require('../../datatypes/EventPattern.js');
var NoteOnTracker = require('../moduleUtils/NoteOnTracker.js');
var InterfaceX16 = require('./InterfaceX16');


var instanced = 0;
var name = function() {
  this.name = this.baseName + " " + instanced;
  instanced++;
}
var PresetKit = function(properties, environment) {
  this.baseName = "preset kit";
  this.color = [90, 70, 30];
  var self = this;
  //get my unique name
  name.call(this);

  this.autoMap = false;

  if (properties.autoMap == true) this.autoMap = 2;
  if (properties.autoMap == 'channel') this.autoMap = 1;
  if (properties.autoMap == 'note') this.autoMap = 2;

  this.recordingUi = true;

  if (properties.name) this.name = properties.name;


  this.interfaces.X16 =  InterfaceX16;

  var kit = this.kit = {};


  for (var n=0; n<16; n++) {
    this.kit[n] = new EventMessage({value:[TRIGGERONHEADER,-1,-1,-1]});
  }

  if (properties.kit) {
    for (var n in properties.kit) {
      this.kit[n % 16] = new EventMessage({
        value: properties.kit[n]
      });
    }
    self.handle('kit changed');
  }

  var noteOnTracker = new NoteOnTracker(this);

  this.uiTriggerOn = function(presetNumber, velo) {
    if(velo===false||velo===undefined){velo=-1}
    if (self.mute) return;

    if (kit[presetNumber]||self.autoMap!==false) {
      if (kit[presetNumber]) {
        if (kit[presetNumber].mute) {
          return;
        }
      }

      var recMessage=new EventMessage({
        value: [TRIGGERONHEADER, 0, presetNumber, velo]
      });

      self.triggerOn(presetNumber, recMessage);

      if (self.recordingUi) {
        self.recordOutput(recMessage);
      }
    }
  }

  this.uiTriggerOff = function(presetNumber) {
    // console.log("koff=",noteOnTracker[presetNumber]);
    noteOnTracker.ifNoteOff(presetNumber, function(noteOff) {
      self.output(noteOff, true);
      if (self.recordingUi) {
        self.recordOutput(new EventMessage({
          value: [TRIGGEROFFHEADER, 0, presetNumber, 100]
        }));
      }
    });
  }

  this.triggerOn = function(presetNumber, originalMessage) {
    presetNumber %= 16;
    self.handle("extrigger", {
      preset: presetNumber
    });
    if (self.autoMap !== false) {
      if (!kit[0]) {
        kit[0] = new EventMessage()
      };

      var newEvent = kit[0].clone().underImpose(originalMessage);

      if (kit[presetNumber]) {
        if (kit[presetNumber].mute) {
          return;
        }
      }

      newEvent.value[self.autoMap] += presetNumber;
      noteOnTracker.add(newEvent, presetNumber);
      self.output(newEvent);

    } else {
      if (self.mute) return;
      if (kit[presetNumber]) {
        if (!kit[presetNumber].mute) {
          var outputMessage = kit[presetNumber].clone().underImpose(originalMessage);
          noteOnTracker.add(kit[presetNumber], presetNumber);
          self.output(outputMessage);
        }
      }
    }
  }

  this.triggerOff = function(presetNumber) {
    presetNumber %= 16;
    self.handle("extrigger", {
      preset: presetNumber
    });
    noteOnTracker.ifNoteOff(presetNumber, function(noteOff) {
      self.output(noteOff, true);
    });
  }

  this.stepMicro = function() {}
  var recordHead = 0;
  this.recordEvent = function(evM) {
    self.handle('kit changed');
    kit[recordHead] = new EventMessage(evM);
    // console.log("rec",kit[recordHead]);
    recordHead++;
    recordHead %= 16;
  }
  this.togglePresetMute = function(presetNumber) {
    if (kit[presetNumber]) {
      kit[presetNumber].mute = !kit[presetNumber].mute === true;
      return kit[presetNumber].mute;
    } else {
      return false;
    }
  }
  this.eventReceived = function(event) {
    var evM = event.eventMessage;
    // console.log(evM);
    self.handle('receive', event);
    if (evM.value[0] == CLOCKTICKHEADER) {
      self.stepMicro(evM.value[1], evM.value[2]);
    } else if (evM.value[0] == TRIGGERONHEADER) {
      //nton
      self.triggerOn(evM.value[2], evM);
    } else if (evM.value[0] == TRIGGEROFFHEADER) {
      //ntoff
      self.triggerOff(evM.value[2]);
    } else if (evM.value[0] == RECORDINGHEADER) {
      evM.value.shift();
      // console.log("rec",evm);
      this.recordEvent(evM);
    }
  }

}
module.exports = PresetKit