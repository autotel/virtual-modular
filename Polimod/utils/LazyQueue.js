module.exports=function(properties) {
  var queueLimit = false;
  var queue = [];queue
  var self=this;
  // this.interval = 1;
  // this.tPerStep=50;
  this.dequeuing=false;
  this.messagePriority=50;
  this.maxQueue=false;
  for(var a in properties){
    this[a]=properties[a];
  }


  this.enq = function(cb) {
    queue.push(cb);
    if(self.maxQueue){
      if(queue.length>self.maxQueue){
        queue.splice(0,self.maxQueue-queue.length);
        // console.log(`queue.splice(0,${self.maxQueue-queue.length});`);
      }
    }
    if(!self.dequeuing){
      deq();
    }
  }
  function deq(){
    self.dequeuing=true;
    let count=0;
    while(queue.length && count<self.messagePriority){
      (queue.shift())();
      count++
    }
    if(queue.length){
      setImmediate(deq);
      console.warn("! EVENTS FIFO: "+queue.length+"");

    }else{
      self.dequeuing=false;
    }
  };
};