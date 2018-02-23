'use strict';

var messageCompressor=new (require('../../shared/MessageCompressor.js'));
var compress=messageCompressor.compress;
var decompress=messageCompressor.decompress;
var globalBindFunction;
var uniqueArray=[];
var socketMan=new (function(){
  var socket = io();
  socket.on('message',function(msg){
    msg=decompress(msg);
    if(msg.type){
      messageCallbacks[msg.type](msg);
    }else{
      console.log('received malformed message',msg);
    }
  });
  socket.on('emit test',console.log);
  this.testMessage=function(text){
    socket.send('test',text);
  }
  return this;
});

var messageCallbacks={
  '+ module':function(msg){
    console.log("NEW MODULE",msg);
  }
}