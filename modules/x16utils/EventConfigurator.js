var EventMessage=require('../../datatypes/eventMessage.js');
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
  var myEvent=new EventMessage({value:[0]});
  if(properties.values){
    for(var a in properties.values){
      myEvent.value[a]=properties.values[a];
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
    var eventLengthBmp=~(0xFFFF<<myEvent.value.length);
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
      +"="+(myEvent.value[selectedValueNumber])
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
    if(myEvent.value.length>selectedValueNumber){
      myEvent.value[selectedValueNumber]+=event.data[1];
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
};
module.exports=EventConfigurator;