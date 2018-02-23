var Observable=require('onhandlers');

var MessageCompressor=function(socket){
  var self=this;
  Observable.call(this);

  // this.agreeHeader=function(){}
  this.conversionTable=[
    'new header agreement',
    'request header translation'
  ];
  this.compress=function(readableMessage){
    //check if message header is registered in the compressed table
    {
      //if it's not registered, prepend a header agreement header
    }//else
    {
      //if it is, just translatae the message into compressed form
    }
    //for now...
    compressed=JSON.stringify( readableMessage );
    return compressedMessage;
  }
  this.decompress=function(compressedMessage){
    //check if message header is registered in the compressed table
    {
      //if it's not registered, send a header translation header
    }//else
    {
      //if it is, just translatae the message into readable form
    }
    readableMessage=JSON.parse( compressedMessage );
    return readableMessage;
  }
  
}
module.exports = MessageCompressor;