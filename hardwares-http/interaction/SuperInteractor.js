var InteractorBase = require('./InteractorBase');
var uniquesCount = 0;

module.exports = function (environment, socket) {
  var self = this;
  var active = true;
  var instancedModules = new Set();
  var availableModules = new Set();
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
  function getUniqueOf(module) {
    //make sure module has http interface
    if (!module.interfaces) module.interfaces = {};
    if (!module._instancedInterfaces) module._instancedInterfaces = {};
    //instance interactor if not yet done.
    if (!module._instancedInterfaces.http) {
      //create the interactor base 
      module._instancedInterfaces.http = new InteractorBase(module, environment);
      //call apply the custom interactor base if there is any
      if (module.interfaces.Http) module.interfaces.Http.call(module._instancedInterfaces.http, module, environment)
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

  function moduleCreatedCallback(module) {
    if (active) {
      var moduleUnique = getUniqueOf(module);
      var nInterface = module._instancedInterfaces;

      socket.send({
        type: '+module',
        unique: moduleUnique,
        name: module.name,
        kind: module.type
      });

      dataSendFn = function (data) {

        if (data.steps) {
          //TODO: do actual cleanup
          if (active) socket.send({
            type: '~module',
            origin: moduleUnique
          });
        }
        if (data.origin) {
          data.origin = getUniqueOf(data.origin);
        }
        if (data.destination) {
          data.destination = getUniqueOf(data.destination);
        }
        if (active) socket.send(data);
      }

      nInterface.http.engage(dataSendFn);

      for (var action of listeners) {
        var actionListener = new (function (eventName) {
          if (active) {
            //TODO: it is a bit strange that certain property names get changed from module to unique... 
            //I should classify instead watching whether any field is of the type module or interactor
            this.send = function (evt) {
              var evtt = {}
              for (var a in evt) {
                evtt[a] = evt[a];
              }
              if (evtt.origin) {
                evtt.origin = getUniqueOf(evtt.origin);
                if (evtt.origin === false) return;
              }
              if (evtt.destination) {
                evtt.destination = getUniqueOf(evtt.destination);
                if (evtt.destination === false) return;
              }
              if (eventName == "~module") {
                evtt.origin = moduleUnique;
              }
              evtt.type = eventName;
              if (active) socket.send(evtt);
            }
          }
        })(action);
        module.on(action, actionListener.send);
      }

      instancedModules.add(module);
    }
  }

  for (var module of environment.modules.list) {
    // console.log(a);
    moduleCreatedCallback(module);

  }

  environment.on('+module', function (evt) {
    moduleCreatedCallback(evt.module);
  });


  socket.send({ type: 'start' });
  this.remove = function () {
    active = false;
    console.log("superinteractor delete not implemented");
    for (var action of listeners) {
      // console.log("OFF",action);
      module.off(action);
    }
    socket.deactivate();
  }
  return this;
}