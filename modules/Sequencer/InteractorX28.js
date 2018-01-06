var base=require('./InteractorX16.js');
var InteractorX28=function(controlledModule,environment){
  base.call(this,controlledModule,environment);
  self=this;
  this.bottomButtonPressed=function(event){
    if(event.button=="right"){
      // momentaryBitmap=0b0000010010000100;
      self.page();
    }else{
      // momentaryBitmap=0b0000001000010010;
      self.page();
    }
  };
  this.bottomButtonReleased=function(event){};
}
module.exports=InteractorX28;