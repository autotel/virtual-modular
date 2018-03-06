var Client=require('./Client.js');
var Elements=require('./sprites');
var ForceDirectedGrapher=require('./ForceDirectedGrapher.js');
module.exports=function(environment){
  var self=this;
  var start=function(){
    console.log("UI START");
    var forceLayout=self.forceLayout=new ForceDirectedGrapher();
    var client=new Client();
    var stage = new Konva.Stage({
      container: 'konva',   // id of container <div>
      width: 500,
      height: 500
    });

    var layer = new Konva.Layer();

    // create our shape
    var circle = new Konva.Circle({
      x: stage.getWidth() / 2,
      y: stage.getHeight() / 2,
      radius: 8,
      fill: 'red',
      stroke: 'black',
      strokeWidth: 4,
      draggable:true
    });

    var testModules=[];
    var qty=90;
    while(qty){
      qty--;
      var n= testModules.push(new Elements.TestModule(self,{}));
      if(testModules.length>1){
        // testModules[n-1].connectTo(testModules[n-2]);
        testModules[n-1].connectTo(testModules[Math.floor(Math.random()*testModules.length)]);

      }
    }
    testModules[0].connectTo(testModules[testModules.length-1]);

    // forceLayout.restart();

    circle.draggable('true');
    // var testModules=[
    //   new Elements.TestModule(self,{}),
    //   new Elements.TestModule(self,{}),
    //   new Elements.TestModule(self,{}),
    // ];
    // testModules[0].connectTo(testModules[1]);



    for(var a of testModules)
      layer.add(a.K);
    // add the shape to the layer
    layer.add(circle);

    // add the layer to the stage
    stage.add(layer);

    // function step(timestamp) {
    //   if (!start) start = timestamp;
    //   var progress = timestamp - start;
    //   circle.x=timestamp;
    //   requestAnimationFrame(step);
    // }
    // step(0);

    var anim = new Konva.Animation(function(frame) {
      var time = frame.time,
        deltaTime = frame.timeDiff,
        frameRate = frame.frameRate;
        // for(var a of testModules)
        //   a.update(time,deltaTime);
        // Force.update();
      // console.log(frame);
        // update stuff
    }, layer);
    anim.start();
  }
  // environment.on('start',start);
  window.onload=start;

}