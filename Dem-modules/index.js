/*
Discrete event message modules

var EventMessage = require('../../../../Polimod/datatypes/EventMessage.js');
var EventConfigurator = require('../Menus/EventConfigurator.js');
var BlankConfigurator = require('../Menus/BlankConfigurator.js');
var RecordMenu = require('../Menus/RecordMenu.js');
var scaleNames = require('./scaleNames.js');
const Base=  require('../Base.js');

*/
const list={
    "Sequencer":require("./Sequencer"),
    "Bus":require("./Bus"),
    "PianoRoll":require("./PianoRoll"),
    "NoteSustainer":require("./NoteSustainer"),
    "PresetKit":require("./PresetKit"),
    "Harmonizer":require("./Harmonizer"),
    "MidiIO":require("./MidiIO"),
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
    "ModModify":require("./ModModify"),
    "ClockGenerator":require("./ClockGenerator"),
    "CalculeitorMidi":require("./CalculeitorMidi"),
    "TestDummy":require("./TestDummy"),
}

module.exports=function(environment){
    environment.modulePrototypes.use(list);
}