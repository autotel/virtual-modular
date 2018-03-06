var Base=require('./ModuleBase.js');
const TWO_PI = Math.PI * 2;
module.exports=function(ui,properties){
  var node=this.node=properties.node;

  Base.call(this,ui,properties);
  var self=this;
  var speed=Math.random();
  var steps=0;


  var circles=[];

  function setLength(to){
    var steps=to;

    var obq=22;
    for(var n=0; n<to; n++){
      var modPos=(n/steps)%1;
      var newCircle=new Konva.Circle({
        x: Math.sin(modPos*TWO_PI)*(obq),
        y: Math.cos(modPos*TWO_PI)*(obq),
        radius: 5,
        fill: 'transparent',
        stroke: 'white',
        strokeWidth: 1
      });
      if(to>16)
      obq+=0.5;

      self.K.add( newCircle );
    }

    // eachStepCircle(function(circle,n){
    //   // circle.setX(Math.random()*100);
    //   // var modPos=(n/steps)%1;
    //   // circle.setX(Math.sin(modPos*TWO_PI)*(obq));
    //   // circle.setY(Math.cos(modPos*TWO_PI)*(obq));
    // });
    // var obq=Math.sin(absTime/205*speed)*5+10;

  }

  function eachStepCircle(callback){
    for(var n=0; n<circles.length; n++){
      callback(circles[n],n);
    }
  };

  setLength(16);


  
  var place={x:0,y:0}
  place.x=Math.random()*100;
  place.y=Math.random()*100;

  this.K.setX(place.x);
  this.K.setY(place.y);

  var _upd=this.update;
  var absTime=0;

  // this.update=function(evt){
    // _upd(evt);

    // if(evt.type=="clock"){
    //
    // }
  // }
}