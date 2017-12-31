module.exports.LazyStack=function(properties) {
  var stackLimit = false;
  var stack = [];
  var self=this;
  // this.interval = 1;
  // this.tPerStep=50;
  this.dequeuing=false;
  this.messagePriority=50;
  for(var a in properties){
    this[a]=properties[a];
  }


  this.enq = function(cb) {
    if(!self.dequeuing){
      deq();
    }
    stack.push(cb);
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