"use strict";
var EventMessage = require('../../Polimod/datatypes/EventMessage.js');
// var EventConfigurator=require('../x16utils/EventConfigurator.js');
var BlankConfigurator = require('../x16utils/BlankConfigurator.js');

module.exports = function(environment, parentInteractor) {
  var controlledModule = parentInteractor.controlledModule;
  var self = this;

  var myColor = controlledModule.color;

  var selectedTapeNumber = 0;
  var selectedTape = false;
  var tapesAmount = 1;
  var engagedConfigurator = false;

  var muteMode = false;

  var engagedHardwares = this.engagedHardwares = new Set();



  var configurators = {};
  // configurators.event=new EventConfigurator(this,{baseEvent:controlledModule.baseEventMessage});
  configurators.tapeTime = new BlankConfigurator(this, {
    name: "tape",
    vars: {
      "length": {
        value: 0
      },
      "fold": {
        value: 1,
        factor: 2,
        opDisp: " "
      },
      "fold!": {
        value: 1,
        factor: 2,
        opDisp: " "
      },
      "quantize": {
        value: 0
      },
      "clear!": {
        value: 0
      }
    }
  });

  configurators.tapeTime.vars["length"].changeFunction = configurators.tapeTime.vars["length"].selectFunction = function(thisVar, delta) {
    if (selectedTape) {
      thisVar.value = selectedTape.steps.value;
      if (thisVar.value + delta >= 1) {
        thisVar.value += delta;
        selectedTape.steps.value = thisVar.value;
        selectedTape.refreshNewTapeLengthFromRecording = true;
      }
    }
  }
  configurators.tapeTime.vars["fold!"].changeFunction = function(thisVar, delta) {
    if (selectedTape) {
      thisVar.value = selectedTape.steps.value;
      if (delta > 0) {
        thisVar.value = thisVar.factor;
        thisVar.opDisp = "*";
      } else {
        thisVar.value = 1 / thisVar.factor;
        thisVar.opDisp = "/";
      }
      selectedTape.fold(thisVar.value, true);
    }
  }
  configurators.tapeTime.vars["fold!"].nameFunction = function(thisVar) {
    return "l" + thisVar.opDisp + thisVar.factor + "=" + selectedTape.steps.value;
  }
  configurators.tapeTime.vars["fold"].changeFunction = function(thisVar, delta) {
    if (selectedTape) {
      thisVar.value = selectedTape.steps.value;
      if (delta > 0) {
        thisVar.value = thisVar.factor;
        thisVar.opDisp = "*";
      } else {
        thisVar.value = 1 / thisVar.factor;
        thisVar.opDisp = "/";
      }
      selectedTape.fold(thisVar.value, false);
    }
  }
  configurators.tapeTime.vars["fold"].nameFunction = function(thisVar) {
    return "l" + thisVar.opDisp + thisVar.factor + "=" + selectedTape.steps.value;
  }
  configurators.tapeTime.vars["clear!"].changeFunction = function(thisVar, delta) {
    if (selectedTape) {
      thisVar.value += Math.abs(delta);
      thisVar.value %= 2;
    }
  }
  configurators.tapeTime.vars["clear!"].selectFunction = function(thisVar) {
    thisVar.value = 0;
  }
  configurators.tapeTime.vars["clear!"].disengageFunction = function(thisVar) {
    if (thisVar.value == 1) {
      if (selectedTape)
        controlledModule.clearTape(selectedTape);
    }
  }
  configurators.tapeTime.vars["clear!"].nameFunction = function(thisVar) {
    return (thisVar.value ? "Clear on release" : "cancel");
  }
  var lastEngagedConfigurator = configurators.tapeTime;

  function eachEngagedHardware(cb) {
    for (let hardware of engagedHardwares) {
      cb(hardware);
    }
  }

  parentInteractor.on('interaction', function(event) {
    if (engagedHardwares.has(event.hardware)) {
      if (typeof self[event.type] === 'function') {
        // console.log("sequence view, event ",event);
        self[event.type](event);
      } else {
        console.log("unhandled interaction", event);
      }
    }
  });

  setInterval(function() {
    if (!engagedConfigurator)
      for (let hardware of engagedHardwares) {
        updateLeds(hardware);
      }
  }, 1000 / 50);
  this.windowButtonPressed = function(event){
    if (event.button >= tapesAmount) {
      var newTape = controlledModule.addNewTape();
      controlledModule.selectTape(newTape);
      selectedTape = newTape;
      // selectedTapeNumber = controlledModule.getTapeNum(newTape);
      selectedTapeNumber=controlledModule.getCurrentTapeNumber();
      tapesAmount = controlledModule.tapeCount();
    } else {
      let thereIs = controlledModule.getNumTape(event.button);
      // console.log(thereIs);
      if (thereIs) {
        controlledModule.selectTape(thereIs);
        selectedTapeNumber = event.button;
        selectedTape = thereIs;
      }
    }
    if (muteMode && selectedTape) {
      controlledModule.muteTapeToggle(selectedTape);
    }
  }
  this.windowButtonReleased = function(event){

  }
  this.matrixButtonPressed = function(event) {
    if (engagedConfigurator) {
      engagedConfigurator.matrixButtonPressed(event);
    } else {
      self.windowButtonPressed(event);
      updateHardware(event.hardware);
    }
  };
  this.matrixButtonReleased = function(event) {
    if (engagedConfigurator) {
      engagedConfigurator.matrixButtonReleased(event);
    } else {
      // controlledModule.clearStep(event.button);
      updateHardware(event.hardware);
    }
  };
  this.matrixButtonHold = function(event) {};
  this.selectorButtonPressed = function(event) {
    var hardware = event.hardware;

    if(!selectedTape){
      selectedTape=controlledModule.getNumTape(selectedTapeNumber);
    }

    if (engagedConfigurator) {
      engagedConfigurator.selectorButtonPressed(event);
    } else {
      if (event.button == 7) {
        muteMode = true;
        eachEngagedHardware(updateScreen);
      }
      if (event.button == 1) {
        if (selectedTape) {
          engagedConfigurator = configurators.tapeTime;
          configurators.tapeTime.engage(event);
          eachEngagedHardware(updateScreen);

        }
      }
      lastEngagedConfigurator = engagedConfigurator;
    }
  };
  this.selectorButtonReleased = function(event) {
    var hardware = event.hardware;
    if (engagedConfigurator) {
      engagedConfigurator.disengage(event);
      engagedConfigurator = false;
    }
    if (event.button == 7) {
      muteMode = false;
      eachEngagedHardware(updateScreen);
    }
    // if(event.button==5){
    //   if(engagedConfigurator==configurators.tapeTime){
    //     engagedConfigurator=false;
    //     configurators.tapeTime.engage(event);
    //   }
    // }
  };
  this.encoderScrolled = function(event) {
    if (engagedConfigurator) {
      engagedConfigurator.encoderScrolled(event);
    } else {
      if (lastEngagedConfigurator) {
        lastEngagedConfigurator.encoderScrolled(event)
      }
    }
  };
  this.encoderPressed = function(event) {};
  this.encoderReleased = function(event) {};
  this.engage = function(event) {
    engagedHardwares.add(event.hardware);
    updateHardware(event.hardware);
  };
  this.disengage = function(event) {
    engagedHardwares.delete(event.hardware);
  }
  var updateHardware = function(hardware) {

    updateScreen(hardware);
    updateLeds(hardware);

  }
  var updateScreen = function(hardware) {
    if (!engagedConfigurator) {

      hardware.sendScreenA((controlledModule.name.substring(0, 5)) + ">" + (muteMode ? "mute" : "arrange"));
      hardware.sendScreenB("tape " + selectedTapeNumber + " " + (selectedTape ? (selectedTape.muted.value ? "muted" : "active") : ""));
    }
  }
  var updateLeds = function(hardware) {
    if (!engagedConfigurator) {
      var selectedTapeBitmap = 1 << selectedTapeNumber;
      var mutedTapesBitmap = 0;
      var excitedTapesBitmap = 0;
      controlledModule.eachTape(function(n) {
        if (this.muted.value) mutedTapesBitmap |= 1 << n;
        if (this.excited > 0) excitedTapesBitmap |= 1 << n;
      });
      var tapesBitmap = ~(0xffff << tapesAmount);
      hardware.draw([
          excitedTapesBitmap  |selectedTapeBitmap  | mutedTapesBitmap,
          excitedTapesBitmap  |selectedTapeBitmap  |(tapesBitmap   &~mutedTapesBitmap),
        ( selectedTapeBitmap  ^excitedTapesBitmap  | tapesBitmap)  &~mutedTapesBitmap]);
      // hardware.clear();
      // hardware.drawColor(tapesBitmap&0xffff, myColor);
      // hardware.drawColor(mutedTapesBitmap&0xffff, [127, 126, 127]);
      // hardware.drawColor(selectedTapeBitmap & excitedTapesBitmap&0xffff, [255, 255, 255]);

    }
  }
}
/**/