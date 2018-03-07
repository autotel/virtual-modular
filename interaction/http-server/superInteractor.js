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
    'select module',
    'deselect module',
    'focus module',
    'defocus module',
    '> message',
    '+ connection',
    '- connection'];
  function getUniqueOf(module){
    // console.log("getUniqueOf",module);
    if(module._instancedInterfaces){
      if(module._instancedInterfaces.http){
        return module._instancedInterfaces.http.serverUnique;
      }
      // console.log("module has no instanced interfaces.http");
    }
    // console.log("module has no instanced interfaces",module);
    return false;
  }
  // socket.onMessage(console.log);

  // socket.write('socket write test');
  // socket.emit('emit test',{vv:'emit test'});
  this.onDataReceived=function(data){
    // console.log(data);
  }

  function moduleCreatedCallback(module){
    if(active){
      // console.log(module.interfaces);
      //polyfill constructor
      if(!module.interfaces.Http){
        module.interfaces.Http=InteractorBase;
      }
      //instance interactor if not yet done.
      if(!module._instancedInterfaces.http){
        module._instancedInterfaces.http=new module.interfaces.Http(module,environment);
        module._instancedInterfaces.http.serverUnique=uniquesCount;
        uniquesCount++;
        // console.log("(UNIQUES",uniquesCount);
      }
      var nInterface=module._instancedInterfaces;

      socket.send({
        type:'+ module',
        unique:getUniqueOf(module),
        name:module.name,
        kind:module.type
      });

      nInterface.http.triggerModuleData(function(data){
        if(data.output){
          //TODO: do actual cleanup
          if(active)socket.send({
            type:'+ connection',
            origin:getUniqueOf(module),
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

  environment.on('module created', function(evt) {
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
  }
  return this;
}