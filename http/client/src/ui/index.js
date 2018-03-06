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

    var moduleSprites=[];
    // var qty=3;
    // while(qty){
    //   qty--;
    //   var n= moduleSprites.push(new Elements.TestModule(self,{name:"hola"}));
    //   if(moduleSprites.length>1){
    //     moduleSprites[n-1].connectTo(moduleSprites[n-2]);
    //     moduleSprites[n-1].connectTo(moduleSprites[Math.floor(Math.random()*moduleSprites.length)]);
    //   }
    // }
    // moduleSprites[0].connectTo(moduleSprites[moduleSprites.length-1]);

    var anim = new Konva.Animation(function(frame) {
      var time = frame.time,
        deltaTime = frame.timeDiff,
        frameRate = frame.frameRate;
    }, layer);
    anim.start();
    environment.on('server start',function(){
      for(var module of moduleSprites){
        // module.remove();
      }
    });
    environment.on('module reset',function(event){
      var module=event.module;
      if(module.sprite){
        module.sprite.remove();
      }

    });
    environment.on('+ module',function(event){
      var module=event.module;
      // console.log("SPRIOTE",event);
      if(moduleSprites[module.properties.unique]){
        // console.log("FOUND",module.properties.unique,module);
        moduleSprites[module.properties.unique].remove();
      }

      var newSprite;
      if(Elements[event.module.baseName]){
        newSprite=new Elements[event.module.baseName](self,module.properties);
      }else{
        newSprite=new Elements.TestModule(self,module.properties);
      }
      moduleSprites[module.properties.unique]=(newSprite);
      module.sprite=newSprite;
    });
    environment.on('- module',function(event){
      var module=event.module;
      moduleSprites[module.properties.unique].remove();
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