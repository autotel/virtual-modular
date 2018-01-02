module.exports.LazyStack=function(properties) {
  var stackLimit = false;
  var stack = [];
  var self=this;
  // this.interval = 1;
  // this.tPerStep=50;
  this.dequeuing=false;
  this.messagePriority=50;
  this.maxStack=false;
  for(var a in properties){
    this[a]=properties[a];
  }


  this.enq = function(cb) {

    stack.push(cb);
    if(self.maxStack){
      if(stack.length>self.maxStack){
        stack.splice(0,self.maxStack-stack.length);
        console.log(`stack.splice(0,${self.maxStack-stack.length});`);
      }
    }
    if(!self.dequeuing){
      deq();
    }
  }
  function deq(){
    self.dequeuing=true;
    let count=0;
    while(stack.length && count<self.messagePriority){
      (stack.shift())();
      count++
    }
    if(stack.length){
      setImmediate(deq);
      console.warn("! EVENTS STACK: "+stack.length+"");

    }else{
      self.dequeuing=false;
    }
  };
};
module.exports.requireProperties=function(propList){
  var missing={};
  for(var a in propList){
    if(typeof propList[a] === 'function'){
      let eval=propList[a](this[a]);
      if(!eval){
        missing[a]=eval;
      }
    }else{
      if(!this[propList[a]]){
        missing[propList[a]]="is "+missing[a];
      }else{
      }
    }
  }
  if(Object.keys(missing).length==0) missing=false;
  return missing;
}