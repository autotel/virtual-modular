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
      if(!circles[n]){
        circles[n]=new Konva.Circle({
          radius: 5,
          fill: 'transparent',
          stroke: 'white',
          strokeWidth: 1
        });
        self.K.add( circles[n] );
      }else{
        circles[n].setAttr('visible',true);
      }

      var modPos=(n/to);

      circles[n].setX(Math.sin(modPos*TWO_PI)*(obq));
      circles[n].setY(Math.cos(modPos*TWO_PI)*(obq));

      // if(to>16)
      // obq+=0.5;

    }
    for(var n=to; n<circles.length; n++){
      circles[n].setAttr('visible',false);

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

  setLength(0);

  this.applyChanges=function(properties){
    if(properties.steps) setLength(properties.steps);
  }

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