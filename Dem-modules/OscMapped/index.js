const Base= require("../Base.js");
let instances=0;
//this import is just for type checking
let Polimod=require("../../Polimod");
class Operation{
    constructor(){}
}
Operation.fromString=function(string){
    return new Operation();
}
/**
    module that outputs a particular OSC address for each different signal received
    
    64 mapeable outputs (16mx buttons*4 pages)
    * each button is an output
    * each button can be associated to an OSC address
    * each button has n parameters
    * each parameter can either be hard-coded or equal to one of the incoming values
    * each button can have a name (well, it appears from the OscVariable deduction from address to name)
    file loading utility
    * load different mapping files, help having friendly names to things
    * need to change OSC plugin so that the file can define a new udp  address:port. it can also be defined as "transparent"
    can also receive OSC, which gets propagated to the output using the reverse operations
    
    selector for whether it %'s overflown numbers, or ignores them

*/
class OscMapped {
    /**
        @param {Polimod} environment
        @param {{ matrix: { operation: String; }[]; host: { address: any; }; }} properties
    */
    constructor(properties, environment) {
        let singletonOutputOsc = environment.plugins.requires("Oscio");
        const OscVariable = environment.datatypes.requires("OscVariable");
        Base.call(this, properties, environment);
        let self = this;
        this.name = this.constructor.name + "" + instances;
        instances++;
        this.category = "output";
        this.color = [125, 125, 125];
        this.controllableVariables = {
            "red": new OscVariable("/colors/red", [{ type: "f" }]),
            "green": new OscVariable("/colors/green", [{ type: "f" }]),
            "blue": new OscVariable("/colors/blue", [{ type: "f" }]),
        };
        console.log("osc print", singletonOutputOsc);
    }
}
module.exports=OscMapped;