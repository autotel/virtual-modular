module.exports=function(controlledModule, environment){
  var gui=environment.interfaces.http;

  this.features={
    grid:{type:grid,w:4,h:4},
    console:{type:text}
  }

  gui.on('input',function(){
    console.log('user input on http');
  });

  controlledModule.on('step',function(evt){
    gui.update('grid',{highlight:evt.bmp});
  });
  controlledModule.on('~ bitmap',function(evt){
    gui.update('grid',{bitmap:evt.bmp});
  });
}
