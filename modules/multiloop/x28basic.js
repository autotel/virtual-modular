'use strict';
var EventMessage=require('../../datatypes/EventMessage.js');
var EventConfigurator=require('../x16utils/EventConfigurator.js');
var DataVisualizer=require('./visualizer.js');
var SequenceView=require('./x28-SequenceView.js');
var ArragementView=require('./x28-ArrangementView.js');

/**
definition of a monoSequencer interactor for the x16basic controller hardware
*/
module.exports=function(environment){
  //singleton section
  var myInteractorBase=environment.interactionMan.interfaces.x16basic.interactorBase;
  //instance section
  this.Instance=function(controlledModule){
    myInteractorBase.call(this,controlledModule);
    this.controlledModule=controlledModule;

    var lastEngagedViewName="sequencer";
    var views={
      sequencer:new SequenceView(environment,this),
      arrangement:new ArragementView(environment,this)
    };
    function eachView(cb){
      for(var n in views){
        cb.call(views[n],n);
      }
    }
    function engageView(nameString,event){
      eachView(function(n){
        if(n==nameString){
          lastEngagedViewName=nameString;
          this.engage(event);
        }else{
          this.disengage(event);
        }
      });
    }

    this.selectorButtonPressed=function(event){
      if(event.button==0){
        engageView("sequencer",event);
      }
      if(event.button==1){
        engageView("arrangement",event);
      }
    }

    this.selectorButtonReleased=function(event){

    }
    this.engage=function(event){
      engageView(lastEngagedViewName,event);
    }
    this.disengage=function(event){
      engageView(null,event);
    }
    var selectedTape=0;
    var tapesAmount=1;
  }
}