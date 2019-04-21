var Base=require("../Base.js");
module.exports=function(properties,environment){
    Base.call(this,properties,environment);
    this.name="TestDummy";
    this.category="sequencer";
    this.color=[32,64,125];
}