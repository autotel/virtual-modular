/*Calculeitor interactor entry point */
const interactors={
    // Base:require('./Base'),
    SuperInteractor:require('./SuperInteractor'),
    Sequencer:require('./Sequencer'),
}
module.exports=function(environment){
    environment.interfaces.whenAvailable("calculeitors",function(calculeitors){
        console.log("calculeitors became available");
        calculeitors.on('+hardware',function(event){
            const hardware=event.controller;
            hardware.interactor=new interactors.SuperInteractor(environment,hardware);
            if(event.type=="x28v2"){
                console.log("new calculeitor connected");
                hardware.engageControllerMode().then(console.log).catch(console.error);
            }else{
                console.log("hardware not recognized as calculeitor",event.type);
            }
        });
    });
}