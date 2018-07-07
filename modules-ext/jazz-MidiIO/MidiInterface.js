
var JZZ = require('jzz');
console.log("interface starting MIDI engine..");
var midi = JZZ().or('Cannot start MIDI engine!');
console.log("engine",midi.info());
// JZZ.openMidiOut(console.log);

var MidiInterface = function () {
    /**
    environment will call the static initialization function when it registers a new module; if such function is present.
    
    */
    var self = this;
    this.name = "unnamed";
    this.deviceName = "none";
    this.out = false;
    this.openMidiOut = function (midiref) {
        self.name = midi.openMidiOut(midiref);
        self.deviceName = self.name;
        self.out = function (a, b, c) { midi.send([a, b, c]) };
        return this.name;
    }
    this.onIn = false;
    this.in = false;
    this.openMidiIn = function (midiref) {
        self.onIn = function (a, b) { console.log("no callback"); };
        var inCaller = function (a, b) {
            // console.log("HELLOOO",self.onIn);
            if (self.in) {
                // console.log("in");
                self.onIn(a, b);
            }
        };
        self.name = midi.openMidiIn(midiref, inCaller);
        self.in = true;
        return this.name;
    }
    MidiInterface.list.push(this);
}
MidiInterface.listPorts = function () {
    return midi.info();
}
MidiInterface.list = [];

module.exports=MidiInterface;