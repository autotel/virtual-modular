var Observable = require('onhandlers');
module.exports = function (controlledModule, environment) {
  var self = this;
  Observable.call(this);
  this.serverUnique = undefined;
  this.isHttpInteractor=true;
  // console.log("HTTPSUPER",controlledModule.name);

  //to get module's initial configuration
  // this.triggerModuleData=function(callback){
  //   var outputList=controlledModule.getOutputs();
  //   for(var output of outputList){
  //     // self.handle('+ connection',{origin:self,destination:what});
  //     callback({'output':output});
  //   }
  // }
  // var listeners = [
  //   '+module',
  //   '-module',
  //   '~module',
  //   'select_module',
  //   'deselect_module',
  //   'focus_module',
  //   'defocus_module',
  //   '>message',
  //   '+connection',
  //   '-connection'];

  this.sendOutputs=function(socket, emitMessages=true){
    var outputSet = controlledModule.outputs;

    if (!outputSet) {
      console.error("no output set");
      return false;
    }

    this.registeredEvents=[];

    outputSet.forEach(function (output) {
      socket.send({
        type: '+connection',
        // attributes: { origin: self, destination: output },
        origin: self.serverUnique, destination: output
      });
    });
    this.registeredEvents.push(
      controlledModule.on(">message",function(evt){
        //evt.origin, evt.destination, evt.val
        socket.send({
          type: '>message',
          origin: self.serverUnique, destination: evt.destination, val:evt.val
        });
      })
    );
  }

  this.engage=function(socket){
    this.sendOutputs(socket);
  }
  this.remove=function(){
    for (var evtListener of self.registeredEvents){
      controlledModule.off(evtListener);
    }
  }
}