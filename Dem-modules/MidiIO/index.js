const EventMessage = require('../../Polimod/datatypes/EventMessage');
const Base= require("../Base");
var MidiIO = function (properties, environment) {
    let MidiInterface=environment.plugins.requires('Midi');
    this.preventBus=true;
    var defaultMessage = new EventMessage({
        value: [0, 36, 0, 90]
    });
    var self = this;
    Base.call(this,properties,environment);
    this.updateInterfaces=function(){
        MidiInterface.rescanMidi();
    }
    this.choke=function(){
        if(!self.currentMidiInterface) return false;
        return self.currentMidiInterface.choke();
    }
    this.getInterfaceNames=function(){
        MidiInterface.rescanMidi();
        return Object.keys(MidiInterface.s_byName);
    }
    self.currentMidiInterface=false;
    this.engageInterfaceNamed=function(name){
        if(!MidiInterface.initialized) MidiInterface.init();
        let subject=MidiInterface.s_byName[name];

        MidiInterface.s.forEach(s=>s.stop(self));
        if(!subject){
            console.error("Error connecting to midi interface by name "+name+": nonexistent. Try:",Object.keys(MidiInterface.s_byName));
            return;
        }else{
            subject.start(self);
            self.currentMidiInterface=subject;
        }
    }
    this.inputFilters=[];
    this.messageReceived = function (evt) {
        if (self.mute) return;
        evt.eventMessage.underImpose(defaultMessage);
        if(self.currentMidiInterface){
            self.currentMidiInterface.output(evt.eventMessage);
        }else{
            console.warn("myMidiInterface is ", self.currentMidiInterface);
        }
    };
    this.availableInterfaces=MidiInterface.s_byName;
    if(properties.midi){
        console.log("MidiIO try use midi interface:",properties.midi);
        self.engageInterfaceNamed(properties.midi);
    }
    this.color=MidiIO.color;
}

MidiIO.color = [127, 127, 127];

module.exports=MidiIO;