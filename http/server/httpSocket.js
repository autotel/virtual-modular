'use strict';
var onHandlers=require('onhandlers');
var httpPort=80;
var express = require('express');
var app = express();
var http = require('http').Server(app);
var SocketMan = require('socket.io')(http);
var SocketClients = require('./SocketClient.js');


module.exports=function(nodeServer){ return new (function(){
  onHandlers.call(this);
  var serverMan=this;

  var socketClients=new SocketClients(this);
  var header=nodeServer.messageIndexes;

  this.start=function(file){
    console.log("starting server");
    app.get('/', function(req, res){
      /*
      var directory = require('serve-index');
       app.use(directory(your_path));
      */

      app.use("/",express.static('./online/frontend'));
      app.use("/shared",express.static('./online/bothEnds'));
      res.sendFile(file);
    });
    http.listen(httpPort, function(){
      // console.log(http.address());
      // var ip = http.address().address;
      // serverMan.handle('ipready',ip);
      // /**/console.log("IP:",ip);
      /**/console.log('listening on :'+httpPort);
    });
    SocketMan.on('connection', function(socket){
      socketClients.add(socket,nodeServer);
      // TODO: : the following maybe should be in patcherModuleBinder file
      nodeServer.binder.eachBindedUnique(function(data){
        socket.emit(header.CREATE,data);
      });
      //emit current state
      // nodeServer.systemManager.each(function(){
      //   var nparams=this.getOntoParams();
      //   socket.emit(serverMan.messageIndexes.CREATE,nparams);
      // });
      // nodeServer.systemManager.each(function(){
      //   var nparams=this.getAllParameters();
      //   socket.emit(serverMan.messageIndexes.CHANGE,nparams);
      // });
    });

  }



//pseudo code
  // SocketMan.on('message',function(event){
  //   var newEvent=event;
  //   console.log(event);
  //   this.handle(event.message,event);
  // });
  //if "SocketMan" emits, it's recieved by all. if SocketClient broadcast.emits,
  //its received by all but that socket
  this.broadcast=function(a,b){SocketMan.emit(a,b)};

  return this;
})()};