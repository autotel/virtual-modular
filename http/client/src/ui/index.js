var Client=require('./Client.js');
var Elements=require('./sprites');
var ForceDirectedGrapher=require('./ForceDirectedGrapher.js');
module.exports=function(environment){
  var self=this;
  var start=function(){
    // console.log("UI START");
    var forceLayout=self.forceLayout=new ForceDirectedGrapher();
    var client=new Client();
    var stage = new Konva.Stage({
      container: 'konva',
      width: window.innerWidth,
      height: window.innerHeight
    });

    var layer = self.konvaLayer = new Konva.Layer();
    stage.add(layer);

    var testModules=[];
    var qty=3;
    while(qty){
      qty--;
      var n= testModules.push(new Elements.TestModule(self,{name:"hola"}));
      if(testModules.length>1){
        testModules[n-1].connectTo(testModules[n-2]);
        testModules[n-1].connectTo(testModules[Math.floor(Math.random()*testModules.length)]);
      }
    }
    testModules[0].connectTo(testModules[testModules.length-1]);

    var anim = new Konva.Animation(function(frame) {
      var time = frame.time,
        deltaTime = frame.timeDiff,
        frameRate = frame.frameRate;
    }, layer);
    anim.start();

    environment.on('+ module',function(event){
      var module=event.module;
      var nMod=new Elements.TestModule(self,module.properties);
      testModules.push(nMod);
      module.sprite=nMod;
    });
    environment.on('+ connection',function(event){
      event.origin.sprite.connectTo(event.destination.sprite);
    });
    environment.on('- connection',function(event){
      event.origin.sprite.disconnectTo(event.destination.sprite);
    });
  }
  window.onload=start;

}