const availableInteractors={
    Generic:require("./Generic"),
    Sequencer:require("./Sequencer"),
}
const LiveCodeInteractorsManager=function(environment,parentLiveCode){
    this.tryGetInteractorOf=function(subject){
        console.log("liveCode: try get interactor of ",subject.name);

        if (subject.interactors && subject.interactors.liveCoding) {
            console.log("   interactor exists");
            return subject.interactors.liveCoding;
        } else if (environment.interfaces.list.liveCoding) {
            console.log(subject.constructor.name + "    interactor not instanced yet");
            let InteractorConstructor = availableInteractors[subject.constructor.name];
            if (InteractorConstructor===undefined){
                InteractorConstructor=availableInteractors["Generic"];
            }
            if (InteractorConstructor!==undefined) {
                subject.interactors.liveCoding = new InteractorConstructor(environment, subject);
                console.log("       using ",subject.interactors.liveCoding.constructor.name+" interactor");
                return subject.interactors.liveCoding;
            }
        }
        console.log(environment.interfaces.list);
        return false;
    }

    environment.interfaces.whenAvailable("liveCode",function(liveCode){
        console.log("liveCode became available");
        
    });
}
module.exports=LiveCodeInteractorsManager;