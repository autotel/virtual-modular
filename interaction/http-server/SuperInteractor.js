var InteractorBase=require('./InteractorBase');
var uniquesCount=0;

module.exports=function(environment,socket){
  var self=this;

  var instancedModules=new Set();
  var availableModules=new Set();
  function getUniqueOf(module){
    if(module._instancedInterfaces){
      if(module._instancedInterfaces.http){
        return module._instancedInterfaces.http.serverUnique;
      }
    }
    return false;
  }
  socket.onMessage(console.log);

  // socket.write('socket write test');
  // socket.emit('emit test',{vv:'emit test'});
  this.onDataReceived=function(data){
    console.log(data);
  }

  function moduleCreatedCallback(module){
    console.log(module.interfaces);
    //polyfill constructor
    if(!module.interfaces.Http){
      module.interfaces.Http=InteractorBase;
    }
    //instance interactor if not yet done.
    if(!module._instancedInterfaces.http){
      module._instancedInterfaces.http=new module.interfaces.Http(module,environment,self);
      module._instancedInterfaces.http.serverUnique=uniquesCount;
      uniquesCount++;
    }
    var nInterface=module._instancedInterfaces;

    socket.send({
      type:'+ module',
      unique:getUniqueOf(module),
      name:module.name,
      baseName:module.baseName
    });

    nInterface.http.triggerModuleData(function(data){
      if(data.output){
        socket.send({
          type:'+ connection',
          origin:getUniqueOf(module),
          destination:getUniqueOf(data.output)
        });
      }
    });

    instancedModules.add(module);
  }

  for(var module of environment.modules.list){
    // console.log(a);
    moduleCreatedCallback(module);

  }

  environment.on('module created', function(evt) {
    moduleCreatedCallback(evt.module);
  });

  this.moduleEvent=function(type,evt){
    console.log("MODEV");
    // evt.original.type=evt.event;
    var evtt=evt;
    if(evtt.origin){
      evtt.origin=getUniqueOf(evtt.origin);
      console.log("ORIG",(evtt.origin));
    }
    if(evtt.destination){
      evtt.destination=getUniqueOf(evtt.destination);
      console.log("DEST",(evtt.destination));
    }
    evtt.type=type;
    socket.send(evtt);
    // console.log(evt);
  }

  socket.send({type:'start'});

  return this;
}