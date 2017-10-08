/**
Module that enables interconnectivity with midi inputs and midi outputs, presumably via USB.
*/
'use strict';
var EventMessage=require('../../datatypes/eventMessage.js');
var moduleInstanceBase=require('../moduleInstanceBase');
var uix16Control=require('./x16basic');
var midiInstance=require('./instance');

var jazz = require('jazz-midi');

/**
@constructor ModuleSingleton
singleton, only one per run of the program
every module needs to run at the beginning of the runtime to register it's interactor in the interactionManager
*/
module.exports=function(environment){return new (function(){
  var interactorSingleton=this.InteractorSingleton=new uix16Control(environment);
  var instanced=0;
  var getName=function(){
    this.name=this.baseName+" "+instanced;
    instanced++;
  }

  //open every possible midi ports i/o
  var midiOpenFail=false;
  var currentPortNumber=0;
  var openedMidiPorts=[];
  while(!midiOpenFail){
    var midi = new jazz.MIDI();
    var name = midi.MidiOutOpen(currentPortNumber);
    if(name){
      openedMidiPorts[name]={output:midi};
      console.log('   -openedMidiPorts ['+name+'].output = opened Midi port');
      midi.MidiOut(0x90,60,100); midi.MidiOut(0x90,64,100); midi.MidiOut(0x90,67,100);
      setTimeout(function(){
        midi.MidiOut(0x80,60,0); midi.MidiOut(0x80,64,0); midi.MidiOut(0x80,67,0);
      }, 3000);
    } else {
      console.log('   -No out port '+currentPortNumber);
      midiOpenFail=true;
    }

    var name = midi.MidiInOpen(currentPortNumber);
    if(name){
      if(!openedMidiPorts[name]) openedMidiPorts[name]={};
      openedMidiPorts[name].input=midi;
      console.log('   -openedMidiPorts ['+name+'].input = opened Midi port');
      midiOpenFail=false;
    } else {
      console.log('   -No in port '+currentPortNumber);
      if(midiOpenFail) midiOpenFail=true;
    }
    currentPortNumber++;
  }

  environment.on('created',function(){
    for(var midiItem in openedMidiPorts){
      console.log("instancing midi");
      environment.modulesMan.addModule("midiIO",{
        midiPort:openedMidiPorts[midiItem],
        name:midiItem
      });
    }
  });

  /**
  @constructor
  the instance of the of the module, ment to be instantiated multiple times.
  require to moduleBase.call
  */
  this.Instance=function(properties){
    moduleInstanceBase.call(this);
    this.baseName=(properties.name?properties.name:"Midi");
    getName.call(this);
    var myInteractor=this.interactor=new interactorSingleton.Instance(this);
    this.interactor.name=this.name;
    var midi=properties.midiPort;
    var baseRemove=this.remove;
    this.remove=function(){
      if(midi.input) midi.input.MidiInClose();
      if(midi.output) midi.output.MidiOutClose();
      baseRemove();
    }
  }
})};