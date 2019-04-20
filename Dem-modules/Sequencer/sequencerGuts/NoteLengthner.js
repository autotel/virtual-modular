/**
object that keeps track of the length of all the notes that are being created, in order to add the note ends in their corresponding times in the sequencer.
*/
var NoteLengthner=module.exports=function(controlledModule){
  var thisNoteLengthner=this;

  var notesInCreation=[];
  //count of notes in creation
  var nicCount=0;
  var stepCounter=0;
  this.startAdding=function(differenciator,newStepEv){
    if(!newStepEv.stepLength){
      newStepEv.stepLength=1;
    }
    notesInCreation[differenciator]={sequencerEvent:newStepEv,started:stepCounter};
    nicCount++;
    // console.log(notesInCreation[differenciator]);
  }
  this.finishAdding=function(differenciator,storeCallback=false){
    if(notesInCreation[differenciator]){

      notesInCreation[differenciator].sequencerEvent.stepLength=stepCounter-notesInCreation[differenciator].started;
      nicCount--;
      if(storeCallback){
        //TODO: these callback parameters are stupid, perhaps should pass an object instead of many parameters
        storeCallback(differenciator,notesInCreation[differenciator].sequencerEvent,nicCount);
      }else{
        console.warn("noteLengthner didn't have a sequencer event store function, which defeats the purpose of the noteLengthner");
      }
      // console.log(notesInCreation[differenciator]);
      delete notesInCreation[differenciator];
    }
  }
  var stepCallback=false;
  function step(){
    stepCounter++;
  }
  controlledModule.on('step',function(event){
    step();
    if(stepCallback){
      stepCallback(thisNoteLengthner,nicCount);
    }
  });
  this.onStep=function(nStepCallback){
    stepCallback=nStepCallback;
  }
};