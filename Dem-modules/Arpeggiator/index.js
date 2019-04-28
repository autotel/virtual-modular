'use strict';
var EventMessage = require('../../Polimod/datatypes/EventMessage.js');
const Base= require("../Base");
var NoteOnTracker = require('../moduleUtils/NoteOnTracker.js');
var Monosequence = require('./Monosequence');
var headers = EventMessage.headers;
let instances=0;
var Arpeggiator = function (properties,environment) {

  var self = this;
  Base.call(this,properties,environment);
  var myBitmap = 0;
  var settings = this.settings = {
    duration: { value: false },
    'force length': { value: 0 }, //when >0, this should modify how the sequence is played so that it's length is always a factor of the forced length
    //this effectively converts the arpeggiator in a fast pattern maker that doesn't drift away easily
    mode: {
      value: 0,
      valueNames: ['as played', 'up', 'down', 'random']
    },
    pattern: {
      value: 0,
      valueNames: ['straight', 'polymeter 3%8', 'polymeter 3%16', 'polyrhythm 8/3', 'polyrhythm 16/3'],
    },
    reset: { value: false }//this allows to clear the notes in the arpeggiator in case there is a hanging note.
  }

  let monosequence = this.monosequence = new Monosequence();

  monosequence.setStep(0, 1);
  monosequence.setStep(1, 1);
  monosequence.setStep(2, 1);
  monosequence.setStep(3, 1);

  let clock = this.clock = {
    subSteps: 1,
    subStep: 0,
    step: 0
  }
  let noteOnTracker = new NoteOnTracker(this);

  let runningNotes = [];
  let runningNotesSorted = [];


  function eachRunningNote(cb) {
    for (var index in runningNotes) {
      var rnot = runningNotes[index];
      cb.call(rnot, index, rnot);
    }
  }
  var self = this;


  

  var memory = [];
  var recMessages = {
    rate: new EventMessage({ value: [headers.changeRate, 12, -1] })
  }
  this.recordStepDivision = function () {
    recMessages.rate.value[2] = self.clock.subSteps * 12;
    self.recordOutput(recMessages.rate);
  }
  this.recordingReceived = function (evt) {
    if (evt.eventMessage.value[0] == headers.record) {
      //shold for instance the arpeggiator proxy the recorder behind? it is possible to make this module send his recoding notes upward.
      evt.eventMessage.value.shift();
      self.messageReceived(evt);
    }
  }
  this.messageReceived = function (evt) {
    if (evt.eventMessage.value[0] == headers.clockTick) {

      var clockBase = evt.eventMessage.value[1];
      var clockMicroStep = evt.eventMessage.value[2];

      if ((clockMicroStep / clock.subSteps) % clockBase == 0) {
        clock.subStep++;
        if (clock.subStep >= clock.subSteps) {

          clock.subStep = 0;

          
          noteOnTracker.empty(function (noff) {
            self.output(noff, true);
          });
          
          monosequence.playStep(function (step) {
            if (step) {
              clock.step++;
              arpOperation();
            }
          })

          self.handle('step');
        }
      }


    } else if (evt.eventMessage.value[0] == headers.triggerOn) {
      // this.setFixedStep(evt.eventMessage.value[2]%16);
      addNote(evt.eventMessage.clone());
    } else if (evt.eventMessage.value[0] == headers.triggerOff) {
      // this.clearFixedStep(evt.eventMessage.value[2]%16);
      removeNote(evt.eventMessage.clone());
    } else if (evt.eventMessage.value[0] == headers.changeRate) {
      // console.log("CHANGERATEHEAER",evt.eventMessage.value);
      clock.subSteps = evt.eventMessage.value[2] / (evt.eventMessage.value[1] || 1);
    }
  }

  this.getBitmap16 = function () {
    return myBitmap;
  }
  this.onRemove = function () {
    noteOnTracker.empty(function (noff) {
      self.output(noff, true);
    });
    return true;
  }

  this.handleStepsChange = function () {
    self.handle('~module', { steps: runningNotes.length });
  }

  function arpOperation() {
    if (settings.reset.value) {
      runningNotes.splice(0);
      noteOnTracker.empty(function (noff) {
        self.output(noff, true);
      });
      settings.reset.value = false;
    }
    if (runningNotes.length) {
      arpTrigger(clock.step % runningNotes.length);
    }
  }

  function arpTrigger(num) {
    var outNote = runningNotes[num];
    noteOnTracker.add(outNote);
    self.output(outNote);
  }

  function addNote(eventMessage) {
    self.handleStepsChange();
    runningNotes.push(eventMessage);
  }

  function removeNote(eventMessage) {
    self.handleStepsChange();
    // var noteWasRemoved=false;

    for (var index = runningNotes.length - 1; index >= 0; index--) {
      var rnote = runningNotes[index];
      // console.log("?",rnote.value);
      if (eventMessage.compareValuesTo(rnote, [1, 2])) {
        // noteWasRemoved = true;
        runningNotes.splice(index, 1);
      }
    }
    // if(!noteWasRemoved) console.warn("note was not found to remove",eventMessage.value);
    // console.log(runningNotes.length);
  }
};

Arpeggiator.color = [210, 0, 233];
module.exports = Arpeggiator;