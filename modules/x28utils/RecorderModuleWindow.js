/*DEPRECATE*/
'use strict';
var RecorderModuleWindow=function(controlledModule,environment){
  this.recorder=false;
  let self=this;
  let lastPressedButton;
  let recording=false;
  this.engage=function(event){
    paint(event.hardware);
  }
  this.windowButtonPressed=function(event){
    let windowButton=event.button;
    if(lastPressedButton===windowButton){
      recording=controlledModule.toggleRecordOutput(self.recorder);

    }else{
      if(!self.recorder){
        //make a creative name for the multitape
        let newName="MultiT>";
        console.log("NAME",controlledModule.name);
        let chunks=controlledModule.name.split(/[ ,:\-_]/gi);
        for(let c of chunks){
          newName+=c.substr(0, 2);
        }
        //create a new multitape to use
        self.recorder=environment.modules.instantiate('MultiTape',{name:newName});
        //set this module record outut to that multitape (patch should happen auto)
        controlledModule.addRecordOutput(self.recorder);
        recording=true;
      }else{
        controlledModule.addRecordOutput(self.recorder);
        recording=true;

        // console.log("RECOO",self.recorder);
        self.recorder.interfaces.X28.windowButtonPressed(event);
        //if self.recoorder.taapes [windowButton]
          //select tape
        //else
          //create tape, select tape
      }
    }
    lastPressedButton=windowButton;

    paint(event.hardware);
  }
  let paint=this.redraw=function(hardware){
    if(self.recorder){
      let tapesBmp=(~(0xff<<self.recorder.tapeCount()))&0xf;
      let selT=self.recorder.getCurrentTapeNumber();
      let recBmp=0;
      if(selT!==false){
        recBmp=1<<selT;
      }
      // hardware.drawLowerSelectorButtonsColor(0,[0,0,0]);
      //TODO: theere is a current bug in the hardware that doesn't allow me to clear the buttons in other way
      hardware.drawLowerSelectorButtonsColor(0xf,[0,0,0]);

      hardware.drawLowerSelectorButtonsColor(tapesBmp,[0,32,32]);
      if(recording)
        hardware.drawLowerSelectorButtonsColor(recBmp,[110,5,5]);
    }
  }
  this.windowButtonReleased=function(event){
    let windowButton=event.button;

  }
}
module.exports=RecorderModuleWindow;