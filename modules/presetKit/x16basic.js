"use strict";
var EventMessage = require('../../datatypes/EventMessage.js');
var EventConfigurator = require('../x16utils/EventConfigurator.js');
var BlankConfigurator = require('../x16utils/BlankConfigurator.js');
var RecordMenu = require('../x16utils/RecordMenu.js');
var RecorderModuleWindow = require('../x28utils/RecorderModuleWindow.js');
var SQUARE = String.fromCharCode(252);
/**
definition of a presetkit interactor for the x16basic controller hardware
*/
module.exports = function(environment) {
  this.Instance = function(controlledModule) {
    // this.controlledModule=controlledModule;
    environment.interactionMan.interfaces.x16basic.interactorBase.call(this, controlledModule);
    var engagedHardwares = new Set();
    var thisInteractor = this;
    //configurators setup
    var engagedConfigurator = false;
    var configurators = {};
    var muteBmp = 0;
    configurators.event = new EventConfigurator(this, {
      values: [1, 1, 60, 90]
    });
    configurators.record = new RecordMenu(this, {
      environment: environment,
      controlledModule: controlledModule
    });
    var utilAction = false;
    configurators.util = new BlankConfigurator(this, {
      name: "utils",
      engageFunction: function(thisConfigurator) {
        // utilAction=false;
        // thisConfigurator.select(0,false);
      },
      disengageFunction: function(thisConfigurator) {
        utilAction = false;
        thisConfigurator.select(0, false);
      },
      variables: {
        "none": {
          nameFunction: function() {
            return "mute, dup";
          }
        },
        "mute": {
          nameFunction: function(thisVar) {
            return "mute preset";
          },
          selectFunction: function(thisVar) {
            utilAction = function(event) {

              var muted = controlledModule.togglePresetMute(event.button);
              //draw muted bmp
              (muted ? muteBmp |= 1 << event.button : muteBmp &= ~(1 << event.button));
              updateLeds(event.hardware);
              // console.log("ut");
            };
          }
        },
        "duplicate": {
          nameFunction: function(thisVar) {
            var spv = "[]";
            if (thisVar.sourcePreset) {
              spv = thisVar.sourcePreset.on.value;
            }
            return "apply:" + JSON.stringify(spv);
          },
          selectFunction: function(thisVar) {
            if (selectedPresetNumber !== false) {
              thisVar.sourcePreset = new EventMessage(controlledModule.kit[selectedPresetNumber]);
              // event.hardware.sendScreenB("apply:"+JSON.stringify(spv));
              utilAction = function(event) {
                controlledModule.kit[event.button] = thisVar.sourcePreset;
                var spv = "false";
                if (thisVar.sourcePreset) {
                  spv = thisVar.sourcePreset.value;
                }
                selectedPresetNumber = event.button;
                event.hardware.sendScreenB("" + selectedPresetNumber + "<" + JSON.stringify(spv));
              };
            }
          },
          sourcePreset: false
        },
        "duplicate[1]++": {
          nameFunction: function(thisVar) {
            var spv = "[]";
            if (thisVar.sourcePreset) {
              spv = thisVar.sourcePreset.value;
            }
            return "apply:" + JSON.stringify(spv);
          },
          selectFunction: function(thisVar) {
            // console.log("selec");
            if (selectedPresetNumber !== false) {
              thisVar.sourcePreset = new EventMessage(controlledModule.kit[selectedPresetNumber]);
              // event.hardware.sendScreenB("apply:"+JSON.stringify(spv));
              utilAction = function(event) {
                controlledModule.kit[event.button] = new EventMessage(thisVar.sourcePreset);
                // console.log(controlledModule.kit[event.button]);
                var spv = "false";
                if (thisVar.sourcePreset) {
                  spv = thisVar.sourcePreset.value;
                  spv[1]++;
                }
                selectedPresetNumber = event.button;
                event.hardware.sendScreenB("" + selectedPresetNumber + "<" + JSON.stringify(spv));
              };
            }
          },
          sourcePreset: false
        },
        "duplicate[2]++": {
          nameFunction: function(thisVar) {
            var spv = "[]";
            if (thisVar.sourcePreset) {
              spv = thisVar.sourcePreset.value;
            }
            return "apply:" + JSON.stringify(spv);
          },
          selectFunction: function(thisVar) {
            console.log("selec");
            if (selectedPresetNumber !== false) {
              thisVar.sourcePreset = new EventMessage(controlledModule.kit[selectedPresetNumber]);
              // event.hardware.sendScreenB("apply:"+JSON.stringify(spv));
              utilAction = function(event) {
                controlledModule.kit[event.button] = new EventMessage(thisVar.sourcePreset);
                var spv = "false";
                if (thisVar.sourcePreset) {
                  spv = thisVar.sourcePreset.value;
                  spv[2]++;
                }
                selectedPresetNumber = event.button;
                event.hardware.sendScreenB("" + selectedPresetNumber + "<" + JSON.stringify(spv));
              };
            }
          },
          sourcePreset: false
        }
      }
    });
    var lastEngagedConfigurator = configurators.event;
    // configurators.one=new BlankConfigurator(this,{
    //   name:"T",
    //   values:{
    //   }
    // });
    var availablePresetsBitmap = 0;
    var highlightedBitmap = 0;
    var selectedPresetNumbers = [];

    let recorderModuleWindow=new RecorderModuleWindow(controlledModule,environment);

    function eachSelectedPresetNumber(cb) {
      selectedPresetNumbers.map(cb);
    }

    function lastSelectedPresetNumber(cb) {
      cb(selectedPresetNumbers[selectedPresetNumbers.length - 1], selectedPresetNumbers.length - 1);
    }
    controlledModule.on('extrigger', function(event) {
      highlightedBitmap |= 1 << event.preset;
      setTimeout(function() {
        var num = event.preset;
        highlightedBitmap &= ~(1 << num);
      }, 500);
    });
    setInterval(function() {
      passiveUpdateLeds();
    }, 1000 / 20);
    controlledModule.on('kit changed', function() {
      updateAvailablePresetsBitmap();
    });
    this.matrixButtonPressed = function(event) {
      var hardware = event.hardware;
      if (utilAction) {
        utilAction(event);
        updateLeds(hardware);
      } else if (engagedConfigurator) {
        engagedConfigurator.matrixButtonPressed(event);
        if (engagedConfigurator == configurators.util) {
          updateLeds(hardware);
        } else {
          // engagedConfigurator.matrixButtonPressed(event);
        }
      } else {

        if (event.tied) {
          selectedPresetNumbers.push(event.button);
        } else {
          selectedPresetNumbers = [event.button];
        }
        controlledModule.uiTriggerOn(event.button);

        if (controlledModule.kit[event.button])
          if (lastEngagedConfigurator == configurators.event) {
            // configurators.event.baseEvent=controlledModule.kit[selectedPresetNumber].on;
            lastSelectedPresetNumber(function(selectedPresetNumber) {
              configurators.event.setFromEventMessage(controlledModule.kit[selectedPresetNumber], hardware);
            });
          }
        updateHardware(hardware);
      }
    };
    this.matrixButtonReleased = function(event) {
      if (engagedConfigurator) {
        engagedConfigurator.matrixButtonReleased(event);
      } else {
        controlledModule.uiTriggerOff(event.button);
      }
    };
    this.matrixButtonHold = function(event) {
      if (engagedConfigurator) {
        engagedConfigurator.matrixButtonHold(event);
      } else {}
    };
    this.selectorButtonPressed = function(event) {
      if (engagedConfigurator) {
        engagedConfigurator.selectorButtonPressed(event);
      } else {
        if (event.button == 1) {
          lastEngagedConfigurator = engagedConfigurator = configurators.event;
          engagedConfigurator.engage(event);
        } else if (event.button == 2) {
          lastEngagedConfigurator = engagedConfigurator = configurators.record;
          engagedConfigurator.engage(event);
        } else if (event.button == 3) {
          lastEngagedConfigurator = engagedConfigurator = configurators.util;
          engagedConfigurator.engage(event);
        } else if (event.button >= 8) {
          let wevent={type:event.type, originalMessage:event.originalMessage, button:event.button, hardware:event.hardware};
          wevent.button-=8;
          recorderModuleWindow.windowButtonPressed(wevent);
        }
      }
    };
    this.selectorButtonReleased = function(event) {
      if (engagedConfigurator) {
        engagedConfigurator.disengage(event);
        engagedConfigurator = false;
        updateHardware(event.hardware);
      } else {}
    };
    var updateAvailablePresetsBitmap = function() {
      availablePresetsBitmap = 0;
      for (var a in controlledModule.kit) {
        availablePresetsBitmap |= 1 << a;
      }
    }
    this.encoderScrolled = function(event) {
      if (engagedConfigurator) {
        engagedConfigurator.encoderScrolled(event);
      } else {
        if (lastEngagedConfigurator) {
          let configuratorResponse = lastEngagedConfigurator.encoderScrolled(event);
          if (configuratorResponse) {
            eachSelectedPresetNumber(function(selectedPresetNumber) {
              controlledModule.kit[selectedPresetNumber].value[configuratorResponse.selectedValueNumber] = configuratorResponse.selectedValueValue;
            });
            updateAvailablePresetsBitmap();
          };
        }
      }
      updateHardware(event.hardware);
    };
    let outsideScrollHeader = 0;
    let outsideScrollMutingUp = true;
    this.outsideScroll = function(event) {
      let delta = event.delta;
      let kit = controlledModule.kit;

      // console.log(outsideScrollHeader);

      kit[outsideScrollHeader].mute = (outsideScrollMutingUp ? (delta > 0) : (delta < 0));
      // console.log(`(${outsideScrollMutingUp}?(${delta>0}):(${delta<0}))=${(outsideScrollMutingUp?(delta>0):(delta<0))}`);

      if (kit[outsideScrollHeader].mute) {
        muteBmp |= 1 << outsideScrollHeader;
      } else {
        muteBmp &= ~(1 << outsideScrollHeader);
      }

      outsideScrollHeader += delta;
      if (outsideScrollHeader >= 16) {
        outsideScrollMutingUp = !outsideScrollMutingUp;
        outsideScrollHeader = 0;
      }
      if (outsideScrollHeader < 0) {
        outsideScrollMutingUp = !outsideScrollMutingUp;
        outsideScrollHeader = 15;
      }
      let ret = "";
      for (let a = 0; a < 16; a++) {
        ret += (kit[a].mute ? " " : SQUARE)
      }

      return (ret);
    }
    this.encoderPressed = function(event) {
      if (engagedConfigurator) {
        engagedConfigurator.encoderPressed(event);
      } else {}
    };
    this.encoderReleased = function(event) {
      if (engagedConfigurator) {
        engagedConfigurator.encoderReleased(event);
      } else {}
    };
    this.engage = function(event) {
      engagedHardwares.add(event.hardware);
      updateHardware(event.hardware);
      recorderModuleWindow.engage(event);
    };
    this.disengage = function(event) {
      outsideScrollHeader = 0;
      engagedHardwares.delete(event.hardware);
    }
    var updateHardware = function(hardware) {
      hardware.sendScreenA(thisInteractor.name);
      updateLeds(hardware);
    }

    function passiveUpdateLeds() {
      if (!engagedConfigurator)
        for (let hardware of engagedHardwares) {
          updateLeds(hardware);
        }
    }
    var updateLeds = function(hardware) {
      var selectedPresetBitmap = 0;
      eachSelectedPresetNumber(function(selectedPresetNumber) {
        selectedPresetBitmap |= 1 << selectedPresetNumber;
      });
      hardware.draw([
        highlightedBitmap | selectedPresetBitmap,
        (highlightedBitmap | selectedPresetBitmap | availablePresetsBitmap) ^ muteBmp,
        selectedPresetBitmap | availablePresetsBitmap
      ]);
    }
  }
}