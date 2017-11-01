/**
Module that enables interconnectivity with midi inputs and midi outputs, presumably via USB.
*/
'use strict';
var CLOCKABSOLUTEHEADER = 0x03;
var CLOCKTICKHEADER = 0x00;
var TRIGGERONHEADER = 0x01;
var TRIGGEROFFHEADER = 0x02;
var RECORDINGHEADER = 0xAA;
var EventMessage=require('../../datatypes/EventMessage.js');
var moduleInstanceBase=require('../moduleInstanceBase');
var uix16Control=require('./x16basic');
var midiInstance=require('./instance');

var fs=require('fs');
var path=require('path');
var midiOptions = require('./midi-options.js');

var jazz = require('jazz-midi');

/**
@constructor ModuleSingleton
singleton, only one per run of the program
every module needs to run at the beginning of the runtime to register it's interactor in the interactionManager
*/
module.exports=function(environment){return new (function(){
  var defaultMessage=new EventMessage({value:[0,0,0,0]});
  var interactorSingleton=this.InteractorSingleton=new uix16Control(environment);
  var instanced=0;
  var getName=function(){
    this.name=this.baseName+" "+instanced;
    instanced++;
  }

  //open every possible midi ports i/o
  var midiOpenFail=false;
  var midiDevicesAmount=1;
  var currentPortNumber=0;
  var openedMidiPorts=[];

  if(midiOptions.outputs===undefined){
    midiOptions.outputs={};
  }
  if(midiOptions.inputs===undefined){
    midiOptions.inputs={}
  }
  var keepScanning=40;
  while(keepScanning){
    keepScanning--;
    var midi = new jazz.MIDI();
    var currentPortName= midi.MidiOutOpen(currentPortNumber);
    if(currentPortName){
      if(midiOptions.outputs[currentPortName]===undefined){
        midiOptions.outputs[currentPortName]=true;
        console.log("       -"+currentPortName +" has no config. Setting to true");
      }
      if(midiOptions.outputs[currentPortName]===true){
        if(openedMidiPorts[currentPortName]===undefined) openedMidiPorts[currentPortName]={};
        openedMidiPorts[currentPortName].output=midi;
        console.log('     -openedMidiPorts ['+currentPortName+'].output = opened Midi port');
      }else{
        console.log('    -openedMidiPorts ['+currentPortName+'].output disabled in midi-options.json');
        if(midi) midi.MidiOutClose();
      }
    } else {
      // console.log('    -No out port '+currentPortNumber);
      midiOpenFail=true;
    }

    currentPortName = midi.MidiInOpen(currentPortNumber)||currentPortName;
    if(currentPortName){
      midiOpenFail=false;
      if(midiOptions.inputs[currentPortName]===undefined){
        midiOptions.inputs[currentPortName]=true;
        console.log("     -"+currentPortName +" has no config. Setting to true");
      }
      if(midiOptions.inputs[currentPortName]===true){
        if(openedMidiPorts[currentPortName]===undefined) openedMidiPorts[currentPortName]={};
        openedMidiPorts[currentPortName].input=midi;
        console.log('     -openedMidiPorts ['+currentPortName+'].input = opened Midi port');
      }else{
        console.log('    -openedMidiPorts ['+currentPortName+'].input disabled in midi-options.json');
        if(midi) midi.MidiInClose();
      }
    } else {
      // console.log('    -No in port '+currentPortNumber);
      if(midiOpenFail) midiOpenFail=true;
    }
    currentPortNumber++;
  }
  fs.writeFile(path.join(__dirname,'/midi-options.js'), "module.exports="+JSON.stringify(midiOptions, null, "\t")  , 'utf8', console.log);

  environment.on('created',function(){
    for(var midiItem in openedMidiPorts){
      console.log("     - instancing midi");
      var ioString="";
      if(openedMidiPorts[midiItem].input!==undefined) ioString+="I";
      if(openedMidiPorts[midiItem].output!==undefined) ioString+="O";
      if(midiOptions.rename[midiItem]){
        environment.modulesMan.addModule("midiIO",{
          midiPort:openedMidiPorts[midiItem],
          name:midiOptions.rename[midiItem]
        });
      }else{
        environment.modulesMan.addModule("midiIO",{
          midiPort:openedMidiPorts[midiItem],
          name:ioString+"-"+midiItem
        });
      }
    }
  });

  /**
  @constructor
  the instance of the of the module, ment to be instantiated multiple times.
  require to moduleBase.call
  */
  this.Instance=function(properties){
    //TODO: move instance to instance.js
    moduleInstanceBase.call(this);
    this.baseName=(properties.name?properties.name:"Midi");
    getName.call(this);

    if(properties.name) this.name=properties.name;

    var myInteractor=this.interactor=new interactorSingleton.Instance(this);
    this.interactor.name=this.name;
    var midi=properties.midiPort;

    midi.out=function(a,b,c){
      if(midi.output){
        midi.output.MidiOut(a,b,c);
      }
    };
    //todo: rename midi input listener to midi.in();
    //console.log(midi);

    // midi.out(0x90,60,100); midi.out(0x90,64,100); midi.out(0x90,67,100);
    // setTimeout(function(){
    //   midi.out(0x80,60,0); midi.out(0x80,64,0); midi.out(0x80,67,0);
    // }, 3000);

    var baseRemove=this.remove;
    this.eventReceived=function(evt){
      var eventMessage=evt.EventMessage;
      eventMessage.underImpose(defaultMessage);
      var midiOut=[0,0,0];
      // console.log("MIDI",evt);
      if(eventMessage.value[0]==TRIGGERONHEADER){
        // console.log("mnoton");
        midiOut[0]=0x90|eventMessage.value[1];
        midiOut[1]=eventMessage.value[2];
        midiOut[2]=eventMessage.value[3];
      }
      if(eventMessage.value[0]==TRIGGEROFFHEADER){
        // console.log("mnotff");
        midiOut[0]=0x80|eventMessage.value[1];
        midiOut[1]=eventMessage.value[2];
        midiOut[2]=0;
      }
      // console.log("  midi.out("+midiOut[0]+","+midiOut[1]+","+midiOut[2]+");");
      midi.out(midiOut[0],midiOut[1],midiOut[2]);
    };
    this.remove=function(){
      if(midi.input) midi.input.MidiInClose();
      if(midi.output) midi.output.MidiOutClose();
      baseRemove();
    }
  }
})};