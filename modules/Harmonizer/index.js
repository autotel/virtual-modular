'use strict';
var EventMessage = require('../../datatypes/EventMessage.js');
var patternEvent = require('../../datatypes/EventPattern.js');
var scaleNames = require('./scaleNames.js');
var CLOCKTICKHEADER = 0x00;
var TRIGGERONHEADER = 0x01;
var TRIGGEROFFHEADER = 0x02;
var RECORDINGHEADER = 0xAA;
var CHORDCHANGEHEADER = 0x03;
var NoteOnTracker = require('../moduleUtils/NoteOnTracker.js');

var InterfaceX16 = require('./InterfaceX16');
var InterfaceX28 = require('./InterfaceX28');
/**
@constructor ModuleSingleton
singleton, only one per run of the program
every module needs to run at the beginning of the runtime to register it's interactor in the interactionManager
*/

var instanced = 0;
var baseName = "harmonizer";
var name = function() {
  this.name = baseName + " " + instanced;
  instanced++;
}
/**
@constructor
the instance of the of the module, ment to be instantiated multiple times.
require to moduleBase.call
*/
var Harmonizer = function(properties,environment) {
  this.color = [255, 255, 127];
  if (properties.name){
    this.name = properties.name;
  }else{
    name.call(this);
  };
  /** TODO: this naming convention **/
  var self = this;
  this.recordingUi = true;
  this.currentScale = 0;
  var noteOnTracker = new NoteOnTracker(this);

  // this.baseNote={value:0};

  this.baseEventMessage = new EventMessage({
    value: [1, -1, 20, 90]
  });
  var scaleMap = {};
  //keep track of triggered notes
  this.scaleArray = {};

  function defaultState() {
    var c = 0;
    for (let scale in scaleNames.nameToScale) {
      self.newScaleMap(c, scaleNames.nameToScale[scale]);
      if (c++ > 15) break;
    }
  }
  this.uiScaleChange = function(scalen) {
    self.currentScale = scalen;
    if (self.recordingUi) {
      self.recordOutput(new EventMessage({
        value: [
          CHORDCHANGEHEADER,
          self.baseEventMessage.value[1],
          scalen, -1
        ]
      }));
    }
  }

  this.uiTriggerOn = function(gradeNumber, underImpose = false) {
    if (self.mute) return;
    var newEvent = getOutputMessageFromNumber(gradeNumber);
    if (newEvent) {
      if (underImpose) newEvent.underImpose(underImpose);
      if (self.recordingUi) {
        var uiGeneratedEvent = new EventMessage({
          value: [TRIGGERONHEADER, self.baseEventMessage.value[1], gradeNumber, 100]
        });
        if (underImpose) {
          uiGeneratedEvent.underImpose(underImpose);
        }
        noteOnTracker.add(uiGeneratedEvent, ["REC", gradeNumber]);
        self.recordOutput(uiGeneratedEvent);
      }
      self.output(newEvent);
      noteOnTracker.add(newEvent, ["UI", gradeNumber]);
      self.handle('note played', {
        triggeredGrade: gradeNumber,
        triggeredNote: newEvent.value[2]
      });
    }
  }

  this.uiTriggerOff = function(gradeNumber) {
    noteOnTracker.ifNoteOff(["UI", gradeNumber], function(noteOff) {
      self.output(noteOff);
    });
    noteOnTracker.ifNoteOff(["REC", gradeNumber], function(noteOff) {
      let nnoff = noteOff.clone();
      nnoff.value[0] = TRIGGEROFFHEADER;
      self.recordOutput(nnoff);
    });
  }

  this.triggerOn = function(gradeNumber, underImpose = false) {
    if (self.mute) return;
    var newEvent = getOutputMessageFromNumber(gradeNumber);
    if (newEvent) {
      if (underImpose) newEvent.underImpose(underImpose);
      noteOnTracker.add(newEvent, ["EX", gradeNumber, underImpose.value[1]]);
      self.output(newEvent);
      self.handle('note played', {
        triggeredGrade: gradeNumber,
        triggeredNote: newEvent.value[2]
      });
    }
  }

  this.triggerOff = function(gradeNumber, underImpose) {
    // var newEvent=self.baseEventMessage.clone();
    // if(underImpose) newEvent.underImpose(underImpose);
    noteOnTracker.ifNoteOff(["EX", gradeNumber, underImpose.value[1]], function(noteOff) {
      // console.log("NTOFF",noteOff);
      self.output(noteOff);
    });
  }

  var inputTransformNumber = function(inputNumber) {
    if (self.scaleArray[self.currentScale]) {
      var scaleLength = self.scaleArray[self.currentScale].length;
      var noteWraped = self.scaleArray[self.currentScale][inputNumber % scaleLength];
      var ret = noteWraped + (12 * Math.floor(inputNumber / scaleLength));
      // console.log(self.baseEventMessage);
      return ret + self.baseEventMessage.value[2];
    } else {
      return false;
    }
  }
  var getOutputMessageFromNumber = function(number) {
    var outputMessage = new EventMessage(self.baseEventMessage);
    var num = inputTransformNumber(number);
    // console.log("itn",num);
    if (num) {
      outputMessage.value[2] = num;
      return outputMessage;
    } else {
      return false;
    }
  }
  this.eventReceived = function(event) {
    /**TODO: event.eventMessage is not a constructor, don't pass the mame in caps!*/
    var eventMessage = event.eventMessage
    if (!self.mute)
      if (eventMessage.value[0] == 2 || eventMessage.value[3] == 0) {
        self.triggerOff(eventMessage.value[2], eventMessage);
      } else {
        this.handle('receive', eventMessage);
        if (eventMessage.value[0] == 3) {
          //header 3 is change chord
          // if(!self.currentScale)self.cu
          self.currentScale = eventMessage.value[2];
          self.handle('chordchange');
          // console.log("chordchange",event);
        } else if (eventMessage.value[0] == 1) {
          self.triggerOn(eventMessage.value[2], eventMessage);
        } else {
          // console.log("wasted event",eventMessage,(eventMessage.value[0]|0xf)+"=!"+0);
        }
      }
  }
  this.newScaleMap = function(identifier, to) {
    // console.log("scale map update "+identifier);
    scaleMap[identifier] = to;
    self.scaleArray[identifier] = [];
    var count = 0;
    for (var a = 0; a < 12; a++) {
      if ((scaleMap[identifier] >> a) & 1) {
        self.scaleArray[identifier].push(a);
      }
    }
  }
  this.getScaleMap = function(identifier) {
    return scaleMap[identifier] || 0x00;
  }
  //TODO: there should be no need to isntantiate every interface for each module. most of them will probably not be used. maybe each interface is a function that gets called by the module creator or hardware manager.
  this.interfaces.X16 = new InterfaceX16(this,environment);
  this.interfaces.X28 = new InterfaceX28(this,environment);

  defaultState();

  this.delete = function() {
    noteOnTracker.empty(function(noteOff){
      self.output(noteOff);
    });
    return true;
  }
}
module.exports = Harmonizer;