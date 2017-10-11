'use strict';
/**object that helps to count the amount of steps that each sequencer button has been pressed, in order to get it's length*/
var NoteLengthner=function(){
  var thisNoteLengthner=this;
  this.startPointsBitmap=0x0;
  this.lengthsBitmap=0x0;
  var notesInCreation=[];
  //count of notes in creation
  var nicCount=0;
  var stepCounter=0;
  this.startAdding=function(differenciator,newStepEv){
    // console.log("startadding("+differenciator+"...");
    if(!newStepEv.stepLength){
      newStepEv.stepLength=1;
    }
    notesInCreation[differenciator]={sequencerEvent:newStepEv,started:stepCounter};
    thisNoteLengthner.startPointsBitmap|=0x1<<differenciator;
    thisNoteLengthner.lengthsBitmap=thisNoteLengthner.startPointsBitmap;
    nicCount++;
    // console.log(notesInCreation[differenciator]);
  }
  this.finishAdding=function(differenciator){
    if(notesInCreation[differenciator]){
      notesInCreation[differenciator].sequencerEvent.stepLength=stepCounter-notesInCreation[differenciator].started;
      eachFold(differenciator,function(step){
        /*var added=*/controlledModule.storeNoDup(step,notesInCreation[differenciator].sequencerEvent);
      });
      // console.log(notesInCreation[differenciator]);
      delete notesInCreation[differenciator];
      nicCount--;
      if(nicCount==0){
        thisNoteLengthner.startPointsBitmap=0;
        thisNoteLengthner.lengthsBitmap=0;
      }
    }
  }
  this.step=function(){
    stepCounter++;
    if(nicCount>0){
      thisNoteLengthner.lengthsBitmap|=thisNoteLengthner.lengthsBitmap<<1;
      thisNoteLengthner.lengthsBitmap|=thisNoteLengthner.lengthsBitmap>>16;
    }
  }
};
module.exports=NoteLengthner;