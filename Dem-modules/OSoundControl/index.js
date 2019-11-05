const Base= require("../Base.js");
let instances=0;

const OSoundControl=function(properties,environment){
    let singletonOutputOsc=environment.plugins.requires("Oscio");
    Base.call(this,properties,environment);
    let self=this;
    this.name=this.constructor.name+""+instances;
    instances++;
    this.category="output";
    this.color=[125,125,125];
    this.controlledThing=singletonOutputOsc.things["color"];
    
    console.log("osc print",singletonOutputOsc);
}
module.exports=OSoundControl;