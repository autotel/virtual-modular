var InteractorBase=require('./InteractorBase');
var uniquesCount=0;

module.exports=function(environment,socket){
  var self=this;

  var instancedModules=new Set();
  var availableModules=new Set();
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
      module._instancedInterfaces.http=new module.interfaces.Http(module,environment);
      module._instancedInterfaces.http.serverUnique=uniquesCount;
      uniquesCount++;
      console.log("(UNIQUES",uniquesCount);
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

    module.on('*',function(evt){
      // console.log("MODEV",);

      var evtt={}

      for(var a in evt.original){
        evtt[a]=evt.original[a];
      }

      if(evtt.origin){
        evtt.origin=getUniqueOf(evtt.origin);
        console.log("ORIG",(evtt.origin));
      }
      if(evtt.destination){
        evtt.destination=getUniqueOf(evtt.destination);
        console.log("DEST",(evtt.destination));
      }
      evtt.type=evt.name;
      socket.send(evtt);

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


  socket.send({type:'start'});
  this.remove=function(){
    console.log("superinteractor delete not implemented");
  }
  return this;
}