const Base= require("../Base.js");
const outputOSC=require("./outputOscSingleton");
let instances=0;

const OSoundControl=function(properties,environment){
    Base.call(this,properties,environment);
    let self=this;
    this.name=this.constructor.name+""+instances;
    instances++;
    this.category="output";
    this.color=[125,125,125];
    this.controlledThing=outputOSC.things["color"];
    
    console.log("osc print",outputOSC);
}
module.exports=OSoundControl;