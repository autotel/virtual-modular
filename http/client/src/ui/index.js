var Client=require('./Client.js');
var Elements=require('./sprites');
module.exports=function(environment){

  var start=function(){
    var client=new Client();
    // first we need to create a stage
    var stage = new Konva.Stage({
      container: 'konva',   // id of container <div>
      width: 500,
      height: 500
    });

    // then create layer
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
    // circle.draggable('true');
    var module=new Elements.TestModule({});
    layer.add(module.K);
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

        module.update(time,deltaTime);
      // console.log(frame);
        // update stuff
    }, layer);
    anim.start();
  }
  environment.on('start',start);

}