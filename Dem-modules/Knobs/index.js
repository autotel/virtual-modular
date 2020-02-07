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
const Knobs=function(properties,environment){
    this.preventBus=true;
    Base.call(this,properties,environment);    
    let self=this;
    this.name=this.constructor.name+""+instances;
    if(properties.name) this.name=properties.name;
    instances++;
    this.category="output"; 
    this.properties={};
    this.knobs={};
    let EventMessage=environment.datatypes.requires("EventMessage");
    function forceInt(val){
        val=parseInt(val);
        if(isNaN(val)) return 0;
        return val;
    }
    const addMidiKnob=function(controlNumber,value){
        value=forceInt(value);
        controlNumber=forceInt(controlNumber);
        return function(newValue){
            if(newValue!==undefined){
                value=newValue;
                self.output(new EventMessage([
                    EventMessage.headers.changeRate,
                    controlNumber,//number
                    self.properties.timbreNo,//channel
                    value
                ]));
            }
            /*if (eventMessage.value[0] == headers.changeRate) {
                midiOut[0] = 0xB0 | (0x0F & eventMessage.value[2]); //cc channel
                midiOut[1] = eventMessage.value[1]; //is the controller number.
                midiOut[2] = eventMessage.value[3]; //is the value
            }*/
            return value;
        }
    }

    
    this.properties.timbreNo={
        value: properties.timbreNo||0,
        options:properties.timbreNames||[
            "Piano 1",
            "Piano 2",
            "Piano 3",
            "Piano 4",
            "Piano 5",
            "Piano 6",
            "Piano 7",
            "Piano 8",
            "Piano 9",
            "Percussion 10",
            "Percussion 11",
            "Percussion 12",
            "Percussion 13",
            "Percussion 14",
            "Percussion 15",
            "Percussion 16",
        ],
    }
    // this.properties.touch={
    //     value: properties.touch||false,
    // }
    if(!properties.knobs){
        properties.knobs={
            "attack":[73,0],
            "decay":[75,0],
            "sustain":[76,0],
            "release":[77,0],
            "filter q":[71,0],
            "filter f":[74,0],
            "filter envelope":[75,0],
            "filter wet":[76,0],
            "timbre":[70,0],
            "volume":[7,0],
            "effect wet":[91,0],
        }
    }
    for(let key in properties.knobs){
        self.knobs[key]=addMidiKnob(... properties.knobs[key]);
    }
    
    
}
Knobs.color=[125,125,125];
module.exports=Knobs;