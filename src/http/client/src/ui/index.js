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

    var anim = new Konva.Animation(function(frame) {
      var time = frame.time,
        deltaTime = frame.timeDiff,
        frameRate = frame.frameRate;
    }, layer);
    anim.start();
    environment.on('serverstart',function(){
      for(var module of moduleSprites){
        // module.remove();
      }
    });
    environment.on('modulereset',function(event){
      var module=event.module;
      if(module.sprite){
        module.sprite.remove();
      }

    });
    environment.on('+module',function(event){
      var module=event.module;
      // console.log("SPRIOTE",event);
      if(moduleSprites[module.properties.unique]){
        // console.log("FOUND",module.properties.unique,module);
        moduleSprites[module.properties.unique].remove();
      }
      var newSprite;
      if(Elements[module.properties.kind]){
        newSprite=new Elements[module.properties.kind](self,module.properties);
      }else{
        console.log("No "+module.properties.kind+" module sprite, using generic",Elements);
        console.log(event);
        newSprite=new Elements.TestModule(self,module.properties);
      }
      moduleSprites[module.properties.unique]=(newSprite);
      module.sprite=newSprite;
    });
    environment.on('-module',function(event){
      var module=event.module;
      moduleSprites[module.properties.unique].remove();
    });
    environment.on('~module',function(event){
      var module=event.module;
      moduleSprites[module.properties.unique].applyChanges(event);
    });
    environment.on('+connection',function(event){
      event.origin.sprite.connectTo(event.destination.sprite);
    });
    environment.on('-connection',function(event){
      event.origin.sprite.disconnectTo(event.destination.sprite);
    });
    environment.on('>message',function(event){
      // console.log(event);
      event.origin.sprite.messageOut(event.destination,event.value);
      if(event.destination.sprite.messageIn){
        event.destination.sprite.messageIn(event.origin,event.value);
      }

    });
  }
  window.onload=start;

}