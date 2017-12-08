'use strict';
var EventPattern=require('../../datatypes/EventPattern.js');
var EventMessage=require('../../datatypes/EventMessage.js');

var MyInteractorBase=require('../../interaction/x16basic/interactorBase.js');
/**
user interface pattern that allows to tweak a note. A usage example is the event selector of the monoSequencer, the one used to select the note that will be set on the next tap of a matrix button
@param {interactor} parentInteractor the module interactor that posesses this EventConfigurator
@param {Object} properties {values:{@link array}(deep copy),name:{@link String},valueNames:{@link Array} (shallow copy)}
*/
var EventConfigurator=function(parentInteractor,properties){
  MyInteractorBase.call(this);
  this.name="EventMessage";
  var thisInteractor=this;
  if(properties.name) this.name=properties.name;
  var selectedValueNumber=1;
  var valueNames=["func","chan","number","prop"];
  var extraValueNames=[];
  var extraVariables=[];
  if(properties.valueNames) valueNames=properties.valueNames
  var engagedHardwares=new Set();
  /**
  the interface is based on an eventMessage, but the input and output is an eventPattern
  */
  var baseEvent;
  if(properties.baseEvent){
    // console.log("NM");
    baseEvent=properties.baseEvent;
  }else{
    // console.log("nono");
    baseEvent=this.baseEvent=new EventMessage({value:[0]});
  }
  if(properties.values){
    for(var a in properties.values){
      baseEvent.value[a]=properties.values[a];
    }
  }
  this.addextraVariables=function(valuesList){
    for(var a in valuesList){
      extraValueNames.push(a);
      extraVariables.push(valuesList[a]);
    }
  }
  if(properties.extraVariables) this.addextraVariables(properties.extraVariables);
  var valueChanged=function(){
    //value can change while not engaged
    for (let hardware of engagedHardwares) {
      updateLeds(hardware);
    }
  }

  var passiveUpdateScreen=function(){
    //value can change while not engaged
    for (let hardware of engagedHardwares) {
      updateScreen(hardware);
    }
  }
  var updateLeds=function(hardware){
    var selectBmp=1<<selectedValueNumber;
    var eventLengthBmp=~(0xFFFF<<baseEvent.value.length);
    var extraVariablesBmp=eventLengthBmp^~(0xFFFF<<(baseEvent.value.length+extraValueNames.length));

    hardware.draw([selectBmp|eventLengthBmp,selectBmp|extraVariablesBmp,selectBmp|eventLengthBmp|extraVariablesBmp]);
  }
  var updateScreen=function(hardware){
    hardware.sendScreenA(thisInteractor.name);
    if(selectedValueNumber<baseEvent.value.length){
      hardware.sendScreenB(
        valueNames[selectedValueNumber]
        +"="+(baseEvent.value[selectedValueNumber]===-1?"transparent":baseEvent.value[selectedValueNumber])
      );
    }else{
      var selectedExtraValue=selectedValueNumber-baseEvent.value.length;
      if(extraValueNames[selectedExtraValue]){
        hardware.sendScreenB(
          extraValueNames[selectedExtraValue]
          +"="+extraVariables[selectedExtraValue].value
        );
      }

    }
  }
  this.matrixButtonPressed=function(event){
    var hardware=event.hardware;
    selectedValueNumber=event.data[0];
    updateLeds(hardware);
    updateScreen(hardware);
  };
  this.matrixButtonReleased=function(event){
    var hardware=event.hardware;
  };
  this.selectorButtonPressed=function(event){
    var hardware=event.hardware;
  };
  this.selectorButtonReleased=function(event){
    var hardware=event.hardware;
  };
  this.encoderScrolled=function(event){
    var hardware=event.hardware;
    if(baseEvent.value.length>selectedValueNumber){
      // console.log("val:"+baseEvent.value[selectedValueNumber]);
      baseEvent.value[selectedValueNumber]+=event.delta;
      // console.log("->val:"+baseEvent.value[selectedValueNumber],event.data[1]);
      updateScreen(hardware);
    }else if(extraValueNames.length>selectedValueNumber-baseEvent.value.length){
      extraVariables[selectedValueNumber-baseEvent.value.length].value+=event.delta;
      updateScreen(hardware);
    }
  };
  this.encoderPressed=function(event){
    var hardware=event.hardware;
  };
  this.encoderReleased=function(event){
    var hardware=event.hardware;
  };
  this.engage=function(event){
    var hardware=event.hardware;
    engagedHardwares.add(hardware);
    updateLeds(hardware);
    updateScreen(hardware);
  };
  this.disengage=function(event){
    var hardware=event.hardware;
    engagedHardwares.delete(hardware);
  }

  this.Filter=function(criteria){
    this.criteria=criteria;
    var criteria=this.criteria;
    return function(message){
      var onMessage=message.on
      var ret=true;
      if(criteria){
        if(criteria.header)
          ret&=(onMessage.value[0]===baseEvent.value[0]);
        if(criteria.value_a)
          ret&=(onMessage.value[1]===baseEvent.value[1]);
        if(criteria.value_b)
          ret&=(onMessage.value[2]===baseEvent.value[2]);
        if(criteria.value_c)
          ret&=(onMessage.value[2]===baseEvent.value[2]);
      }
      return ret;
    }
  }

  this.setFromEventPattern=function(EvPat,hardware){
    if(EvPat){
      if(EvPat.on){
        baseEvent=new EventMessage(EvPat.on);
        if(hardware){
          updateScreen(hardware);
        }else{
          passiveUpdateScreen();
        }
      }
    }

  }
  this.setFromEventMessage=function(EvMes,hardware){
    if(EvMes){
      baseEvent=new EventMessage(EvMes);
      if(hardware){
        updateScreen(hardware);
      }else{
        passiveUpdateScreen();
      }
    }

  }
  this.getEventPattern=function(){
    // if(!newDest) newDest=options[0].valueNames(0);
    var newEvPat=new EventPattern();
    newEvPat.fromEventMessage(baseEvent);
    newEvPat.stepLength=1;
    return newEvPat;
  }
  this.getEventMessage=function(){
    // if(!newDest) newDest=options[0].valueNames(0);
    var newEvMes=new EventMessage(baseEvent);
    return newEvMes;
  }

};
module.exports=EventConfigurator;