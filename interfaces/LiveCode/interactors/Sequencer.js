
const Generic=require("./Generic");
const EventMessage=require("../../../Polimod/datatypes/EventMessage");
const Sequencer=function(environment,controlledModule){
    let tweakables={};
    let self=this;
    Generic.call(this,environment,controlledModule);
    updateAvailableProperties();
    let superApplyProperties=this.applyProperties;
    this.applyProperties=function(properties){
        superApplyProperties(properties);
        if(properties.sequence){
            console.log("sequence defined as "+properties.sequence);
            for(let charNumber in properties.sequence){
                let char=properties.sequence.charAt(charNumber);
                if(char=="-"||char==" "){

                }else{
                    let selectedSequencerEvent={
                        on:new EventMessage([EventMessage.headers.triggerOn,60,0,100]),
                        off:new EventMessage([EventMessage.headers.triggerOff,60,0,100]),
                        length:1,
                    }
        
                    controlledModule.storeNoDup(charNumber,selectedSequencerEvent);  
                }
            }
        }
    }
    
    function updateAvailableProperties(){
        for(let propertyName in controlledModule.properties){
            if(!tweakables[propertyName]){
                console.log("new property",propertyName);
                tweakables[propertyName]=new CurrentValueTracker(
                    controlledModule.properties,
                    controlledModule.properties[propertyName],
                    propertyName
                );
            };
        }
    }
}
module.exports=Sequencer;