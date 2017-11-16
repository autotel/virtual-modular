var NoteLengthner=require('./NoteLengthner.js');
var EventMessage=require('../../../datatypes/EventMessage.js');
var EventPattern=require('../../../datatypes/EventPattern.js');

module.exports=function(controlledModule){
  var noteLengthner=new NoteLengthner(controlledModule);
  var recorderDifferenciatorList={};
  var currentStep=controlledModule.currentStep;
  this.recordSingularEvent=function(eventMessage){
    console.log(controlledModule.storeNoDup(currentStep.value,new EventPattern().fromEventMessage(eventMessage)));
    console.log("st");
  }
  this.recordNoteStart=function(differenciator,stepOn){
    // console.log("recon",differenciator);
    // console.log("recordNoteStart",differenciator,stepOn);
    if(stepOn){
      // console.log("rec rec");
      var newStepEvent=new EventPattern().fromEventMessage(stepOn);
      lastRecordedNote=newStepEvent;
      recorderDifferenciatorList[differenciator]=currentStep.value;
      //recording is destructively quantized. here we apply a filter that forgives early notes
      if(controlledModule.microStep.value<6)recorderDifferenciatorList[differenciator]--;
      noteLengthner.startAdding(recorderDifferenciatorList[differenciator],newStepEvent);
    }
    controlledModule.handle('noteOnRecorded',{eventMessage:stepOn,eventPattern:newStepEvent});
  }
  this.recordNoteEnd=function(differenciator){
    // console.log("recoff",differenciator);
    // console.log("noteEnd",differenciator);
    noteLengthner.finishAdding(recorderDifferenciatorList[differenciator],function(subdiff,sequencerEvent,nicCount){
      // console.log("rec",recorderDifferenciatorList[differenciator],sequencerEvent);
      controlledModule.storeNoDup(recorderDifferenciatorList[differenciator],sequencerEvent);
    });
  }
}