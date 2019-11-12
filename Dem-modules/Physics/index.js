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
 * module that produces physics-related things for more naturally sounding patterns
*/
class Physics {
    /**
        @param {Polimod} environment
        @param {{ matrix: { operation: String; }[]; host: { address: any; }; }} properties
    */
    constructor(properties, environment) {
        Base.call(this, properties, environment);
        let self = this;
        this.name = this.constructor.name + "" + instances;
        instances++;

        this.properties = {
            motion:{
                val:"none",
                options:["none","spinner","echo","water"],
            },
            output:{
                val:"copy",
                options:["copy","fixed"],
            },
            rate:{
                val:0,
                min:0,
                max:1,
            }
        };
    }
}
Physics.color=[255,0,127];
module.exports=Physics;