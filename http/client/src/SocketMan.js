'use strict';
var Observable=require('onhandlers');
var messageCompressor=new (require('../../shared/MessageCompressor.js'));
var compress=messageCompressor.compress;
var decompress=messageCompressor.decompress;
var globalBindFunction;
var uniqueArray=[];

var SocketMan=function(environment){
  Observable.call(this);
  var self=this;
  var socket = io();
  socket.on('message',function(msg){
    msg=decompress(msg);
    if(msg.type){
      // if(msg.type!="> message") console.log(">>",msg);
      self.handle(msg.type,msg);
      if(messageCallbacks[msg.type]){
        messageCallbacks[msg.type](msg);
      }else{
        console.log("-no procedure for",msg.type);
      }
    }else{
      console.log('received malformed message',msg);
    }
  });
  socket.on('emit test',console.log);
  this.testMessage=function(text){
    socket.send('test',text);
  }

  var messageCallbacks={
    'start':function(){
      // window.location.href=window.location.href;
      environment.handle('server start');
    },
    '+ module':function(msg){
      // console.log("NEW MODULE",msg);
      environment.addModule(msg);
    },
    '- module':function(msg){
      // console.log("NEW MODULE",msg);
      environment.removeModule(msg);
    },
    '~ module':function(msg){
      // console.log("NEW MODULE",msg);
      environment.changeModule(msg);
    },
    '+ connection':function(msg){
      // console.log("CONNECT MODULE",msg);
      environment.connect(msg);
    },
    '- connection':function(msg){
      // console.log("CONNECT MODULE",msg);
      environment.disconnect(msg);
    },
    '> message':function(msg){
      // console.log("CONNECT MODULE",msg);
      // environment.handle('eventMessage',msg);
      environment.makeEventMessageEvent(msg);
    }
  }

  return this;
};


module.exports=SocketMan