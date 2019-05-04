const Base= require("../Base");
var EventMessage = require('../../Polimod/datatypes/EventMessage');
var jazz = require('jazz-midi');

function sendMidi(sig,midi){
    if(!midi){
        console.error("cannot sendMidi, midi is ",midi);
        return;
    }
    var a = sig[0];
    var b = sig[1];
    var c = sig[2];
    if (midi) {
    if (midi.out) {
        var isOn = (a & 0xf0) == 0x90;
        var isOff = (a & 0xf0) == 0x80;
        midi.out([a, b, c]);
        isOff |= isOn && (c == 0);
        if (isOn) {
            var chan = a & 0x0f;
            hangingNotes[[a, b]] = [a, b, c];
        }
        if (isOff) {
            delete hangingNotes[[a, b]];
        }
    }
    }
}

var MidiInterface=function(name){
    let self=this;
    let midi=false;
    let associatedModules=new Set();
    MidiInterface.s.push(this);
    MidiInterface.s_byName[name]=this;
    let active=false;
    var hangingNotes = {};
    
    this.output=function(evtMessage){
        var midiOut = EventMessage.toMidi(evtMessage);
        sendMidi(midiOut,midi);
    }
    this.choke = function () {
        let choked = false;
        for (var a in hangingNotes) {
          choked = true;
          let h = hangingNotes[a];
          sendMidi([(h[0] & 0x0f) | 0x80, h[1], h[2]],midi);
        }
        if (!choked) {
          for (let a = 0; a < 16; a++) {
            for (let b = 0; b < 127; b++) {
              sendMidi([0x80 | a, b, 0],midi);
            }
          }
        }
        return choked;
    }
    this.canReceive=false;
    this.canOutput=false;
    
    this.name=name;

    this.onMidiReceived=function(midiEvent,timestamp){
        var convertedEvent=EventMessage.fromMidi(midiEvent); 
        associatedModules.forEach(am=>am.output(convertedEvent));
    }
    this.start=function(callingModule){
        associatedModules.add(callingModule);
        if(!midi) midi = new jazz.MIDI();
        if(self.canReceive){
            if(!midi.MidiInOpen(name, function(t, msg){
                self.onMidiReceived(msg,t);
            })){
                console.warn(name+" input could not be opened");
                self.canReceive=false;
            }
        }
        if(self.canOutput){
            if(!midi.MidiOutOpen(name)){
                console.warn(name+" output could not be opened");
                self.canOutput=false;
            }
        }
        self.name=name+"-"+(self.canReceive?"I":"")+(self.canOutput?"O":"");
        active=true;
    }
    this.stop=function(callingModule){
        associatedModules.delete(callingModule);
        if(!midi){
            // console.error("tried to stop midi interface which hasn't started");
            return 
        }
        if(associatedModules.size==0){
            try{ midi.midiInClose(); }catch(e){console.error(e)}
            try{ midi.midiOutClose(); }catch(e){console.error(e)}
            active=false;
        }
    }
}
MidiInterface.s=[];
MidiInterface.s_byName={};
function rescanMidi(){
    let plist={};
    let inList=jazz.MidiInList();
    inList.forEach((name)=>{
        if(!plist[name]) plist[name]={};
        plist[name].canReceive=true;
    })
    let outList=jazz.MidiInList();
    outList.forEach((name)=>{
        if(!plist[name]) plist[name]={};
        plist[name].canOutput=true;
    })
    for(var interfaceName in plist){
        let nit=MidiInterface.s_byName[interfaceName];
        if(!nit) nit=new MidiInterface(interfaceName);
        nit.canReceive=plist[interfaceName].canReceive;
        nit.canOutput=plist[interfaceName].canOutput;
    }
}
var MidiIO = function (properties, environment) {
    var self = this;
    Base.call(this,properties,environment);
    this.updateInterfaces=function(){
        rescanMidi();
    }
    this.getInterfaceNames=function(){
        rescanMidi();
        return Object.keys(MidiInterface.s_byName);
    }
    this.engageInterfaceNamed=function(name){
        let subject=MidiInterface.s_byName[name];
        if(!subject){
            console.error("Error connecting to midi interface by name "+name+": nonexistent");
            return;
        }
        MidiInterface.s.forEach(s=>s.stop(self));
        subject.start(self);

    }
    this.availableInterfaces=MidiInterface.s_byName;
}

MidiIO.color = [127, 127, 127];

module.exports=MidiIO;