var osc = require("osc");


// // Create an osc.js UDP Port listening on port 57121.
var udpPort = new osc.UDPPort({
    localAddress: "0.0.0.0",
    localPort: 9995,
    metadata: true
});

//for input:
// // Listen for incoming OSC bundles.
// udpPort.on("bundle", function (oscBundle, timeTag, info) {
//     console.log("An OSC bundle just arrived for time tag", timeTag, ":", oscBundle);
//     console.log("Remote info is: ", info);
// });

// Open the socket.
udpPort.open();


let globalSendFunction=function(address,type,value){
    console.log("OSC not connected yet");
}

const Thing=function(name){//an Address...
    let self=this;
    this.name=name;
    this.args={}
    this.address="/"+name
    this.addArg=function(argname){
        let narg=new Arg(argname,this.address);
        self.args[argname]=narg;
        return narg;
    }
}

const Arg=function(name,address){
    this.name=name;
    this.types=["i","s","f"]
    this.type="f",
    this.value=0;
    this.sendUpdate=function(){
        globalSendFunction(address+"/"+name,this.type,this.value);
    }
}

module.exports=(function(){
    this.things={}
    let color=new Thing("color");
    let sound=new Thing("sound");
    let sample=new Thing("Sample");

    color.addArg("red");
    color.addArg("green");
    color.addArg("blue");

    sound.addArg("shape");
    sound.addArg("volume");
    sound.addArg("tone");
    
    sample.addArg("start");
    sample.addArg("volume");
    sample.addArg("release");
    
    this.things["color"]=color;
    this.things["sound"]=sound;
    this.things["sample"]=sample;

    // When the port is read, send an OSC message to, say, SuperCollider
    udpPort.on("ready", function () {
        globalSendFunction=function(address,type,value){
            udpPort.send({
                address: address,
                args: [{type,value}]
            }, "127.0.0.1", 9997);
        }
    });

    return this;
})();