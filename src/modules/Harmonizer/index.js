'use strict';
var EventMessage = require('../../datatypes/EventMessage.js');
var Note = require('../moduleUtils/Note');
var scaleNames = require('./scaleNames.js');
var headers = EventMessage.headers;
var CHORDCHANGEHEADER = headers.changePreset;
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
var name = function () {
  this.name = baseName + " " + instanced;
  instanced++;
}
/**
@constructor
the instance of the of the module, ment to be instantiated multiple times.
require to moduleBase.call
*/
var Harmonizer = function (properties, environment) {
  if (properties.name) {
    this.name = properties.name;
  } else {
    name.call(this);
  };
  this.preventBus = true;

  var self = this;
  this.recordingUi = true;
  this.currentScale = 0;
  var noteOnTracker = new NoteOnTracker(this);
  this.mapMode = true;
  // this.baseNote={value:0};

  this.defaultNote = new Note();
  // this.defaultNote.testvar="hi";
  this.defaultNote.note(36);

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
  this.uiScaleChange = function (scalen) {
    self.currentScale = scalen;
    self.handle('chordchange');
    if (self.recordingUi) {
      self.recordOutput(new EventMessage({
        value: [
          CHORDCHANGEHEADER, scalen
        ]
      }));
    }
  }

  this.uiTriggerOn = function (gradeNumber, underImpose = false) {
    if (self.mute) return;
    var transformedNumber = inputTransformNumber(gradeNumber);
    if (transformedNumber !== false) {
      var newEvent = new Note(self.defaultNote);
      newEvent.note(transformedNumber);
      if (underImpose) newEvent.underImpose(underImpose);
      if (self.recordingUi) {
        var uiGeneratedEvent = new Note();
        uiGeneratedEvent.note(gradeNumber);
        uiGeneratedEvent.timbre(-1);
        uiGeneratedEvent.velo(-1);

        if (underImpose) {
          uiGeneratedEvent.underImpose(underImpose);
        }
        noteOnTracker.add(uiGeneratedEvent, ["REC", gradeNumber]);
        self.recordOutput(uiGeneratedEvent);
      }
      applyDefaultNote(newEvent);

      self.output(newEvent);
      noteOnTracker.add(newEvent, ["UI", gradeNumber]);
      self.handle('note played', {
        triggeredGrade: gradeNumber,
        triggeredNote: newEvent.value[1]
      });
    }
  }

  this.uiTriggerOff = function (gradeNumber) {
    noteOnTracker.ifNoteOff(["UI", gradeNumber], function (noteOff) {
      self.output(noteOff);
    });
    noteOnTracker.ifNoteOff(["REC", gradeNumber], function (noteOff) {
      let nnoff = noteOff.clone();
      nnoff.value[0] = headers.triggerOff;
      self.recordOutput(nnoff);
    });
  }
  function applyDefaultNote(event) {
    // console.log("APP",event.value);
    var keepNote = self.defaultNote.note();
    self.defaultNote.note(-1);
    event.superImpose(self.defaultNote);
    self.defaultNote.note(keepNote);
    event.value[1] += keepNote;
    // console.log(" --", event.value);
  }
  this.triggerOn = function (gradeNumber, underImpose = false) {
    if (self.mute) return;
    var transformedNumber = inputTransformNumber(gradeNumber);
    if (transformedNumber !== false) {
      var newEvent = new Note(self.defaultNote);
      newEvent.note(transformedNumber);
      if (underImpose) newEvent.underImpose(underImpose);

      applyDefaultNote(newEvent);

      //underimpose.value, should't be index 2 actually?
      noteOnTracker.add(newEvent, ["EX", gradeNumber, underImpose.value[2]]);
      self.output(newEvent);
      self.handle('note played', {
        triggeredGrade: gradeNumber,
        triggeredNote: newEvent.value[1]
      });
    }
  }

  this.triggerOff = function (gradeNumber, underImpose) {
    noteOnTracker.ifNoteOff(["EX", gradeNumber, underImpose.value[2]], function (noteOff) {
      self.output(noteOff);
    });
  }

  var inputTransformNumber = function (inputNumber) {
    var ret;
    if (self.scaleArray[self.currentScale]) {
      var scaleLength = self.scaleArray[self.currentScale].length;
      if (self.mapMode == true) {
        var octave = Math.floor(inputNumber / scaleLength);
        var noteWraped = self.scaleArray[self.currentScale][inputNumber % scaleLength];
        ret = noteWraped + (12 * octave);
      } else {
        // console.log("FLOORMODE");
        var nearestGrade = 0;
        var octave = Math.floor(inputNumber / 12);
        var noteWraped = inputNumber % 12;
        //scaleArray is always in increasing order
        for (var a in self.scaleArray[self.currentScale]) {
          if (self.scaleArray[self.currentScale][a] <= noteWraped) {
            nearestGrade = self.scaleArray[self.currentScale][a];
            // console.log("NEARE",nearestGrade);
          } else {
            break;
          }
        }
        ret = nearestGrade + (12 * octave);
      }
      return ret;// + self.defaultNote.note();
    } else {
      return false;
    }
  }


  this.messageReceived = function (event) {
    var eventMessage = event.eventMessage
    if (!self.mute)
      if (eventMessage.value[0] == 2 || eventMessage.value[3] == 0) {
        self.triggerOff(eventMessage.value[1], eventMessage);
      } else {
        this.handle('receive', eventMessage);
        if (eventMessage.value[0] == 3) {
          //header 3 is change chord
          // if(!self.currentScale)self.cu
          self.currentScale = eventMessage.value[2];
          self.handle('chordchange');
          // console.log("chordchange",event);
        } else if (eventMessage.value[0] == 1) {
          // console.log("TRIGGERON");
          self.triggerOn(eventMessage.value[1], eventMessage);
        } else {
          // console.log("wasted event",eventMessage,(eventMessage.value[0]|0xf)+"=!"+0);
        }
      }
  }
  this.newScaleMap = function (identifier, to) {
    // console.log("scale map update "+identifier);
    scaleMap[identifier] = to;
    self.scaleArray[identifier] = [];
    var count = 0;
    for (var a = 0; a < 12; a++) {
      if ((scaleMap[identifier] >> a) & 1) {
        self.scaleArray[identifier].push(a);
      }
    }
    self.handle('chordchange');
  }
  this.getScaleMap = function (identifier) {
    return scaleMap[identifier] || 0x00;
  }
  this.getScaleName = function (identifier) {
    return scaleNames.scaleToName[self.getScaleMap(identifier)] || "unknown scale";
  }

  this.getCompMaps = function (identifier, shift = 0) {
    var ret = {
      roots: 1,
      semitones: [0, 0, 0, 0]
    }
    var scaleLength = self.scaleArray[identifier].length;
    var wrapShift = (scaleLength - shift % scaleLength) % scaleLength;

    ret.roots = ret.roots << wrapShift;

    for (let a = 0; a < 16; a += scaleLength) {
      ret.roots |= ret.roots << a;
    }

    let lastNote = 0;
    for (let n in self.scaleArray[identifier]) {
      let itm = self.scaleArray[identifier][n];
      let interval = itm - lastNote;
      if (ret.semitones[interval] !== undefined) {
        ret.semitones[interval] |= (1 << scaleLength) << (n);
      }
      lastNote = itm;
    }

    for (var b in ret.semitones) {
      ret.semitones[b] = ret.semitones[b] << wrapShift;
      ret.semitones[b] |= (ret.semitones[b]) >> scaleLength;
      ret.semitones[b] |= (ret.semitones[b]) >> scaleLength;
      for (let a = 0; a < 16; a += scaleLength) {
        ret.semitones[b] |= ret.semitones[b] << a;
      }
    }

    return ret;
  }
  this.interfaces.X16 = InterfaceX16;
  this.interfaces.X28 = InterfaceX28;

  defaultState();

  this.onRemove = function () {
    noteOnTracker.empty(function (noteOff) {
      self.output(noteOff);
    });
    return true;
  }
}

Harmonizer.color = [255, 255, 127];
module.exports = Harmonizer;