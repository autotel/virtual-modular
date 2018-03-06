var Observable=require('onhandlers');
module.exports=function(controlledModule, environment){
  var self=this;
  Observable.call(this);
  // console.log("HTTPSUPER",controlledModule.name);
  
  //to get module's initial configuration
  this.triggerModuleData=function(callback){
    var outputList=controlledModule.getOutputs();
    for(var output of outputList){
      // self.handle('+ connection',{origin:self,destination:what});
      callback({'output':output});
    }
  }
}