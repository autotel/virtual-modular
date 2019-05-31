let SuperInteractor=function(environment,hardware){
    this.engage=function(){
        hardware.reset();
        console.log("launchpad engaged");
        hardware.on( 'key', console.log);
    }
}
module.exports={
    SuperInteractor,
}
