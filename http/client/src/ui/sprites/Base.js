
module.exports=function(ui,properties){
  this.K=new Konva.Group();
  this.place=function(coords){
    if(coords.x)
      this.K.setX(coords.x);
    if(coords.y)
      this.K.setY(coords.y);
  }
  this.update=function(){}
}