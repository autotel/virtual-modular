const EventEmitter = require('events');
var ee=new EventEmitter();

var JZZ = require('jzz');
// var midiengine=JZZ.requestMIDIAccess().then(function(a){
//     console.log("midi ready",a);

// },console.error);
console.log("interface starting MIDI engine..");
var midiengine = JZZ().or('Cannot start MIDI engine!');

var midiPortsList = {
    inputs: ['none'],
    outputs: ['none']
}
var navigator = require('jzz');
navigator.requestMIDIAccess().then(function (resp) {
    console.log("midisuccess", resp);
    console.log(resp.inputs.entries());
    resp.inputs.forEach(function (a) {
        console.log(a.name);
        midiPortsList.inputs.push(a.name);
    })
    resp.outputs.forEach(function (a) {
        console.log(a.name);
        midiPortsList.outputs.push(a.name);
    })
    ee.emit('midiAccess');
}, console.error);


console.log("engine", midiengine.info());

var MidiInterface = function () {
    var midi = false;
    var self = this;
    this.name = "unnamed";
    this.deviceName = "none";
    this.out = false;
    this.openMidiOut = function (midiref) {
        self.name = midiref;
        midi = midiengine.openMidiOut(midiref);
        self.deviceName = self.name;
        self.out = function (a) { midi.send(a) };
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
MidiInterface.onNewMidiDevice=function(cb){
    ee.on('midiAccess', cb);
}



MidiInterface.listPorts = function () {
    // var info = midiengine.info();
    var ret = midiPortsList;
    return ret;
}
MidiInterface.list = [];

module.exports = MidiInterface;