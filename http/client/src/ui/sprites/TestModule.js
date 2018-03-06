var Base=require('./ModuleBase.js');
module.exports=function(ui,properties){
  var node=this.node=properties.node;

  Base.call(this,ui,properties);
  var self=this;
  var speed=Math.random();
  var testCircle=new Konva.Circle({
    x: 0,
    y: 0,
    radius: 5,
    fill: 'transparent',
    stroke: 'white',
    strokeWidth: 1
  });
  this.K.add( testCircle );

  if(properties.name){
    var text=new Konva.Text({
      x:0,
      y:-15,
      text:properties.name,
      fill: 'white'
    });
    text.setOffset({
      x: text.getWidth() / 2
    });
    this.K.add(text);
  }
  var place={x:0,y:0}
  place.x=Math.random()*100;
  place.y=Math.random()*100;

  this.K.setX(place.x);
  this.K.setY(place.y);

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