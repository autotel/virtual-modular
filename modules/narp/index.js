'use strict';
var EventMessage = require('../../datatypes/EventMessage.js');
var moduleInstanceBase = require('../moduleInstanceBase');
var uix16Control = require('./x16basic');
// var clockSpec=require('../standards/clock.js');
var CLOCKTICKHEADER = 0x00;
var TRIGGERONHEADER = 0x01;
var TRIGGEROFFHEADER = 0x02;
var RECORDINGHEADER = 0xAA;
/**
@constructor ModuleSingleton
singleton, only one per run of the program
every module needs to run at the beginning of the runtime to register it's interactor in the interactionManager

*/

module.exports = function(environment) {
  return new(function() {
    var interactorSingleton = this.InteractorSingleton = new uix16Control(environment);
    var instancesCount = 0;
    var testGetName = function() {
      this.name = this.baseName + " " + instancesCount;
      instancesCount++;
    }
    /**
    @constructor
    the instance of the of the module, ment to be instantiated multiple times.
    require to moduleBase.call
    */
    this.Instance = function(properties) {
      var noteOnTracker = new Set();
      var self = this;
      var myBitmap = this.bitmap = 0;
      var currentStep = 0;
      var stepDivision = this.stepDivision = {
        value: 2
      }
      var substep = 0;
      moduleInstanceBase.call(this);
      this.baseName = "narp";
      testGetName.call(this);
      if (properties.name) this.name = properties.name;

      var baseEventMessage = this.baseEventMessage = new EventMessage({
        value: [TRIGGERONHEADER, -1, -1, -1]
      });
      var myInteractor = new interactorSingleton.Instance(this);
      this.interactor = myInteractor;
      this.interactor.name = this.name;
      var setStep = this.setStep = function(square) {
        myBitmap |= 1 << square;
      }
      var clearStep = this.clearStep = function(square) {
        myBitmap &= ~(1 << square);
      }
      var toggleStep = this.toggleStep = function(square) {
        myBitmap ^= 1 << square;
        return myBitmap;
      }
      var clearAll = this.clearAll = function() {
        myBitmap = 0;
      }

      var generatedOutput = function(eventMessage) {
        if(self.mute) return;
        self.output(eventMessage);
      }
      var stepFunction = function() {
        var active = activeNumbers();
        if (active.length) {
          currentStep %= active.length;
          var loneBit = myBitmap & (1 << active[currentStep]);
          // console.log(currentStep);
          // console.log(loneBit.toString(2));
          if (loneBit) {
            var op = Math.log2(loneBit);
            // console.log(op);
            baseEventMessage.value[2] = op;
            generatedOutput(baseEventMessage);
            self.handle('step', {
              step: currentStep,
              generated: op
            });
          }
          currentStep++;
        }

      }
      var activeNumbers = function() {
        var keepGoing = myBitmap;
        var ret = [];
        var count=0;
        while (keepGoing > 0) {
          if (1 & keepGoing) {
            ret.push(count);
          }
          count++;
          keepGoing = keepGoing >> 1;
        }
        return ret;
      }
      this.eventReceived = function(evt) {
        if (evt.eventMessage.value[0] == CLOCKTICKHEADER) {
          var clockBase = evt.eventMessage.value[1];
          if (evt.eventMessage.value[2] / stepDivision.value % clockBase == 0) {
            substep++;
            if (substep > stepDivision.value) {
              // console.log("AAKSKA");
              substep = 0;
              stepFunction();
            }
          }
        } else if (evt.eventMessage.value[0] == TRIGGERONHEADER) {
          this.setStep(evt.eventMessage.value[2] % 16);
        } else if (evt.eventMessage.value[0] == TRIGGEROFFHEADER) {} else if (evt.eventMessage.value[0] == TRIGGEROFFHEADER + 1) {} else if (evt.eventMessage.value[0] == RECORDINGHEADER) {} else {}
      }
      this.getBitmap16 = function() {
        return myBitmap;
      }
      this.delete = function() {
        for (var noff of noteOnTracker) {
          self.output(noff,false);
          noteOnTracker.delete(noff);
        }
      }
    }
  })
}