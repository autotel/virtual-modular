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
  this.name="event";
  thisInteractor=this;
  if(properties.name) this.name=properties.name;
  var selectedValueNumber=0;
  var valueNames=["fnHead","chan","number","prop"];
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
  var valueChanged=function(){
    //value can change while not engaged
    for (let hardware of engagedHardwares) {
      updateLeds(hardware);
    }
  }
  var updateLeds=function(hardware){
    var selectBmp=1<<selectedValueNumber;
    var eventLengthBmp=~(0xFFFF<<baseEvent.value.length);
    hardware.draw([selectBmp|eventLengthBmp,selectBmp,selectBmp|eventLengthBmp]);
  }
  var updateScreen=function(hardware){
    // setTimeout(function(){
    //   var recover=JSON.parse(JSON.stringify(hardware.lastScreenValues));
    //   sendScreenA(recover[0]);
    //   // sendScreenB(recover[1]);
    // },700);
    // hardware.sendScreenA();
    hardware.sendScreenB(
      thisInteractor.name
      +":"+valueNames[selectedValueNumber]
      +"="+(baseEvent.value[selectedValueNumber]===-1?"transparent":baseEvent.value[selectedValueNumber])
    );
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
      baseEvent.value[selectedValueNumber]+=event.data[1];
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

  this.setFromEventPattern=function(EvPat){
    if(EvPat){
      if(EvPat.on){
        baseEvent.from(evPat.on);
        updateLcd();
      }
    }

  }

  this.getEventPattern=function(){
    // if(!newDest) newDest=options[0].valueNames(0);
    var newEvPat=new EventPattern();
    newEvPat.from(baseEvent);
    newEvPat.stepLength=1;
    return newEvPat;
  }

};
module.exports=EventConfigurator;