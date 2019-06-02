const Launchpad = require( 'launchpad-mini' );
const interactors=require('./interactors');
const onHandlers=require('onhandlers');
const u=require("./utils");

module.exports=function(environment){
    let EnvResource=environment.datatypes.requires("EnvResource");
    this.interactors=interactors;
    this.globals={};
    onHandlers.call(this);
    environment.interfaces.add({
        launchpads:this
    });
    //TODO: being able to connect more than one
    let hardware = new Launchpad();
    hardware.connect().then(()=>{
        let pressedButtons=new Set();
        hardware.on( 'key', k => {
            if(k.pressed){
                pressedButtons.add(k[0]+","+k[1]);
            }else{
                pressedButtons.delete(k[0]+","+k[1]);
            }
            if(pressedButtons.size>1){
                k.chained=true;
                console.log("chained");
            }
            k.hardware=hardware;
            u.appendPos(k);
            // if(k[0]==8 || k[1]==8){
            //     k.buttonType="selector"
            // }else{
            //     k.buttonType="matrix"
            // }
        });
        console.log("request engage");
        let superInt=new interactors.list.SuperInteractor(environment,hardware);
        superInt.engage();
    });
}