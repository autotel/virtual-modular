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


var MessageCompressor=require('../http/shared/MessageCompressor');

var SuperInteractor=require('../interaction/http-server/SuperInteractor.js');

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
      var socketInterface=new(function(inSocket){
        var messageCompressor=new MessageCompressor(socket);
        function compress(msg){
          return messageCompressor.compress(msg);
        }
        function decompress(msg){
          return messageCompressor.decompress(msg);
        }
        this.send=function(message){
          // console.log("SENDING live",message);
          inSocket.write(compress(message));
        }
        var cb_msgrec=function(){};
        socket.on('message',function(msg){
          var evt=messageCompressor.decompress(msg);
          evt.original=msg;
          console.log("RECEIVE",evt);
          cb_msgrec(evt);
        });
        this.onMessage=function(cb){
          cb_msgrec=cb;
        }
      })(socket);
      var client=new SuperInteractor(environment,socketInterface);
      socket.on('disconnect',function() {
        client.remove();
        console.log('client has disconnected!');
        socketInterface.send=function(){
          console.error("Sending Message to closed socket");
        }
      });
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