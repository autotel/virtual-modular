var colours = require("../colours");

const Base= require('./Base.js');
module.exports=function(ui,properties){
  Base.call(this,ui,properties);
  // console.log(ui);
  var force=ui.forceLayout;
  // console.log(force);
  var self=this;
  this.forceNode=force.getOrMakeNode(properties,function(node){
    return node.unique==properties.unique;
  });
  this.messageOut=function(to,msg){
    var exists=self.forceNode.getLinkTo(to.sprite.forceNode);
    if(exists){
      exists.highlight();
    }else{
      console.warn("couldn't find a link to highlight");
    }

  }

  properties.draggable=true;
  if(properties.name){
    var text=new Konva.Text({
      x:10,
      y:-12,
      rotation:-30,
      text: properties.name,
      fill: colours.lines,
      // sttoke:colours.black
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
  this.applyChanges=function(properties){

  }
  this.update=function(evt){
    // text.setAttr('text', self.forceNode.links.length+", "+self.forceNode.outputs.size);
    if(evt.type='tick'){
      self.K.setX(self.forceNode.x);
      self.K.setY(self.forceNode.y);
    }
  }
  this.forceNode.tickFunction=function(evt){
    self.update(evt);
  }

  // var _remove=this.remove;
  // this.remove=function(){
  //   force.removeNode(self.forceNode);
  //   // _remove();
  // }
}