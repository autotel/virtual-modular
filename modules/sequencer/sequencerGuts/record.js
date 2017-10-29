var NoteLengthner=require('./NoteLengthner.js');
module.exports=function(controlledModule){
  var noteLengthner=new NoteLengthner(controlledModule);

  this.recordNoteStart=function(differenciator,stepOn){
    // console.log("recordNoteStart",differenciator,stepOn);
    if(stepOn){
      // console.log("rec rec");
      var newStepEvent=new patternEvent({
        on:stepOn,
        off:new EventMessage(stepOn)
      });
      lastRecordedNote=newStepEvent;
      newStepEvent.off.value[2]=0;
      recorderDifferenciatorList[differenciator]=currentStep.value;
      //recording is destructively quantized. here we apply a filter that forgives early notes
      if(controlledModule.microStep.value<6)recorderDifferenciatorList[differenciator]--;
      noteLengthner.startAdding(recorderDifferenciatorList[differenciator],newStepEvent);
    }
  }
  this.recordNoteEnd=function(differenciator){
    // console.log("noteEnd",differenciator);
    noteLengthner.finishAdding(recorderDifferenciatorList[differenciator]);
  }
}