module.exports=function(sequencerModule){ return new(function(){
  var notesInCreation=[];
  var notesInPlay=[];
  var stepCounter=0;

  this.noteStarted=function(stepEvent){
    if(!stepEvent.stepLength)stepEvent.stepLength=1;
    notesInPlay.push({sequencerEvent:stepEvent,offInStep:stepCounter+stepEvent.stepLength});
  }
  this.step=function(evt){
    for(var a in notesInPlay){
      if(notesInPlay[a].offInStep==stepCounter){
        if(notesInPlay[a].sequencerEvent.off){
          sequencerModule.output(notesInPlay[a].sequencerEvent.off,true);
          notesInPlay[a]=false;
        }
      }
    }
    //splicing requires backward iteration
    var a=notesInPlay.length;
    while(a>0){
      if(notesInPlay[a]===false)
        notesInPlay.splice(a,1);
      a--;
    }
    stepCounter++;
  }
})();};