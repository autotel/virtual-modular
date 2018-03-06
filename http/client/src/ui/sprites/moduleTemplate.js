var Base=require('./ModuleBase.js');
module.exports=function(ui,properties){
  var node=this.node=properties.node;

  Base.call(this,ui,properties);
  var self=this;


  if(properties.position){
    this.place(properties.position);
  }

  var _upd=this.update;
  var absTime=0;
  this.update=function(evt){
    if(evt.type=="clock"){
      absTime=evt.absTime;
      _upd(evt);
      var obq=Math.sin(absTime/205*speed)*5+10;
      testCircle.setX(Math.sin(absTime/400*speed)*(obq));
      testCircle.setY(Math.cos(absTime/400*speed)*(obq));
    }
  }
}