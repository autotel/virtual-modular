var TimeIndex=function(properties){
  var self=this;
  this.max=false;
  this[0]=0;
  this[1]=0;
  for(var a of [0,1,'max']){
    if(properties[a]) this[a]=properties[a];
  }
  this.wrapAround=function(wrap = this.max){
    if(!self.max) return self;
    return TimeIndex.wrapAround(self,wrap);
  }
  this.getWrapped=function(){
    if(!self.max) return self;
    return self.clone().wrapAround();
  }
  this.add=function(other){
    return TimeIndex.add(self,other);
  }
  return this;
}

TimeIndex.wrapAround=function(timeIndex,wrap){
  if(timeindex[1]>wrap[1]){
    timeIndex[0]+=1;
  }
  timeIndex[0]%=wrap[0];
  return timeIndex;
}
TimeIndex.add=function(timeIndex,other){
  timeIndex[0]+=other[0];
  timeIndex[1]+=other[1];
  return timeIndex;
}
TimeIndex.new=function(properties){
  var ret=new TimeIndex(properties);
  return timeIndex;
}