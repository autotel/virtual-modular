const Base= require("../Base");
var EventMessage = require('../../Polimod/datatypes/EventMessage');
var jazz = require('jazz-midi');


var MidiInterface=function(name){
    let self=this;
    let midi=false;
    let associatedModules=new Set();
    MidiInterface.s.push(this);
    MidiInterface.s_byName[name]=this;
    let active=false;
    var hangingNotes = {};
    
    function sendMidi(sig,midi){
        if(!midi){
            console.error("cannot sendMidi, midi is ",midi);
            return;
        }
        if (midi) {
            if (midi.MidiOut) {
                var isOn = (sig[0] & 0xf0) == 0x90;
                var isOff = (sig[0] & 0xf0) == 0x80;
                midi.MidiOut(...sig);
                isOff |= isOn && (sig[2] == 0);
                if (isOn) {
                    var chan = sig[0] & 0x0f;
                    hangingNotes[[sig[0], sig[1]]] = sig;
                }
                if (isOff) {
                    delete hangingNotes[[sig[0], sig[1]]];
                }
            }
        }
    }
    this.output=function(evtMessage){
        var midiOut = EventMessage.toMidi(evtMessage);
        // console.log("this.output");
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
        associatedModules.forEach(associatedModule=>{
            associatedModule.recordOutput(convertedEvent);
            associatedModule.output(convertedEvent)
        });
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
            }else{
                
                console.log(callingModule.name,"successfully connected to midi in",self.name);
            }
        }
        if(self.canOutput){
            if(!midi.MidiOutOpen(name)){
                console.warn(name+" output could not be opened");
                self.canOutput=false;
            }else{
                console.log(callingModule.name,"successfully connected to midi out",self.name);
            }
        }
        // self.name=name+"-"+(self.canReceive?"I":"")+(self.canOutput?"O":"");
        console.log(self.name+" opened for module "+callingModule.name,{canOutput:self.canOutput,canReceive:self.canReceive});
        active=true;
    }
    this.stop=function(callingModule){
        associatedModules.delete(callingModule);
        if(!midi){
            // console.error("tried to stop midi interface which hasn't started");
            return 
        }
        if(associatedModules.size==0){
            try{ if(midi.midiInClose) midi.midiInClose(); }catch(e){console.error(e)}
            try{ if(midi.midiOutClose) midi.midiOutClose(); }catch(e){console.error(e)}
            active=false;
        }
    }
}
MidiInterface.s=[];
MidiInterface.s_byName={};
MidiInterface.init=function(){
    MidiInterface.initialized=true;
    MidiInterface.rescanMidi();
}
MidiInterface.initialized=false;
MidiInterface.rescanMidi=function(){
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
    this.preventBus=true;
    var defaultMessage = new EventMessage({
        value: [0, 36, 0, 90]
    });
    var self = this;
    Base.call(this,properties,environment);
    this.updateInterfaces=function(){
        MidiInterface.rescanMidi();
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
}

MidiIO.color = [127, 127, 127];

module.exports=MidiIO;