var NoteLengthner=require('./NoteLengthner.js');
var EventMessage=require("../../../Polimod/datatypes/EventMessage");
var EventPattern=require('../EventPattern.js');

module.exports=function(controlledModule){
  var noteLengthner=new NoteLengthner(controlledModule);
  var recorderDifferenciatorList={};
  var currentStep=controlledModule.currentStep;
  this.recordSingularEvent=function(eventMessage){

    var nodup=controlledModule.storeNoDup(currentStep.value,new EventPattern().fromEventMessage(eventMessage));
    //console.log(nodup);
    // console.log("st");
  }
  this.recordNoteStart=function(differenciator,eventOn){
    if(eventOn){

      eventOn.microDelayFrames=192*controlledModule.microStep.value/controlledModule.microStepDivide;

      var newStepEvent=new EventPattern().fromEventMessage(eventOn);
      lastRecordedNote=newStepEvent;
      recorderDifferenciatorList[differenciator]=currentStep.value;
      //recording is destructively quantized. here we apply a filter that forgives early notes
      if(controlledModule.microStep.value<(controlledModule.lastMicroStepBase/2))recorderDifferenciatorList[differenciator]--;
      noteLengthner.startAdding(differenciator,newStepEvent);
    }
    controlledModule.handle('noteOnRecorded',{eventMessage:eventOn,eventPattern:newStepEvent});
  }
  this.recordNoteEnd=function(differenciator){
    // console.log("noteEnd",differenciator);
    noteLengthner.finishAdding(differenciator,function(subdiff,sequencerEvent,nicCount){
      // console.log("rec",recorderDifferenciatorList[differenciator],sequencerEvent);
      controlledModule.storeNoDup(recorderDifferenciatorList[differenciator],sequencerEvent);
    });
  }
}
