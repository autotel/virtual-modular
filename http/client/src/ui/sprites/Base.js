
module.exports=function(ui,properties){
  var layer=ui.konvaLayer;
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
    this.K.destroy();
    // this.K.remove();
  }
}