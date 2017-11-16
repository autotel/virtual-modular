"use strict";
var EventMessage=require('../../datatypes/EventMessage.js');
/**
definition of a monoSequencer interactor for the x16basic controller hardware
*/
module.exports=function(environment){
  this.Instance=function(controlledModule){
    /**
    plan for the midi io module:
    you can select each one of the outputs, and then select a filter function that dictates what midi input events are routed to each output.
    -should midi input be mapped to their corresponfing EventMessages according to my internal standard?
    */
    var selectedOutputNumber=false;
    var selectedInputNumber=false;
    environment.interactionMan.interfaces.x16basic.interactorBase.call(this,controlledModule);
    var engagedHardwares=new Set();
    this.name=controlledModule.name;

    var midiInputCache=controlledModule.midiInputCache;
    //updated on updateLeds
    var indexedMidiInputCache=[];
    var inputMode=true;

    // controlledModule.on('midi in',function(event){
    //
    // });
    //this because on midi in could become too frequent
    setInterval(function(){
      for(var hardware of engagedHardwares){
        updateHardware(hardware);
      }
    },30);
    this.matrixButtonPressed=function(event){
      if(inputMode){
        if(event.button<indexedMidiInputCache.length){
          // console.log(selectedInputNumber,"kll");
          selectedInputNumber=event.button;
          indexedMidiInputCache[selectedInputNumber].enabled=(indexedMidiInputCache[selectedInputNumber].enabled==false);
        }else{
          console.log(midiInputCache,midiInputCache.length);
        }
      }else{
        if(event.button<controlledModule.outputs.size)
        selectedOutputNumber=event.button;
      }
      updateHardware(event.hardware);
    };
    this.matrixButtonReleased=function(event){};
    this.matrixButtonHold=function(event){};
    this.selectorButtonPressed=function(event){
      if(event.button==2){
        inputMode=false;
        updateHardware(event.hardware);
      }
    };
    this.selectorButtonReleased=function(event){
      if(event.button==2){
        inputMode=true;
        updateHardware(event.hardware);
      }
    };
    this.encoderScrolled=function(event){};
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
      hardware.sendScreenA("Midi IO");
      if(inputMode){
          // hardware.sendScreenB(JSON.stringify(event.eventMessage.value));
          // try{
            if(selectedInputNumber!==false)
            hardware.sendScreenB(JSON.stringify(indexedMidiInputCache[selectedInputNumber].outputMessage.value));
          // }catch(e){
            // console.log("no",selectedInputNumber,indexedMidiInputCache);
          // }
      }else{
        if(controlledModule.outputs.size<=selectedOutputNumber) selectedOutputNumber=false;
        if(selectedOutputNumber!==false){
          hardware.sendScreenB(Array.from(controlledModule.outputs)[selectedOutputNumber].name);
        }else{
          hardware.sendScreenB("");
        }
      }
    }
    var updateLeds=function(hardware){
      if(inputMode){
        var enabledBitmap=0;
        // var disabledBitmap=0;
        var selectedBitmap=(selectedInputNumber!==false? (1<<selectedInputNumber) : 0);
        var nn=0;
        controlledModule.eachMidiMapping(function(){
          if(this.enabled){
            enabledBitmap|=1<<nn;
          }else{
            // disabledBitmap|=1<<index;
          }
          indexedMidiInputCache[nn]=(this);
          // console.log(this.name,this.outputMessage.value);
          nn++;
        });
        var avalInputsBmp=~(0xFFFF<<indexedMidiInputCache.length);
        hardware.draw([avalInputsBmp,enabledBitmap,enabledBitmap]);
      }else{
        var avalOutputsBmp=~(0xFFFF<<controlledModule.outputs.size);
        var selectedBitmap=(selectedOutputNumber!==false? (1<<selectedOutputNumber) : 0);
        hardware.draw([selectedBitmap,avalOutputsBmp,avalOutputsBmp]);

      }
    }
  }
}