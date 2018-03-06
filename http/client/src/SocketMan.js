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
    '+ module':function(msg){
      // console.log("NEW MODULE",msg);
      environment.addModule(msg);
    },
    '+ connection':function(msg){
      // console.log("CONNECT MODULE",msg);
      environment.connect(msg);
    },
    '- connection':function(msg){
      // console.log("CONNECT MODULE",msg);
      environment.disconnect(msg);
    }
  }

  return this;
};


module.exports=SocketMan