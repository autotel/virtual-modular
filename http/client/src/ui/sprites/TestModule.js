var Base=require('./ModuleBase.js');
module.exports=function(properties){
  Base.call(this,properties);
  var testCircle=new Konva.Circle({
    x: 0,
    y: 0,
    radius: 5,
    fill: 'transparent',
    stroke: 'white',
    strokeWidth: 1
  });
  this.K.add( testCircle );
  this.update=function(absTime,deltaTime){
    var obq=Math.sin(absTime/205)*5+10;
    testCircle.setX(Math.sin(absTime/400)*(obq));
    testCircle.setY(Math.cos(absTime/400)*(obq));
  }
}