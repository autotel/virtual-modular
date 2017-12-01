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
      updateSelectorLeds(event.hardware);
    }

    this.selectorButtonPressed=function(event){
      if(event.button==4){
        engageView("sequencer",event);
      }
      if(event.button==5){
        engageView("arrangement",event);
      }
    }

    this.selectorButtonReleased=function(event){

    }
    this.engage=function(event){
      engageView(lastEngagedViewName,event);
      updateSelectorLeds(event.hardware);
    }
    this.disengage=function(event){
      engageView(null,event);
    }
    function updateSelectorLeds(hardware){
      var classicbtn=0x00;
      var sequencerbtn=1<<4;
      var arrangerbtn=1<<5;
      var patchmenubtn=1<<7;
      var selectedViewBitmap=0;
      if(views.sequencer.engagedHardwares.has(hardware)){
        selectedViewBitmap|=sequencerbtn>>4;
      }
      if(views.arrangement.engagedHardwares.has(hardware)){
        selectedViewBitmap|=arrangerbtn>>4;
      }
      hardware.drawSelectors([
          selectedViewBitmap  |classicbtn  |sequencerbtn                |patchmenubtn,
        ( selectedViewBitmap  |classicbtn  |sequencerbtn   |arrangerbtn) &~patchmenubtn,
        ( selectedViewBitmap  |classicbtn                  |arrangerbtn) &~patchmenubtn]);
    }
    var selectedTape=0;
    var tapesAmount=1;
  }
}