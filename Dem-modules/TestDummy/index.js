var Base=require("../Base.js");
let instances=0;
const TestDummy=function(properties,environment){
    Base.call(this,properties,environment);
    this.name=this.constructor.name+""+instances;
    instances++;
    this.category="sequencer";
    this.color=[32,64,125];
}
module.exports=TestDummy;