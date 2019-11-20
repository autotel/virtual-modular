const Base= require("../Base.js");
let instances=0;
//this import is just for type checking
let Polimod=require("../../Polimod");

/**
    @param {object} properties
    @param {Polimod} environment
*/
const OscKnobs=function(properties,environment){
    let singletonOutputOsc=environment.plugins.requires("Oscio");
    const OscVariable=environment.datatypes.requires("OscVariable");
    this.preventBus=true;
    Base.call(this,properties,environment);    
    let self=this;
    this.name=this.constructor.name+""+instances;
    instances++;
    this.category="output";
    this.controllableVariables={
        "red":new OscVariable("/colors/red",[{type:"f"}]),
        "green":new OscVariable("/colors/green",[{type:"f"}]),
        "blue":new OscVariable("/colors/blue",[{type:"f"}]),
    }
    
    console.log("osc print",singletonOutputOsc);
}
OscKnobs.color=[125,125,125];
module.exports=OscKnobs;