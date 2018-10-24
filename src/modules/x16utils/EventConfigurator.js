'use strict';
var EventMessage = require('../../datatypes/EventMessage.js');

var MyInteractorBase = require('../../interaction/x16basic/interactorBase.js');
/**
user interface pattern that allows to tweak a note. A usage example is the event selector of the monoSequencer, the one used to select the note that will be set on the next tap of a matrix button
@param {interactor} parentInteractor the module interactor that posesses this EventConfigurator
@param {Object} properties {values:{@link array}(deep copy),name:{@link String},valueNames:{@link Array} (shallow copy)}
*/
var EventConfigurator = function (parentInteractor, properties = {}) {
  MyInteractorBase.call(this);
  this.name = "EventMessage";
  var self = this;
  var thisInteractor = this;
  if (properties.name) this.name = properties.name;
  var selectedValueNumber = 1;
  var presetMode = 1;
  var presets = [
    {
      name: "manual",
      value: [-1, -1, -1, -1],
      settings: [0, 1, 2, 3],
      names: ["head", "num 1", "num 2", "num 3"]
    }, {
      name: "note trigger",
      value: [1, 0, -1, -1],
      settings: [1, 2, 3],
      names: ['note', 'timbre', 'velocity']
    }, {
      name: "clock",
      value: [0, 1, 1, -1],
      settings: [1, 2],
      names: ['cycle', 'micro step']
    }, {
      name: "preset change",
      value: [3, 0, 0, -1],
      settings: [1],
      names: ['preset no']
    }, {
      name: "rate change",
      value: [4, 12, 12, -1],
      settings: [1, 2],
      names: ['divided by', 'number']
    },
  ]
  var extraValueNames = [];
  var extraVariables = [];

  var engagedHardwares = new Set();
  /**
  the interface is based on an eventMessage, but the input and output is an eventPattern
  */
  var baseEvent;
  function applyProps() {
    if (!properties.baseEvent) {
      // console.log("nono");
      baseEvent = self.baseEvent = new EventMessage({ value: [0, 0, 0, 0] });
      setPreset(0);
    } else if (properties.baseEvent.isEventMessage) {
      // console.log("NM");
      baseEvent = self.baseEvent = properties.baseEvent;
    } else if (!isNaN(properties.preset)) {
      baseEvent = self.baseEvent = new EventMessage();
      setPreset(properties.baseEvent);
    } else {
      // console.log("nono");
      baseEvent = self.baseEvent = new EventMessage({ value: [0, 0, 0, 0] });
      setPreset(0);
    }
    if (properties.values) {
      for (var a in properties.values) {
        baseEvent.value[a] = properties.values[a];
      }
    }
  }
  function setPreset(presetNumber) {
    if (!presets[presetNumber]) {
      console.warn("event configurator: preset " + presetNumber + " doesn't exist");
      return false;
    }
    if (presets[presetNumber].settings.length <= selectedValueNumber) {
      selectedValueNumber = 0;
    }
    //for every value that is settable in the preset, set it to the baseEvent value
    for (var setnum of presets[presetNumber].settings) {
      presets[presetNumber].value[setnum] = baseEvent.value[setnum];
    }
    for (var a in presets[presetNumber].value) {
      baseEvent.value[a] = presets[presetNumber].value[a];
    }
    presetMode = presetNumber;
  }
  this.addextraVariables = function (valuesList) {
    for (var a in valuesList) {
      extraValueNames.push(a);
      extraVariables.push(valuesList[a]);
    }
  }
  if (properties.extraVariables) this.addextraVariables(properties.extraVariables);
  var valueChanged = function () {
    //value can change while not engaged
    for (let hardware of engagedHardwares) {
      updateLeds(hardware);
    }
  }

  var passiveUpdateScreen = function () {
    //value can change while not engaged
    for (let hardware of engagedHardwares) {
      updateScreen(hardware);
    }
  }
  this.passiveUpdateScreen = passiveUpdateScreen;
  var updateLeds = function (hardware) {
    var amountOfVariables = presets[presetMode].settings.length;

    var eventLengthBmp = ~(0xFFFF << amountOfVariables);

    // console.log("PL",presets.length);
    var presetsBmp = (0xFFFF << (16 - presets.length));
    var selectedPresetBmp = 0x1 << (16 - presets.length + presetMode);

    var extraVariablesBmp = (0xF0 & ~(0xF0 << (extraValueNames.length)));

    var selectBmp = 1 << selectedValueNumber;

    selectBmp |= selectedPresetBmp;
    hardware.draw([selectBmp | eventLengthBmp, selectBmp | extraVariablesBmp, selectBmp | eventLengthBmp | extraVariablesBmp | presetsBmp]);
  }
  var updateScreen = function (hardware) {
    hardware.sendScreenA("" + presets[presetMode].name);
    if (selectedValueNumber < presets[presetMode].settings.length) {
      var absoluteSelectedValueNumber = presets[presetMode].settings[selectedValueNumber];

      hardware.sendScreenB(
        presets[presetMode].names[selectedValueNumber]
        + "=" + (baseEvent.value[absoluteSelectedValueNumber] === -1 ? "transparent" : baseEvent.value[absoluteSelectedValueNumber])
      );
      // console.log("Value->settings->",presets[presetMode].settings[selectedValueNumber] );
    } else {
      var selectedExtraValue = selectedValueNumber - baseEvent.value.length;
      if (extraValueNames[selectedExtraValue]) {
        hardware.sendScreenB(
          extraValueNames[selectedExtraValue]
          + "=" + extraVariables[selectedExtraValue].value
        );
      }

    }
  }
  this.matrixButtonPressed = function (event) {
    var eventResponse = {}
    var hardware = event.hardware;
    if (event.data[0] < 4) {
      //selection of the events variable
      selectedValueNumber = event.data[0];
      // console.log("event var select",presets[presetMode].name);
    } else if (event.data[0] < extraVariables.length + 4) {
      //selection of added vars
      selectedValueNumber = event.data[0];
      console.log("extra var select", presets[presetMode].name);
    } else if (event.data[0] - presets.length > 0) {
      //selection of a preset event
      setPreset(presets.length + (event.data[0] - 16));
      console.log("preset select", presets[presetMode].name);
      eventResponse.presetSelected = true;
    }
    updateLeds(hardware);
    updateScreen(hardware);
    return eventResponse;
  };
  this.matrixButtonReleased = function (event) {
    var hardware = event.hardware;
  };
  this.selectorButtonPressed = function (event) {
    var hardware = event.hardware;
  };
  this.selectorButtonReleased = function (event) {
    var hardware = event.hardware;
  };
  this.encoderScrolled = function (event) {
    var hardware = event.hardware;
    var absoluteSelectedValueNumber = presets[presetMode].settings[selectedValueNumber];
    if (baseEvent.value.length > selectedValueNumber) {
      // console.log("val:"+baseEvent.value[selectedValueNumber]);
      baseEvent.value[absoluteSelectedValueNumber] += event.delta;
      if (isNaN(baseEvent.value[absoluteSelectedValueNumber])) baseEvent.value[absoluteSelectedValueNumber] = 0;
      presets[presetMode].value = baseEvent.value;
      console.log("->val:" + baseEvent.value[absoluteSelectedValueNumber], absoluteSelectedValueNumber);
      updateScreen(hardware);
    } else if (extraValueNames.length > selectedValueNumber - baseEvent.value.length) {
      // value += event.delta;
      var thisVar = extraVariables[selectedValueNumber - 4];
      if (thisVar.changeFunction) {
        thisVar.changeFunction(thisVar, event.delta, event);
      } else {
        thisVar.value += event.delta;
      }
      updateScreen(hardware);
    }
    return { currentEvent: baseEvent, selectedValueNumber: absoluteSelectedValueNumber, selectedValueValue: baseEvent.value[absoluteSelectedValueNumber] }
  };
  this.encoderPressed = function (event) {
    var hardware = event.hardware;
  };
  this.encoderReleased = function (event) {
    var hardware = event.hardware;
  };
  this.engage = function (event) {
    var hardware = event.hardware;
    engagedHardwares.add(hardware);
    updateLeds(hardware);
    updateScreen(hardware);
  };
  this.disengage = function (event) {
    var hardware = event.hardware;
    engagedHardwares.delete(hardware);
  }

  this.Filter = function (criteria) {
    this.criteria = criteria;
    var criteria = this.criteria;
    return function (message) {
      var onMessage = message.on
      var ret = true;
      if (criteria) {
        if (criteria.header)
          ret &= (onMessage.value[0] === baseEvent.value[0]);
        if (criteria.value_a)
          ret &= (onMessage.value[1] === baseEvent.value[1]);
        if (criteria.value_b)
          ret &= (onMessage.value[2] === baseEvent.value[2]);
        if (criteria.value_c)
          ret &= (onMessage.value[3] === baseEvent.value[3]);
      }
      return ret;
    }
  }


  this.setFromEventMessage = function (EvMes, hardware) {
    // console.log("setFromEventMessage");
    if (EvMes) {
      baseEvent = new EventMessage(EvMes);
      if (hardware) {
        updateScreen(hardware);
      } else {
        passiveUpdateScreen();
      }
    }

  }

  this.getEventMessage = function () {

    // if(!newDest) newDest=options[0].presets[presetMode].names(0);
    var newEvMes = new EventMessage(baseEvent);
    // console.log("getEventMessage",newEvMes);
    return newEvMes;
  }
  applyProps();
};
module.exports = EventConfigurator;
