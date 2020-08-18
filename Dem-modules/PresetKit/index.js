'use strict';
var EventMessage = require('../../Polimod/datatypes/EventMessage.js');
var headers = EventMessage.headers;
var NoteOnTracker = require('../moduleUtils/NoteOnTracker.js');
const Base= require('../Base')
let instances=0;
var PresetKit = function(properties, environment) {
    this.preventBus=true;
    this.autoMap = false;
    var self=this;
    Base.call(this,properties,environment);
    
    
    if (properties.autoMap == true) this.autoMap = 1;
    if (properties.autoMap == 'timbre') this.autoMap = 2;
    if (properties.autoMap == 'note') this.autoMap = 1;

    this.recordingUi = true;
    /** @type {EventMessage[]} */
    var kit = this.kit = [];

    for (var n = 0; n < 16; n++) {
        this.kit[n] = new EventMessage({ value: [headers.triggerOn, -1, -1, -1] });
    }

    if (properties.kit) {
        for (let n=0; n<properties.kit.length; n++) {
            this.kit[n % 16] = new EventMessage({
                value: properties.kit[n]
            });
        }
        self.handle('kitchanged');
    }

    var noteOnTracker = new NoteOnTracker(this);

    this.uiTriggerOn = function(presetNumber, velo) {
        // console.log("VELO",velo);
        if (velo === false || velo === undefined) { velo = -1 }
        if (self.mute) return;

        if (kit[presetNumber] || self.autoMap !== false) {
            if (kit[presetNumber]) {
                if (kit[presetNumber].mute) {
                    return;
                }
            }

            var recMessage = new EventMessage({
                value: [headers.triggerOn, presetNumber, 0, velo]
            });

            self.triggerOn(presetNumber, recMessage, true);
            // console.log("ton", recMessage.value);
            if (self.recordingUi) {
                self.recordOutput(recMessage);
            }
        }
    }

    this.uiTriggerOff = function(presetNumber) {
        // console.log("UI off");
        // console.log("koff=",noteOnTracker[presetNumber]);
        noteOnTracker.ifNoteOff(presetNumber + "ui", function(noteOff) {
            self.output(noteOff, true);
            // console.log(" send off");
            if (self.recordingUi) {
                var recMessage = new EventMessage({
                    value: [headers.triggerOff, presetNumber, 0, 0]
                });

                // console.log(" record off", recMessage.value);
                self.recordOutput(recMessage);
                /*new EventMessage({
                  value: [headers.triggerOff, 0, presetNumber, 0]
                })*/
            }
        });
    }

    this.triggerOn = function(presetNumber, originalMessage, ui = false) {
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
            var onkey = presetNumber;
            if (ui == true) onkey += "ui";
            if(newEvent.value[0]==EventMessage.headers.triggerOn){
                noteOnTracker.add(newEvent, onkey);
            }
            self.output(newEvent);

        } else {
            if (self.mute) return;
            if (kit[presetNumber]) {
                if (!kit[presetNumber].mute) {
                    var outputMessage = kit[presetNumber].clone().underImpose(originalMessage);


                    var onkey = presetNumber;
                    if (ui == true) onkey += "ui";
                        
                    if(newEvent.value[0]==EventMessage.headers.triggerOn){
                        noteOnTracker.add(kit[presetNumber], onkey);
                    }
                    // noteOnTracker.add(kit[presetNumber], presetNumber);
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
            // console.log("noteoff", noteOff.value);
            self.output(noteOff, true);
        });
    }

    this.stepMicro = function() { }
    var recordHead = 0;
    this.recordEvent = function(evM) {
        self.handle('kitchanged');
        kit[recordHead] = new EventMessage(evM);
        console.log("rec",evM);
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
    this.recordingReceived = function(event) {
        var evM = event.eventMessage;

        if (evM.value[0] == headers.record) {
            evM.value.shift();
            console.log("rec",evM);
            this.recordEvent(evM);
        }
    }
    this.messageReceived = function(event) {
        var evM = event.eventMessage;
        // console.log(evM);
        self.handle('receive', event);
        if (evM.value[0] == headers.clockTick) {
            self.stepMicro(evM.value[1], evM.value[2]);
        } else if (evM.value[0] == headers.triggerOn) {
            //nton
            self.triggerOn(evM.value[1], evM);
        } else if (evM.value[0] == headers.triggerOff) {
            //ntoff
            self.triggerOff(evM.value[1]);
        }
    }

}
PresetKit.color = [129, 93, 4];
module.exports = PresetKit

/*
TEsting:
- does it send notes upon tap?
- does it record notes?
- does it send notes off?
- if anote is tapped, then asecond note is tapped and the first note released, does it send all the note off and on?
- if another module sends a note off, does it stop an note that is going on in the interface?
- does the note ons that are being tracked get removed when it receives note off from another module? (example recording to an arpeggiator)


*/
