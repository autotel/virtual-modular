var Observable=require('onhandlers');
module.exports=function(controlledModule, environment, gui){
  Observable.call(this);
  // console.log("HTTPSUPER",controlledModule.name);
  controlledModule.on('*',function(evt){
    gui.moduleEvent(evt.name,evt.original);
  });
  //to get module's initial configuration
  this.triggerModuleData=function(callback){
    var outputList=controlledModule.getOutputs();
    for(var output of outputList){
      // self.handle('+ connection',{origin:self,destination:what});
      callback({'output':output});
    }
  }
}