const Base= require("../Base.js");
let instances=0;
//this import is just for type checking
let Polimod=require("../../Polimod");
function getTypeCharOf(thing){
    let typeOfThing=typeof thing;
    if(typeOfThing == "number"){
        return "f";
    }else if(typeOfThing == "boolean"){
        return "b";
    }else if(!isNaN(parseFloat(thing))){
        return "f";
    }else{
        return "s";
    }
}
function getTypePropertyOf(thing){
    if(typeof thing=="object"){
        if(thing.type) return thing.type;
        if(thing.value) return getTypeCharOf(thing.value);
        if(thing.val) return getTypeCharOf(thing.val);
    }
    return getTypeCharOf(thing);
}
function getValueOf(thing){
    if(typeof thing==="object"){
        if(thing.value!==undefined) return thing.value;
        if(thing.val!==undefined) return thing.val;
    }
    return thing;
}
function makeOscPath(string){
    string=""+string;
    if(string[0]!=="/") return "/"+string;
    return string;
}

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
    if(properties.name) this.name=properties.name;
    instances++;
    this.category="output";
    this.properties=[];

    if(!properties.knobs){
        this.properties={
            "attack":new OscVariable("/"+this.name+"/attack",[{type:"f"}]),
            "decay":new OscVariable("/"+this.name+"/decay",[{type:"f"}]),
            "sustain":new OscVariable("/"+this.name+"/sustain",[{type:"f"}]),
            "release":new OscVariable("/"+this.name+"/release",[{type:"f"}]),
            "filter q":new OscVariable("/"+this.name+"/filter/q",[{type:"f"}]),
            "filter f":new OscVariable("/"+this.name+"/filter/f",[{type:"f"}]),
            "filter mod":new OscVariable("/"+this.name+"/filter/mod",[{type:"f"}]),
            "filter wet":new OscVariable("/"+this.name+"/filter/wet",[{type:"f"}]),
            "timbre":new OscVariable("/"+this.name+"/timbre",[{type:"f"},{type:"f"},{type:"f"},{type:"f"}]),
        }
    }else{
        for(let key in properties.knobs){
            this.properties[key]=convertToOscVariable(key,properties.knobs[key]);
        }
    }

    function convertToOscVariable(path,thing){
        let varProps = [];
        
        if(Array.isArray(thing)){
            for(let subthing of thing){
                varProps.push({
                    type:getTypePropertyOf(subthing),
                    value:getValueOf(subthing),
                });
            }
        }else{
            varProps.push({
                type:getTypePropertyOf(thing),
                value:getValueOf(thing),
            });
        }
        return new OscVariable(makeOscPath(path),varProps);
    }
    
}
OscKnobs.color=[125,125,125];
module.exports=OscKnobs;