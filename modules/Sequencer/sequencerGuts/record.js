var NoteLengthner=require('./NoteLengthner.js');
var EventMessage=require('../../../datatypes/EventMessage.js');
var EventPattern=require('../../../datatypes/EventPattern.js');

module.exports=function(controlledModule){
  var noteLengthner=new NoteLengthner(controlledModule);
  var recorderDifferenciatorList={};
  var currentStep=controlledModule.currentStep;
  this.recordSingularEvent=function(eventMessage){
    console.log(controlledModule.storeNoDup(currentStep.value,new EventPattern().fromEventMessage(eventMessage)));
    // console.log("st");
  }
  this.recordNoteStart=function(differenciator,eventOn){
    if(eventOn){
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
    // lo
    // console.log("recoff",differenciator);
    // console.log("noteEnd",differenciator);
    noteLengthner.finishAdding(differenciator,function(subdiff,sequencerEvent,nicCount){
      // console.log("rec",recorderDifferenciatorList[differenciator],sequencerEvent);
      controlledModule.storeNoDup(recorderDifferenciatorList[differenciator],sequencerEvent);
    });
  }
}