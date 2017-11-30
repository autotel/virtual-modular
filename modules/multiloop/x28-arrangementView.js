"use strict";
var EventMessage=require('../../datatypes/EventMessage.js');
var EventConfigurator=require('../x16utils/EventConfigurator.js');
var BlankConfigurator=require('../x16utils/BlankConfigurator.js');
module.exports=function(environment,parentInteractor){
  var controlledModule=parentInteractor.controlledModule;
  var self=this;



  var selectedTapeNumber=0;
  var selectedTape=false;
  var tapesAmount=1;
  var engagedConfigurator=false;

  var engagedHardwares=new Set();



  var configurators={};
  configurators.event=new EventConfigurator(this,{baseEvent:controlledModule.baseEventMessage});
  configurators.tapeTime=new BlankConfigurator(this,{
    name:"tape",
    vars:{
      "length":{value:0},
      "quantize":{value:0},
    }
  });

  configurators.tapeTime.vars["length"].changeFunction=configurators.tapeTime.vars["length"].selectFunction = function(thisVar,delta){
    if(selectedTape){
      thisVar.value=selectedTape.steps.value;
      if(thisVar.value+delta>=1){
        thisVar.value+=delta;
        selectedTape.steps.value=thisVar.value;
      }
    }
  }

  var lastEngagedConfigurator=configurators.tapeTime;

  function eachEngagedHardware(cb){
    for(let hardware of engagedHardwares){
      cb(hardware);
    }
  }

  parentInteractor.on('interaction',function(event){
    if (engagedHardwares.has(event.hardware)){
      if(typeof self[event.type]==='function'){
        // console.log("sequence view, event ",event);
        self[event.type](event);
      }else{
        console.log("undlandled interaction");
      }
    }
  });

  setInterval(function(){
    if(!engagedConfigurator)
    for (let hardware of engagedHardwares) {
      updateLeds(hardware);
    }
  },1000/20);
  this.matrixButtonPressed=function(event){
    if(engagedConfigurator){
      engagedConfigurator.matrixButtonPressed(event);
    }else{
      if(event.button>=tapesAmount){
        var newTape=controlledModule.addNewTape();
        controlledModule.selectTape(newTape);
        selectedTape=newTape;
        selectedTapeNumber=controlledModule.getTapeNum(newTape);
        tapesAmount=controlledModule.tapeCount();
      }else{
        let thereIs=controlledModule.getNumTape(event.button);
        // console.log(thereIs);
        if(thereIs){
          controlledModule.selectTape(thereIs);
          selectedTapeNumber=event.button;
          selectedTape=thereIs;
        }
      }
      updateHardware(event.hardware);
    }
  };
  this.matrixButtonReleased=function(event){
    if(engagedConfigurator){
      engagedConfigurator.matrixButtonReleased(event);
    }else{
      // controlledModule.clearStep(event.button);
      updateHardware(event.hardware);
    }
  };
  this.matrixButtonHold=function(event){};
  this.selectorButtonPressed=function(event){
    var hardware=event.hardware;
    if(engagedConfigurator){
      engagedConfigurator.selectorButtonPressed(event);
    }else{
      if(event.button==1){
        // engagedConfigurator=configurators.event;
        // configurators.event.engage({hardware:hardware});
      }
      if(event.button==4){
        if(selectedTape){
          controlledModule.muteTapeToggle(selectedTape);
          updateHardware(hardware);
        }
      }
      if(event.button==5){
        if(selectedTape){
          engagedConfigurator=configurators.tapeTime;
          configurators.tapeTime.engage(event);
        }
      }
      lastEngagedConfigurator=engagedConfigurator;
    }
  };
  this.selectorButtonReleased=function(event){
    var hardware=event.hardware;
    if(engagedConfigurator){
      engagedConfigurator.disengage(event);
      engagedConfigurator=false;
    }

    // if(event.button==5){
    //   if(engagedConfigurator==configurators.tapeTime){
    //     engagedConfigurator=false;
    //     configurators.tapeTime.engage(event);
    //   }
    // }
  };
  this.encoderScrolled=function(event){
    if(engagedConfigurator){
      engagedConfigurator.encoderScrolled(event);
    }else{
      if(lastEngagedConfigurator){
        lastEngagedConfigurator.encoderScrolled(event)
      }
    }
  };
  this.encoderPressed=function(event){};
  this.encoderReleased=function(event){};
  this.engage=function(event){
    engagedHardwares.add(event.hardware);
    updateHardware(event.hardware);
  };
  this.disengage=function(event){
    engagedHardwares.delete(event.hardware);
  }
  var updateHardware=function(hardware){

      updateScreen(hardware);
      updateLeds(hardware);

  }
  var updateScreen=function(hardware){
    if(!engagedConfigurator){
      hardware.sendScreenA((controlledModule.name.substring(0,5))+"> arrange");
      hardware.sendScreenB("tape "+selectedTapeNumber+" "+(selectedTape?(selectedTape.muted.value?"muted":"active"):""));
    }
  }
  var updateLeds=function(hardware){
    if(!engagedConfigurator){
      var selectedTapeBitmap=1<<selectedTapeNumber;
      var mutedTapesBitmap=0;
      controlledModule.eachTape(function(n){
        if(this.muted.value) mutedTapesBitmap|=1<<n;
      });
      var tapesBitmap=~(0xffff<<tapesAmount);
      hardware.draw([selectedTapeBitmap|mutedTapesBitmap,selectedTapeBitmap|(tapesBitmap&~mutedTapesBitmap),(selectedTapeBitmap|tapesBitmap)&~mutedTapesBitmap]);
    }
  }
}
