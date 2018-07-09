
var JZZ = require('jzz');
// var midiengine=JZZ.requestMIDIAccess().then(function(a){
//     console.log("midi ready",a);
    
// },console.error);
console.log("interface starting MIDI engine..");
var midiengine = JZZ(function(a){
    console.log("JZZ call",a);
}).or('Cannot start MIDI engine!');
console.log("engine", midiengine.info());

var MidiInterface = function () {
    var midi = false;
    var self = this;
    this.name = "unnamed";
    this.deviceName = "none";
    this.out = false;
    this.openMidiOut = function (midiref) {
        self.name = midiref;
        midi=midiengine.openMidiOut(midiref);
        self.deviceName = self.name;
        self.out=function(a){midi.send(a)};
        return this.name;
    }
    this.onIn = false;
    this.in = false;
    this.openMidiIn = function (midiref) {
        self.onIn = function (a, b) { console.log("no callback"); };
        var inCaller = function (a, b) {
            // console.log("HELLOOO",self.onIn);
            if (self.in) {
                console.log("in");
                self.onIn(a, b);
            }
        };
        midi = midiengine.openMidiIn(midiref, inCaller);
        self.name = midiref;
        self.in = true;
        return self.name;
    }
    MidiInterface.list.push(this);
}
MidiInterface.listPorts = function () {
    var info = midiengine.info();
    var ret = { inputs: [], outputs: [] }
    for (var n in info.inputs) {
        ret.inputs.push(info.inputs[n].name);
        console.log(" MIDI input ", info.inputs[n].name);
    }
    for (var n in info.outputs) {
        ret.outputs.push(info.outputs[n].name);
        console.log(" MIDI output ", info.outputs[n].name);
    }
    return ret;
    // return info;
}
MidiInterface.onNewMidiDevice = function (cb) {
    //no runtime detection for now
}
MidiInterface.list = [];

module.exports = MidiInterface;