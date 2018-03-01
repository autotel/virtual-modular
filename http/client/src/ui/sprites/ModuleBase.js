var Base=require('./Base.js');
module.exports=function(properties){
  properties.draggable=true;
  Base.call(this,properties);
  this.K.add( new Konva.Circle({
    x: 0,
    y: 0,
    radius: 10,
    fill: 'transparent',
    stroke: 'white',
    strokeWidth: 1
  }) );
}