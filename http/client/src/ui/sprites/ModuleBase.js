var Base=require('./Base.js');
module.exports=function(ui,properties){
  // console.log(ui);
  var force=ui.forceLayout;
  // console.log(force);
  var self=this;
  this.forceNode=force.getOrMakeNode(properties,function(node){
    return node.unique==properties.unique;
  });

  properties.draggable=true;
  Base.call(this,ui,properties);
  if(properties.name){
    var text=new Konva.Text({
      x:10,
      y:-12,
      rotation:-30,
      text:properties.name,
      fill: 'rgba(255,255,255,0.2)'
    });
    // text.setOffset({
    //   x: text.getWidth() / 2
    // });
    this.K.add(text);
  }
  // this.K.add( new Konva.Circle({
  //   x: 0,
  //   y: 0,
  //   radius: 10,
  //   fill: 'transparent',
  //   stroke: 'white',
  //   strokeWidth: 1,
  //   draggable: 'true'
  // }) );
  this.connectTo=function(to){
    self.forceNode.connectTo(to.forceNode);
  }
  this.disconnectTo=function(to){
    self.forceNode.disconnectTo(to.forceNode);
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