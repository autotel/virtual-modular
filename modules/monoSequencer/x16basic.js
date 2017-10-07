/**
definition of a monoSequencer interactor for the x16basic controller hardware
*/
module.exports=function(environment){
  //singleton section
  var myInteractorBase=environment.interactionMan.interfaces.x16basic.interactorBase;
  if(!myInteractorBase){
    throw "there is not x16Basic entryInteractor";
  }else{
  }
  //instance section
  this.Instance=function(controlledModule){
    myInteractorBase.call(this,controlledModule);
    this.engage=function(evt){
      var hardware=evt.hardware;
      var g=controlledModule.getBitmap16();
      hardware.draw([g,g,g]);
      hardware.sendScreenA("monosequencer");
    }
  }
}