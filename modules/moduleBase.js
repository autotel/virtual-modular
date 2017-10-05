module.exports=function(){
  var thisModule=this;
  var outputs=this.outputs=new Set();
  this.baseName="base";
  this.connectTo=function(what){
    outputs.add(what);
  }
  this.connectFrom=function(what){
    try{
      what.connectTo(thisModule);
    }catch(e){
      console.log(e);
      console.log("perhaps you tried to connect from a non-module?");
    }
  }
  this.disconnectFrom=function(what){
    outputs.delete(what);
  }
  this.output=function(eventMessage){
    outputs.forEach(callbackFn,thisModule);
  }
}
