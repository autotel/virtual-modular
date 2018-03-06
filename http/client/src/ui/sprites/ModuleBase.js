var Base=require('./Base.js');
module.exports=function(ui,properties){
  // console.log(ui);
  var force=ui.forceLayout;
  // console.log(force);
  var self=this;
  this.forceNode=force.addNode();

  properties.draggable=true;
  Base.call(this,ui,properties);
  this.K.add( new Konva.Circle({
    x: 0,
    y: 0,
    radius: 10,
    fill: 'transparent',
    stroke: 'white',
    strokeWidth: 1
  }) );

  this.connectTo=function(to){
    self.forceNode.connectTo(to.forceNode);
  }
  this.update=function(evt){
    if(evt.type='tick'){
      self.K.setX(self.forceNode.x);
      self.K.setY(self.forceNode.y);
    }
  }
  this.forceNode.tickFunction=function(evt){
    self.update(evt);
  }
}