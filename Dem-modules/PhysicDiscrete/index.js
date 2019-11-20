const Base= require("../Base.js");
let instances=0;
//this import is just for type checking
let Polimod=require("../../Polimod");
let EventMessage=require("../../Polimod/datatypes/EventMessage");

/**
 * module that produces PhysicDiscrete-related things for more naturally sounding patterns
 * discrete means that it produces discrete events. In the future there might be a continuous one to use with sound parameters?
 */
class PhysicDiscrete {
    preventBus=true;
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
                current:0,
                options:["none","spinner","echo","water"],
            },
            output:{
                val:"copy",
                current:0,
                options:["copy","fixed"],
            },
            rate:{
                val:1,
                min:0,
                step:1/64
            },
            diffusion:{
                val:-4,
                step:1,
                min:-512,
                max:-1,
            },
            //todo: reflect that affectValue=0 means disabled
            affectValue:{
                step:1,//shouldn't be here, but it lets us use Generic for now.
                val:3,
                min:0,
                max:3,
            },
            maxRepetitions:{
                step:1,//shouldn't be here, but it lets us use Generic for now.
                val:10,
                min:-1,
                max:127,
            },
            excludeClock:{
                val:true,
            },
        };
        if(properties.motion){
            this.properties.motion.val=properties.motion;
        }
        if(properties.output){
            this.properties.output.val=properties.output;
        }
        if(properties.rate){
            this.properties.rate.val=parseFloat(properties.rate);
        }
        if(properties.diffusion){
            this.properties.diffusion.val=parseInt(properties.diffusion);
        }
        if(properties.affectValue){
            this.properties.affectValue.val=parseInt(properties.affectValue);
        }
        if(properties.maxRepetition){
            this.properties.maxRepetitions.val=parseInt(properties.maxRepetition);
        }
        if(properties.excludeClock){
            this.properties.excludeClock.val=properties.excludeClock=="true";
        }
        function property(name){
            return self.properties[name].val;
        }
        function triggerParticle(props,cumulativeValue){
            let motion=property("motion");
            if(motion=="none") return;
            let maxReps=property("maxRepetitions");
            if(maxReps!==-1 && cumulativeValue>maxReps) return;

            let affectValue=property("affectValue");
            let decremental=property("diffusion");
            let rate=property("rate");
            
            let nextInterval;
            if(motion=="echo")  nextInterval=50*rate*rate;
            if(motion=="spinner")  nextInterval=10*rate*rate*cumulativeValue;
            if(motion=="water") nextInterval=100*rate*rate*Math.random();

            if(props[affectValue]<=0) return;
            // console.log("time:",nextInterval);
            let NextFn=function(props,cumulativeValue){
                let self=this;
                this.propsCopy=props.slice()
                this.cuv=cumulativeValue+1
                this.g=function(){
                    self.propsCopy[affectValue]+=decremental;
                    triggerParticle(self.propsCopy,self.cuv);
                }
            };
            
            setTimeout(new NextFn(props,cumulativeValue).g,nextInterval)
            self.output(new EventMessage(props));
        }

        this.recordingReceived = function(event) {
            var evM = event.eventMessage;
            //TODO:should I propagate "recs" "up"?
            let props=evM.value;
            props.shift();

            let affectValue=property("affectValue");
            triggerParticle(props,props[affectValue]);
        }

        this.messageReceived = function(event) {
            var evM = event.eventMessage;
            let props=evM.value;
            if((!props[0]) && self.properties.excludeClock.val) return;
            let affectValue=property("affectValue");
            if(isNaN(props[affectValue])){
                self.properties.affectValue.val=1;
            }
            triggerParticle(props,0);
        }
    }
}
PhysicDiscrete.color=[255,0,127];
module.exports=PhysicDiscrete;