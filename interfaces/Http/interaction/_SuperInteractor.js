var InteractorBase = require('./InteractorBase');
var uniquesCount = 0;

module.exports = function (environment, socket) {
  var self = this;
  var active = true;
  var instancedModules = new Set();
  var availableModules = new Set();
 
  function getOrCreateInterface(module) {
    //make sure module has http interface
    if (!module.interfaces) module.interfaces = {};
    if (!module.interfaces.Http) module.interfaces.Http = InteractorBase;
    if (!module._instancedInterfaces) module._instancedInterfaces = {};
    //instance interactor if not yet done.
    if (!module._instancedInterfaces.http) {
      module._instancedInterfaces.http = new module.interfaces.Http(module, environment);
      module._instancedInterfaces.http.serverUnique = uniquesCount;
      uniquesCount++;
    }

    if (module._instancedInterfaces) {
      if (module._instancedInterfaces.http) {
        return module._instancedInterfaces.http.serverUnique;
      }
    }
    return false;
  }
  this.onDataReceived = function (data) {
    console.log(data);
  }

  function moduleCreatedCallback(newModule) {
    var newModuleUnique=getOrCreateInterface(newModule);
    socket.send({
      type: '+module',
      unique: newModuleUnique,
      name: newModule.name,
      kind: newModule.type
    });
    
  }

  for (var module of environment.modules.list) {
    moduleCreatedCallback(module);
  }

  environment.on('+module', function (evt) {
    moduleCreatedCallback(evt.module);
  });


  socket.send({ type: 'start' });
  this.remove = function () {
    active = false;
    console.log("superinteractor delete not implemented");
    
    socket.deactivate();
  }
  return this;
}