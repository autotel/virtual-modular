/*
Discrete event message modules

*/
const list={
    // "Sequencer":require("./Sequencer"),
    // "PianoRoll":require("./PianoRoll"),
    // "NoteSustainer":require("./NoteSustainer"),
    // "PresetKit":require("./PresetKit"),
    // "Harmonizer":require("./Harmonizer"),
    // "MidiIO":require("./MidiIO"),
    // "Arpeggiator":require("./Arpeggiator"),
    // "Narp":require("./Narp"),
    // "Noise":require("./Noise"),
    // "Chord":require("./Chord"),
    // "Operator":require("./Operator"),
    // "GameOfLife":require("./GameOfLife"),
    // "Bouncer":require("./Bouncer"),
    // "RouteSequencer":require("./RouteSequencer"),
    // "FixNoteLen":require("./FixNoteLen"),
    // "DelayClockBased":require("./DelayClockBased"),
    // "ModModify":require("./ModModify"),
    // "ClockGenerator":require("./ClockGenerator"),
    // "CalculeitorMidi":require("./CalculeitorMidi"),
    "TestDummy":require("./TestDummy"),
}
module.exports=function(environment){
    environment.modulePrototypes.use(list);
}