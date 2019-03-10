var Observable=require('onhandlers');
module.exports=function(controlledModule, environment){
  var self=this;
  Observable.call(this);
  // console.log("HTTPSUPER",controlledModule.name);
  
  //to get module's initial configuration 
  this.engage=function(callback){
    var outputList=controlledModule.getOutputs();
    for(var output of outputList){
      
      callback({type:"+connection",origin:controlledModule,destination:output});
      
    }

  }
}