var DataVisualizer=module.exports=function(controlledTape){
  var thisV=this;
  var timeRange=this.timeRange={start:[0,0],end:[controlledTape.clock.steps,controlledTape.clock.microSteps]}
  var eventsPerSquare=this.eventsPerSquare={value:2};
  this.eventsBitmap=0x00;
  this.eventsTrailBitmap=0x00;
  var memKeys=[];
  var updateBitmap=this.updateBitmap=function(){
    memKeys=Object.keys(controlledTape.memory);
    for(var a=timeRange.start[0]; a<=timeRange.end[0]; a++){

    }
    for(var memKey of memKeys){
      if(eventsPerSquare.value<1){
        var eventsPerMicroStep=controlledTape.clock.microSteps*eventsPerSquare.value;
        var memKeyPart=memKey.split(",");
        // console.log(`(${memKeyPart[0]}/${eventsPerSquare.value})+(${memKeyPart[1]}/${eventsPerMicroStep})`);
        thisV.eventsBitmap|=1<<((memKeyPart[0]/eventsPerSquare.value)+(memKeyPart[1]/eventsPerMicroStep));
      }else{
        thisV.eventsBitmap|=1<<memKey.split(",")[0]/eventsPerSquare.value;
        // thisV.eventsTrailBitmap=1<<
      }
    }
    console.log(thisV.eventsBitmap);
  }
  controlledTape.on('event recorded',updateBitmap);
}