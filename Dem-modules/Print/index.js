const Base= require("../Base.js");
let instances=0;
const Print=function(properties,environment){
    this.preventBus=true;
    let self=this;
    Base.call(this,properties,environment);
    this.properties={
        active:{
            value:false
        }
    }
    this.category="utility";
    this.recordingReceived = function(event) {
        if(!properties.active.value) return;
        var evM = event.eventMessage;
        console.log(">>rec:",evM.value);
    }
    this.messageReceived = function(event) {
        if(!self.properties.active.value) return;
        var evM = event.eventMessage;
        console.log(">>evm:",evM.value);
    }

}
Print.color=[127,127,127];
module.exports=Print;