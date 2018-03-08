var Base=require('./ModuleBase.js');
module.exports=function(ui,properties){
  var node=this.node=properties.node;

  Base.call(this,ui,properties);
  var self=this;
  var circle=new Konva.Circle({
    x: 0,
    y: 0,
    radius: 5,
    fill: 'transparent',
    stroke: 'white',
    strokeWidth: 1
  });
  this.K.add(circle);
  var animStep=0;
  var activity=0;

  if(properties.position){
    this.place(properties.position);
  }

  this.messageIn=function(from,val){
    activity+=0.4;
  };
  var _upd=this.update;
  var absTime=0;
  this.update=function(evt){
    if(evt.type=="clock"){
      animStep+=activity;
      animStep%=30;

      absTime=evt.absTime;
      _upd(evt);
      circle.setAttr('radius',animStep);
      circle.setAttr('opacity',activity);
    }
      activity=Math.floor(1000*activity*0.9)/1000;

  }
}