'use strict';
var base=require('./InterfaceX16.js');
var InterfaceX28=function(controlledModule,environment){
  base.call(this,controlledModule,environment);
  var self=this;
  this.bottomButtonPressed=function(event){
    if(event.button=="right"){
      // momentaryBitmap=0b0000010010000100;
      self.page();
    }else{
      // momentaryBitmap=0b0000001000010010;
      self.page();
    }
  };
  // var _UPL=this.updateLeds;
  // this.updateLeds=function(hardware){
  //   var upl=_UPL(hardware);
  //   hardware.drawColor(upl[3]^upl[2],[60,60,60]);//(upl[3])
  //   // console.log("CALL#");
  //   // hardware.setLedsToColor(0xFFFF);
  // }
  this.bottomButtonReleased=function(event){};
}
module.exports=InterfaceX28;