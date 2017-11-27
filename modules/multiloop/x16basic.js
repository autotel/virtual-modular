"use strict";
var EventMessage=require('../../datatypes/EventMessage.js');
var EventConfigurator=require('../x16utils/EventConfigurator.js');
var DataVisualizer=require('./visualizer.js');
var SequenceView=require('./x16-SequenceView.js');
var ArragementView=require('./x16-ArrangementView.js');

/**
definition of a monoSequencer interactor for the x16basic controller hardware
*/
module.exports=function(environment){
  //singleton section
  var myInteractorBase=environment.interactionMan.interfaces.x16basic.interactorBase;
  if(!myInteractorBase){
    throw "there is not x16Basic entryInteractor";
  }else{
  }
  //instance section
  this.Instance=function(controlledModule){
    myInteractorBase.call(this,controlledModule);


    var views={
      sequencer:new SequenceView(controlledModule,this),
      arrangement:new ArragementView(controlledModule,this)
    };
    


    var selectedTape=0;
    var tapesAmount=1;

    var engagedView=SequenceView;
    var engagedHardwares=new Set();



  }
}