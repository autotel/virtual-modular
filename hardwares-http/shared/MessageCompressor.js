'use strict';
var Observable=require('onhandlers');

var dataMap=[
  {
    header:'start',
  },{
    header:'+module',
    attributes:['unique','name','kind'],
    compress:{},decompress:{}
  },{
    header:'-module',
    attributes:['origin'],
    compress:{},decompress:{}
  },{
    header:'~module',
    attributes:['origin','steps'],
    compress:{},decompress:{}
  },{
    header:'select_module',
    attributes:['origin'],
    compress:{},decompress:{}
  },{
    header:'deselect_module',
    attributes:['origin'],
    compress:{},decompress:{}
  },{
    header:'focus_module',
    attributes:['origin'],
    compress:{},decompress:{}
  },{
    header:'defocus module',
    attributes:['origin'],
    compress:{},decompress:{}
  },{
    header:'>message',
    attributes:['origin','destination','val'],
    compress:{
      val:function(val){return Array.from(val.value); }
    },
    decompress:{
      val:function(val){return Array.from(val.value); }
    }
  },{
    header:'+connection',
    attributes:['origin','destination'],
    compress:{},decompress:{}
  },{
    header:'-connection',
    attributes:['origin','destination'],
    compress:{},decompress:{}
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
    // console.log("COMP");
    var header=readableMessage.type;
    var headerNumber=headerToDataMap[header];
    var map=dataMap[headerNumber];
    var ret=[parseInt(headerNumber)];
    if(!map){
      console.error("data structure of the message is",map,readableMessage);
      return readableMessage;
    }
    if(map.attributes){
      for(var a of map.attributes){
        if(typeof map.compress[a] === 'function'){
          ret.push(map.compress[a](readableMessage[a]));
        }else{
          ret.push(readableMessage[a]);
        }
      }
    }
    // console.log(readableMessage,"=",ret);
    return ret;
  }
  this.decompress=function(compressedMessage){
    compressedMessage=Array.from(compressedMessage);
    // console.log("DECOMP",compressedMessage);
    var ret={}
    var headerNumber=compressedMessage.shift();
    var map=dataMap[headerNumber];
    if(!map){
      console.error("data structure of the message is",map,readableMessage);
      return compressedMessage;
    }
    var header=map.header;
    ret.type=header;
    for(var a in map.attributes){

      if(typeof map.decompress[a] === 'function'){
        ret[map.attributes[a]]=map.decompress[a](compressedMessage[a]);
      }else{
        ret[map.attributes[a]]=compressedMessage[a];
      }
    }
    return ret;
  }

}
module.exports = MessageCompressor;