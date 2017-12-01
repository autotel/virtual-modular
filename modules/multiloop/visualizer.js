var DataVisualizer=module.exports=function(controlledModule){
  var self=this;
  var timeRange=this.timeRange={start:[0,0]}
  var stepsPerButton=this.stepsPerButton={value:2};
  var microStepBase=12;
  this.eventsBitmap=0x00;
  this.eventsTrailBitmap=0x00;
  var memKeys=[];

  var updateBitmap=this.updateBitmap=function(ofTape){
    var currentTape=ofTape;
    self.eventsBitmap=0;
    console.log("UPB");
    memKeys=Object.keys(currentTape.memory);
    for(var memKey of memKeys){
      if(stepsPerButton.value<1){
        var eventsPerMicroStep=currentTape.clock.microSteps*stepsPerButton.value;
        var memKeyPart=memKey.split(",");
        self.eventsBitmap|=1<<((memKeyPart[0]/stepsPerButton.value)+(memKeyPart[1]/eventsPerMicroStep));
      }else{
        self.eventsBitmap|=1<<memKey.split(",")[0]/stepsPerButton.value;
      }
    }
  }
  var getTimeIndexOfButton=function(button){
    ret=[button*stepsPerButton.value,0];
    if(stepsPerButton<1){
      ret[1]=(button%(1/stepsPerButton))*microStepBase/stepsPerButton
    }
    return ret;
  }
}