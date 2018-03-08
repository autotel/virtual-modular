
module.exports=function(ui,properties){
  var layer=ui.konvaLayer;
  var self=this;
  this.K=new Konva.Group();
  layer.add(this.K);
  this.place=function(coords){
    if(coords.x)
      this.K.setX(coords.x);
    if(coords.y)
      this.K.setY(coords.y);
  }
  this.update=function(){}
  this.remove=function(){
    self.K.destroy();
    // this.K.remove();
  }
}