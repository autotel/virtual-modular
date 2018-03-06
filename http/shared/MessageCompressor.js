'use strict';
var Observable=require('onhandlers');

var dataMap=[
  {
    header:'start',
  },{
    header:'+ module',
    attributes:['unique','name','kind'],
  },{
    header:'- module',
    attributes:['unique'],
  },{
    header:'select module',
    attributes:['origin'],
  },{
    header:'deselect module',
    attributes:['origin'],
  },{
    header:'focus module',
    attributes:['origin'],
  },{
    header:'defocus module',
    attributes:['origin'],
  },{
    header:'> message',
    attributes:['origin','destination','val'],
  },{
    header:'+ connection',
    attributes:['origin','destination'],
  },{
    header:'- connection',
    attributes:['origin','destination'],
  }
]

var headerToDataMap={};

for(var a in dataMap){
  headerToDataMap[dataMap[a].header] = a;
}

var MessageCompressor=function(socket){
  var self=this;
  Observable.call(this);

  this.compress=function(readableMessage){
    console.log("COMP");
    var header=readableMessage.type;
    var headerNumber=headerToDataMap[header];
    var map=dataMap[headerNumber];
    var ret=[parseInt(headerNumber)];
    if(!map){
      console.error("data structure of the message is",map,readableMessage);
      return;
    }
    if(map.attributes){
      for(var a of map.attributes){
        ret.push(readableMessage[a]);
      }
    }
    console.log(readableMessage,"=",ret);
    return ret;
  }
  this.decompress=function(compressedMessage){
    compressedMessage=Array.from(compressedMessage);
    console.log("DECOMP",compressedMessage);
    var ret={}
    var headerNumber=compressedMessage.shift();
    var map=dataMap[headerNumber];
    if(!map){
      console.error("data structure of the message is",map,readableMessage);
      return;
    }
    var header=map.header;
    ret.type=header;
    for(var a in map.attributes){
      ret[map.attributes[a]]=compressedMessage[a];
    }
    return ret;
  }

}
module.exports = MessageCompressor;