// var Base=require('../../interaction/http-server/InteractorBase.js');
module.exports=function(controlledModule, environment, gui){
  // Base.call(this,controlledModule,environment,gui);
  this.features={
    grid:{type:'grid',w:4,h:4},
    console:{type:'text'}
  }

  gui.on('input',function(){
    console.log('user input on http');
  });

  controlledModule.on('step',function(evt){
    gui.update('grid',{highlight:evt.bmp});
  });
  controlledModule.on('~bitmap',function(evt){
    gui.update('grid',{bitmap:evt.bmp});
  });
}
