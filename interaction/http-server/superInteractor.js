var InteractorBase=require('./InteractorBase');
var uniquesCount=0;

module.exports=function(environment,socket){
  var self=this;
  var active=true;
  var instancedModules=new Set();
  var availableModules=new Set();
  var listeners=[
    '+ module',
    '- module',
    '~ module',
    'select module',
    'deselect module',
    'focus module',
    'defocus module',
    '> message',
    '+ connection',
    '- connection'];
  function getUniqueOf(module){
    //make sure module has http interface
    if(!module.interfaces) module.interfaces={};
    if(!module.interfaces.Http) module.interfaces.Http=InteractorBase;
    if(!module._instancedInterfaces) module._instancedInterfaces={};
    //instance interactor if not yet done.
    if(!module._instancedInterfaces.http){
      module._instancedInterfaces.http=new module.interfaces.Http(module,environment);
      module._instancedInterfaces.http.serverUnique=uniquesCount;
      uniquesCount++;
    }

    if(module._instancedInterfaces){
      if(module._instancedInterfaces.http){
        return module._instancedInterfaces.http.serverUnique;
      }
    }
    return false;
  }
  this.onDataReceived=function(data){
    console.log(data);
  }

  function moduleCreatedCallback(module){
    if(active){
      var moduleUnique=getUniqueOf(module);
      var nInterface=module._instancedInterfaces;

      socket.send({
        type:'+ module',
        unique:moduleUnique,
        name:module.name,
        kind:module.type
      });
      console.log(">>+module",{
        type:'+ module',
        unique:moduleUnique,
        name:module.name,
        kind:module.type
      });
      nInterface.http.triggerModuleData(function(data){
        if(data.output){
          //TODO: do actual cleanup
          if(active)socket.send({
            type:'+ connection',
            origin:moduleUnique,
            destination:getUniqueOf(data.output)
          });
        }
      });

      for(var action of listeners){
        var actionListener=new(function(eventName){
          var evtt={}
          this.send=function(evt){
            for(var a in evt){
              evtt[a]=evt[a];
            }
            if(evtt.origin){
              evtt.origin=getUniqueOf(evtt.origin);
              if(evtt.origin===false) return;
              // console.log("ORIG",(evtt.origin));
            }
            if(evtt.destination){
              evtt.destination=getUniqueOf(evtt.destination);
              if(evtt.origin===false) return;
              // console.log("DEST",(evtt.destination));
            }
            if(eventName=="~ module"){
              evtt.origin=moduleUnique;
              // console.log("CHANGE",self.loopLength.value);
            }
            evtt.type=eventName;
            if(active) socket.send(evtt);
          }
        })(action);
        module.on(action,actionListener.send);
      }

      instancedModules.add(module);
    }
  }

  for(var module of environment.modules.list){
    // console.log(a);
    moduleCreatedCallback(module);

  }

  environment.on('+ module', function(evt) {
    moduleCreatedCallback(evt.module);
  });


  socket.send({type:'start'});
  this.remove=function(){
    active=false;
    console.log("superinteractor delete not implemented");
    for(var action of listeners){
      // console.log("OFF",action);
      module.off(action);
    }
    socket.deactivate();
  }
  return this;
}