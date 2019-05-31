const Launchpad = require( 'launchpad-mini' );
const interactors=require("./interactors");

module.exports=function(environment){
    //TODO: how about being able to connect more than one?
    let hardware = new Launchpad();
    hardware.connect().then(()=>{
        let superInt=new interactors.SuperInteractor(environment,hardware);
        superInt.engage();
    });
}