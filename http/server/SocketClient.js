//this is created when a client connects to the socket, and keeps track of the user and it's events and so on.
var socketList=[];

var onHandlers=require('onhandlers');

var SocketClient=function(socket,nodeServer){
  // console.log(nodeServer);
  /**/console.log('a client connected');
  // console.log(nodeServer);
  onHandlers.call(this);
  socketList.push(this);
  socket.emit(nodeServer.messageIndexes.HELLO,"hellolo");
  var thisClient=this;

  for(var a in nodeServer.messageNames){
    (function(mtn){
      var messageName=nodeServer.messageNames[mtn];
      socket.on(mtn,function(e){
        var event={
          originalEvent:e,
          client:thisClient,
          messageName:messageName,
          messageIndex:mtn
        };
        // console.log(JSON.stringify(event));
        nodeServer.handle('message',event);
        nodeServer.handle("rec_"+messageName.toLowerCase(),event);
      });
    })(a);
  }

  socket.on(nodeServer.messageIndexes.CREATE,function(event){
    /**/console.log("component create requested");
  });
  socket.on(nodeServer.messageIndexes.CHANGE,function(params){
    /**/console.log("component change requested");
  });





  socket.on('disconnect',function(e){
    /**/console.log("client disconnected");
  });
}

module.exports=function(nodeServer){
  onHandlers.call(this);
  this.add=function(socket,nodeServer){
    return new SocketClient(socket,nodeServer);
  }
  this.each=function(cb){
    for(var a in socketList){
      cb.call(socketList[a],{index:a});
    }
  }
  return this;
};