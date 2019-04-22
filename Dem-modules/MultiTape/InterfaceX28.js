'use strict';
var EventMessage = require('../../Polimod/datatypes/EventMessage.js');
var EventConfigurator = require('../x16utils/EventConfigurator.js');
var SequenceView = require('./x28-SequenceView.js');
var ArragementView = require('./x28-ArrangementView.js');
var SQUARE = String.fromCharCode(252);
var base = require('../../interaction/x28basic/interactorBase.js');

/**
definition of a monoSequencer interactor for the x16basic controller hardware
*/
module.exports = function(controlledModule, environment) {
  base.call(this, controlledModule);
  this.controlledModule = controlledModule;

  var lastEngagedViewName = "sequencer";
  var views = {
    sequencer: new SequenceView(environment, this),
    arrangement: new ArragementView(environment, this)
  };

  function eachView(cb) {
    for (var n in views) {
      cb.call(views[n], n);
    }
  }

  function engageView(nameString, event) {
    eachView(function(n) {
      if (n == nameString) {
        lastEngagedViewName = n;
        this.engage(event);
      } else {
        this.disengage(event);
      }
    });
    updateSelectorLeds(event.hardware);
  }
  function switchView(event){
    var found=false;
    eachView(function(n) {
      if(!found){
        if (n === lastEngagedViewName) {
          this.disengage(event);
        } else {
          console.log("S"+n);
          this.engage(event);
          lastEngagedViewName = n;
          found=true;
        }
      }else{
        this.disengage(event);
      }
    });
    updateSelectorLeds(event.hardware);
  }

  this.selectorButtonPressed = function(event) {
    if (event.button == 0) {
      switchView(event);
    }
  }
  var outsideScrollHeader = 0;
  var outsideScrollMutingUp = true;
  this.outsideScroll = function(event) {
    let delta = event.delta;
    let kit = controlledModule.getTapes();

    // console.log(outsideScrollHeader);

    kit[outsideScrollHeader].muted.value = (outsideScrollMutingUp ? (delta > 0) : (delta < 0));
    // console.log(`(${outsideScrollMutingUp}?(${delta>0}):(${delta<0}))=${(outsideScrollMutingUp?(delta>0):(delta<0))}`);

    // if( kit[outsideScrollHeader].muted){
    //   muteBmp|=1<<outsideScrollHeader;
    // }else{
    //   muteBmp&=~(1<<outsideScrollHeader);
    // }

    outsideScrollHeader += delta;
    if (outsideScrollHeader >= kit.length) {
      outsideScrollMutingUp = !outsideScrollMutingUp;
      outsideScrollHeader = 0;
    }
    if (outsideScrollHeader < 0) {
      outsideScrollMutingUp = !outsideScrollMutingUp;
      outsideScrollHeader = kit.length - 1;
    }
    let ret = "";
    for (let a = 0; a < kit.length; a++) {
      ret += (kit[a].muted.value ? " " : SQUARE)
    }

    return (ret);
  }
  this.windowButtonPressed = views.arrangement.windowButtonPressed;
  this.windowButtonReleased = views.arrangement.windowButtonReleased;

  this.selectorButtonReleased = function(event) {

  }
  this.engage = function(event) {
    engageView(lastEngagedViewName, event);
    updateSelectorLeds(event.hardware);
  }
  this.disengage = function(event) {
    engageView(null, event);
  }

  function updateSelectorLeds(hardware) {
    var classicbtn = 0x00;
    var sequencerbtn = 1 << 4;
    var arrangerbtn = 1 << 5;
    var patchmenubtn = 1 << 7;
    var selectedViewBitmap = 0;
    if (views.sequencer.engagedHardwares.has(hardware)) {
      selectedViewBitmap |= sequencerbtn >> 4;
    }
    if (views.arrangement.engagedHardwares.has(hardware)) {
      selectedViewBitmap |= arrangerbtn >> 4;
    }
    hardware.drawSelectors([
      selectedViewBitmap | classicbtn | sequencerbtn | patchmenubtn,
      (selectedViewBitmap | classicbtn | sequencerbtn | arrangerbtn) & ~patchmenubtn,
      (selectedViewBitmap | classicbtn | arrangerbtn) & ~patchmenubtn
    ]);
  }
  var selectedTape = 0;
  var tapesAmount = 1;
}
