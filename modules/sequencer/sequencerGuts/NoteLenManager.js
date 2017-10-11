module.exports=function(sequencerModule){ return new(function(){
  var notesInCreation=[];
  var notesInPlay=[];
  var stepCounter=0;

  this.noteStarted=function(stepEvent){
    if(!stepEvent.stepLength)stepEvent.stepLength=1;
    notesInPlay.push({sequencerEvent:stepEvent,offInStep:stepCounter+stepEvent.stepLength});
  }
  this.step=function(evt){
    // if(!sequencerModule.mute) this doesn't go, to avoid hanging notes
    for(var a in notesInPlay){
      if(notesInPlay[a].offInStep==stepCounter){
        // console.log("a:"+a);
        // console.log(notesInPlay[a]);
        // environment.patcher.receiveEvent(notesInPlay[a].sequencerEvent.off);
        sequencerModule.sendEvent(notesInPlay[a].sequencerEvent.off);

        notesInPlay[a]=false;
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