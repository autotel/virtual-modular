var Observable = require('onhandlers');
module.exports = function (controlledModule, environment) {
  var self = this;
  Observable.call(this);
  // console.log("HTTPSUPER",controlledModule.name);

  //to get module's initial configuration
  // this.triggerModuleData=function(callback){
  //   var outputList=controlledModule.getOutputs();
  //   for(var output of outputList){
  //     // self.handle('+ connection',{origin:self,destination:what});
  //     callback({'output':output});
  //   }
  // }
  var listeners = [
    '+module',
    '-module',
    '~module',
    'select_module',
    'deselect_module',
    'focus_module',
    'defocus_module',
    '>message',
    '+connection',
    '-connection'];

  setTimeout(function () {
    var outputSet = controlledModule.outputs;
    if(!outputSet){
      console.error("no output set");
      return false;
    }
    outputSet.forEach(function(output){
      controlledModule.handle(
        '+connection',
        { origin: self, destination: output }
      );
    });
  }, 200);
}