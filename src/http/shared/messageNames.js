
// console.log("messagenames");
var getMessageNames=function(caller){
  // console.log("call",caller);
  (function(){
    var messageIndexes={
      HELLO:0,
      CHANGE:0,
      CREATE:0,
      DELETE:0,
      CONNECT:0,
      EVENT:0,
      CONSOLE:0
    }
    var messageNames=[];
    var b=0;
    for(var a in messageIndexes){
      console.log("name of "+b+" = "+a);
      messageIndexes[a]=b;
      messageNames[b]=a;
      b++;
    }
    this.messageNames=messageNames;
    this.messageIndexes=messageIndexes;
  }).call(caller);
}
if (typeof exports !== "undefined")
module.exports=getMessageNames;