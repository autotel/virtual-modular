'use strict';

var httpBasePath=__dirname+'/../http';
var clientBasePath=httpBasePath+"/client";

var nodeServer={};

var Observable=require('onhandlers');
var httpPort=80;
var express = require('express');
var app = express();
var http = require('http').Server(app);
var SocketMan = require('socket.io')(http);

var uniquesCount=0;

var MessageCompressor=require('../http/shared/MessageCompressor');

var SocketClientInteractor=function(environment,socket){
  var messageCompressor=new MessageCompressor(socket);

  var instancedModules=new Set();
  var availableModules=new Set();

  socket.on('message',console.log);
  // for(var fn in socket){
  //   if(typeof socket[fn] == "function"){
  //     console.log("   -",fn);
  //   }
  // }
  /*
  buildHandlshake
  emit
  in
  to
  write
  send
  packet
  join
  leave
  leaveAll
  onconnect
  onpacket
  onevent
  ack
  onpacket
  ondisconnect
  onerror
  onclose
  error
  disconnect
  setMaxListeners
  getMaxListeners
  addListener
  on
  prependListener
  once
  prependOnceListener
  removeListener
  removeAllListeners
  listeners
  listenerCount
  eventNames
  */
  socket.write('socket write test');
  // socket.emit('emit test',{vv:'emit test'});
  this.onDataReceived=function(data){
    console.log(data);
  }

  function moduleCreatedCallback(module){
    console.log(module.interfaces);
    if(!module.interfaces.Http){
      module.interfaces.Http=function(){

      }
    }
    if(!module._instancedInterfaces.http){
      module._instancedInterfaces.http=new module.interfaces.Http(environment,module);
      module._instancedInterfaces.http.serverUnique=uniquesCount;
      uniquesCount++;
    }
    var unique=module._instancedInterfaces.http.serverUnique;
    var nInterface=module._instancedInterfaces;
    socket.write({type:'+ module',data:[unique,module.name,nInterface.features]});
    instancedModules.add(module);
  }

  for(var a of environment.modules.list){
    // console.log(a);
    moduleCreatedCallback(a);
  }

  environment.on('module created', function(evt) {
    moduleCreatedCallback(evt.module);
  });

  return this;
}

var HttpGui=function(properties,environment){
  var self=this;
  // var myInteractionPattern=environment.interactionMan.newSuperInteractor("httpGui",this);

  var messageCompressor=false;
  Observable.call(this);
  var serverMan=this;

  this.start=function(){
    console.log("starting server");
    app.get('/', function(req, res){
      app.use('/',express.static(clientBasePath));
      console.log("GET",clientBasePath+'/index.html');
      res.sendFile('index.html', { root : clientBasePath});
      // res.sendFile(clientBasePath+'/index.html');
    });
    http.listen(httpPort, function(){
      console.log('listening on :'+httpPort);
    });
    SocketMan.on('connection', function(socket){
      var client=new SocketClientInteractor(environment,socket);

    });

  }
  this.broadcast=function(a,b){SocketMan.emit(a,b)};
  return this;
}
HttpGui.initialization=function(environment){
  var guiServer = new HttpGui({},environment);
  guiServer.start();
}
module.exports = HttpGui;