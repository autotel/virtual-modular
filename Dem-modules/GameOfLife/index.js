'use strict';
var EventMessage = require('../../Polimod/datatypes/EventMessage.js');
const Base= require("../Base");

var NoteOnTracker = require('../moduleUtils/NoteOnTracker.js');
// var clockSpec=require('../standards/clock.js');
var headers = EventMessage.headers;

var testcount = 0;
var testGetName = function () {
  this.name = this.baseName + " " + testcount;
  testcount++;
}
/**
@constructor
the instance of the of the module, ment to be instantiated multiple times.
require to moduleBase.call
*/
var GameOfLife = function (properties,environment) {
  Base.call(this,properties,environment);
  var noteOnTracker = new NoteOnTracker(this);
  var thisInstance = this;
  var myBitmap = 0;
  var settings = this.settings = {
    duration: { value: false }
  }
  var clock = this.clock = {
    subSteps: 4,
    subStep: 0
  }
  this.baseName = "game of life";
  testGetName.call(this);
  if (properties.name) this.name = properties.name;
  var self = this;
  var baseEventMessage = this.baseEventMessage = new EventMessage({
    value: [headers.triggerOn, -1, -1, -1]
  });

  

  var cells = [
    [0, 0, 0, 0],
    [0, 0, 0, 0],
    [0, 0, 0, 0],
    [0, 0, 0, 0]
  ];
  var fixedCells = 0;
  var setStep = this.setStep = function (square) {
    while (square < 0) square += 16;
    // console.log("st",square);
    myBitmap |= 1 << square;
    cells[Math.floor(square / 4)][square % 4] = 1;
  }
  var clearStep = this.clearStep = function (square) {
    myBitmap &= ~(1 << square);
    cells[Math.floor(square / 4)][square % 4] = 0;
  }

  var toggleStep = this.toggleStep = function (square) {
    var x = Math.floor(square / 4);
    var y = square % 4;
    // console.log(x,y);
    if (cells[x][y] == 1) {

      clearStep(square);
    } else {

      setStep(square);
    }
    return myBitmap;
  }

  var setFixedStep = this.setFixedStep = function (square) {
    fixedCells |= 1 << square;
    setStep(square);
  }
  var clearFixedStep = this.clearFixedStep = function (square) {
    fixedCells &= ~(1 << square);
    clearStep(square);
  }
  var toggleFixedStep = this.toggleFixedStep = function (square) {
    var x = Math.floor(square / 4);
    var y = square % 4;
    if (cells[x][y]) {
      clearFixedStep(square);
    } else {
      setFixedStep(square);
    }
    return myBitmap;
  }

  this.cellOutput = function (x, y, val) {
    if (self.mute) return;
    if (val) {
      var outMessage = new EventMessage.from(baseEventMessage);
      outMessage.value[1] = baseEventMessage.value[1] + (x * 4 + y);
      noteOnTracker.add(outMessage, [x, y]);
      // console.log("ON",outMessage.value);
      thisInstance.output(outMessage);
    } else {

    }
  }
  this.recordingReceived = function (evt) {
    if (evt.eventMessage.value[0] == headers.record) {
      evt.eventMessage.value.shift();
      thisInstance.messageReceived(evt);
    }
  }
  this.messageReceived = function (evt) {
    //to achieve microsteps divisions

    var eventMessage = evt.eventMessage;
    if (evt.eventMessage.value[0] == headers.clockTick) {
      var microStep = eventMessage.value[2];
      var microSteps = eventMessage.value[1];
      if (clock.subSteps < 1) {
        microSteps *= clock.subSteps;
        console.log("MCL", microStep % microSteps);
      }
      if (microStep % microSteps == 0) {
        clock.subStep++;
        if (clock.subStep >= clock.subSteps) {
          clock.subStep = 0;
          if (settings.duration.value) {
            noteOnTracker.empty(function (noff) {
              // console.log("OFF",noff.value);
              thisInstance.output(noff, true);
            });
            cellOperation();
          } else {
            cellOperation();
            noteOnTracker.empty(function (noff) {
              // console.log("OFF",noff.value);
              thisInstance.output(noff, true);
            });
          }
          this.handle('step');
        }
      }
    } else if (evt.eventMessage.value[0] == headers.triggerOn) {
      // this.setFixedStep(evt.eventMessage.value[2]%16);
      this.setStep(evt.eventMessage.value[1] % 16);
    } else if (evt.eventMessage.value[0] == headers.triggerOff) {
      // this.clearFixedStep(evt.eventMessage.value[2]%16);
    } else if (evt.eventMessage.value[0] == headers.triggerOff + 1) {
      // this.setStep(evt.eventMessage.value[2]%16);
    }
  }

  this.getBitmap16 = function () {
    return myBitmap;
  }
  // this.onRemove = function () {
  //   noteOnTracker.empty(function (noff) {
  //     thisInstance.output(noff, true);
  //   });
  //   return true;
  // }

  function cellOperation() {
    // console.log("step");
    for (var x in cells) {
      for (var y in cells[x]) {
        var neighbours = 0;
        x = parseFloat(x);
        y = parseFloat(y);
        var left = x - 1;
        if (left == -1) left = 3;
        var right = x + 1;
        if (right == 4) right = 0;
        var top = y - 1;
        if (top == -1) top = 3;
        var bott = y + 1;
        if (bott == 4) bott = 0;

        // console.log("x"+x,"y"+y,"left"+left,"right"+right,"top"+top,"bott"+bott);

        neighbours += cells[left][top];
        neighbours += cells[left][y];
        neighbours += cells[left][bott];

        neighbours += cells[x][top];
        // neighbours+=cells[x][y];
        neighbours += cells[x][bott];

        neighbours += cells[right][top];
        neighbours += cells[right][y];
        neighbours += cells[right][bott];

        var linearCord = (x * 4 + y);

        // if(fixedCells &(1<<linearCord)){
        //   cells[x][y]=1;
        //   myBitmap|=1<<linearCord;
        // }else{
        if (neighbours < 2 || neighbours > 3) {
          myBitmap &= ~(1 << linearCord);
        } else if (neighbours == 3) {
          myBitmap |= 1 << linearCord;
        }
        // }
      }
    }
    // myBitmap|=fixedCells;
    for (var a = 0; a < 16; a++) {
      var x = Math.floor(a / 4);
      var y = a % 4;
      var set = myBitmap >> a & 1;
      cells[x][y] = set;
      thisInstance.cellOutput(x, y, set > 0);
    }
  }
};

GameOfLife.color = [255, 0, 233];
module.exports = GameOfLife;