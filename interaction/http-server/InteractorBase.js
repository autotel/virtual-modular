var Observable=require('onhandlers');
module.exports=function(controlledModule, environment, gui){
  this.features={}
  Observable.call(this);
  // console.log("HTTPSUPER",controlledModule.name);
  controlledModule.on('*',function(evt){
    gui.moduleEvent(evt.name,evt.original);
  });
}