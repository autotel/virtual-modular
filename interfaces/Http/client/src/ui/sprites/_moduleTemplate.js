const Base= require('./ModuleBase.js');
var colours=require("../colours");
module.exports=function(ui,properties){
  var node=this.node=properties.node;

  Base.call(this,ui,properties);
  var self=this;


  if(properties.position){
    this.place(properties.position);
  }

  var _upd=this.update;
  var absTime=0;
  this.update=function(evt){
    if(evt.type=="clock"){
      absTime=evt.absTime;
      _upd(evt);
      //update graphics?
    }
  }
}