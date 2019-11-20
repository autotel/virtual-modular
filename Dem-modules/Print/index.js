const Base= require("../Base.js");
let instances=0;
const Print=function(properties,environment){
    this.preventBus=true;
    Base.call(this,properties,environment);
    this.category="utility";
    this.recordingReceived = function(event) {
        var evM = event.eventMessage;
        console.log(">>rec:",evM.value);
    }
    this.messageReceived = function(event) {
        var evM = event.eventMessage;
        console.log(">>evm:",evM.value);
    }

}
Print.color=[127,127,127];
module.exports=Print;