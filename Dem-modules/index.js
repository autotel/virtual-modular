/*
Discrete event message modules
*/
const Base=require('./Base.js');

const list={
    "Sequencer":require("./Sequencer"),
    "Bus":require("./Bus"),
    "PianoRoll":require("./PianoRoll"),
    "NoteSustainer":require("./NoteSustainer"),
    "PresetKit":require("./PresetKit"),
    "Harmonizer":require("./Harmonizer"),
    "MidiIO":require("./MidiIO"),
    "OscKnobs":require("./OscKnobs"),
    "Arpeggiator":require("./Arpeggiator"),
    "Narp":require("./Narp"),
    "Noise":require("./Noise"),
    "Chord":require("./Chord"),
    "Operator":require("./Operator"),
    "GameOfLife":require("./GameOfLife"),
    "Bouncer":require("./Bouncer"),
    "RouteSequencer":require("./RouteSequencer"),
    "FixNoteLen":require("./FixNoteLen"),
    "DelayClockBased":require("./DelayClockBased"),
    // "ModModify":require("./ModModify"),
    "ClockGenerator":require("./ClockGenerator"),
    // "CalculeitorMidi":require("./CalculeitorMidi"),
    // "TestDummy":require("./TestDummy"),
    // "Composite":require("./Composite"),
    "RecCable":require("./RecCable"),
    "Print":require("./Print"),
    "Physics":require("./Physics"),
}

// const baseApplicator=function(Constructor){
//     let Delegate=function(properties,environment){
//         let actual=new Constructor();
//         Base.call(actual);
//         return actual;
//     }
//     //get static properties from the constructor.
//     for(var a in Constructor){
//         Delegate[a]=Constructor[a];
//     }
//     Delegate.name=Constructor.constructor.name;
//     console.log("D",Delegate.name);
//     return Delegate;
// }
module.exports=function(environment){
    // for(let mn in list){
    //     list[mn]=baseApplicator(list[mn]);
    // }
    environment.moduleConstructors.add(list);
}