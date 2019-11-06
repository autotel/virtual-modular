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
/**
    @typedef {{value:any,type:String}} arg 
*/

let globalSendFunction=function(address,args){
    console.log("OSC not connected yet");
}

module.exports=function(environment){
    let self=this;
    
    console.log("initializing Oscio");
    let OSC=new(function(){
        this.isConnected=false;
        // When the port is read, send an OSC message to, say, SuperCollider
        udpPort.on("ready", function () {
            this.isConnected=true;
            /**
                @param {String} address
                @param {Array<arg>} args
            */
            globalSendFunction=function(address,args){
                udpPort.send({
                    address:address,
                    args
                }, "127.0.0.1", 9997);
            }
        });

        return this;
    })();

    environment.plugins.add({
        Oscio:OSC
    });

    /**
        Representation of a variable to be sent to osc. In this way it is possible to create a structure in the way that might be expected on a synth or external program.
    */
    class OscVariable{
        argTypes=["i","s","f"]
        /**
            list of arguments that are potentially sent to osc.
            @type {Array<arg>}
        */
        args=[];
        
        /**
         * @param {string} address
         * @param {Array<arg>?} optArguments
         */
        constructor (address,optArguments){
            this.name=address.split("/").pop();
            this.address=address;
            if( address.charAt(0) !="/") console.warn("created OscVariable whose address doesn't start with '/' character. Errors may ocurr when sending.");
            if(optArguments) for(let a in optArguments){
                this.addArg(optArguments[a]);
            }
        }
        /**
            @param {Array<arg>} args can be omitted, but it must be an array containing values.
            @example 'sendUpdate([5,false,33]);'
            @example 'sendUpdate();'
            types are not checked for the sake of speed. the behavior of type violation with respect to the osc definition is undefined.
            If more args are provided than the quantity added to the OscVariable, they are omitted. 
        */
        sendUpdate=function(args){
            let count=0;
            if(args) for(let thisArgument of args){
                this.args[count].value=thisArgument;
                count++;
                if(count>=this.args.length) break;
            }
            globalSendFunction(this.address,this.args);
        }
        /**
         * @example addArg({value:1,type:"f"});
         * @param {{ value: any|undefined; type: String|undefined; }} argProperties
         */
        addArg(argProperties){
            let narg={
                type:this.argTypes[0],
                value:0,
            }
            if(argProperties){
                if(argProperties.type!==undefined) narg.type=argProperties.type;
                if(argProperties.value!==undefined) narg.value=argProperties.value;
            }
            this.args.push(narg);
        }
    }
    environment.datatypes.add({
        OscVariable
    });
};

