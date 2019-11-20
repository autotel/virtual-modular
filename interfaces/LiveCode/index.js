/*
idea sketch for live coding.
Problems: 
* it needs special application of parameters for most parameters on most modules (for example changing sequence or midi output)
    * wouldnt it be better to delete and re-create the module every time? I would need to make a way to define what should remain (such as sequencer current step)
* the case of the sequencer pats:
    * I can do seq1.sequence:{evm0:[..], pat0:....} but I cannot do seq1.sequence.evm0:[...], under the current system
* stuff happening with comments 
* it just dies if there is syntax error
* compiling takes long and it skips a beat. should do it more async? like scheduling stuff..?


in the same way that for calculeitor each module has an intereactor, livecode also has to assign interactors to the different modules.
* the itneractors are used to update the values written in the livecode, without having to re-instance the module
* there is a generic interactor that addresses most cases. ACtually I could start homogenizing how the module properties work so that they are easier to deal with, in this way too, the generic interactor will serve more and more modules.
* a interactor can extend the generic interactor, so that the module updates in a generic way but also has some special ways of updating, say, the sequence; etc.
*/


const EventMessage = require('../../Polimod/datatypes/EventMessage');
const fs = require("fs");

// const specialValues={
//     ClockGenerator:{
//         "bpm":function(subject,val){
//             subject.bpm(val);
//         },
//         "interval":function(subject,val){
//             subject.interval(val);
//         },
//     },
//     Sequencer:{
//         "length":function(subject,val){
//             subject.loopLength.value=val;
//         },
//         "sequence":function(subject,val){
//             for(let step in subject.patData){
//                 subject.patData[step]=[];
//             }
//             // console.log("would make special application of ",val);
//             let declValues={};
//             for(var item in val){
//                 let typeParts=item.match(/([a-z]*)(\d*)/);
//                 let value=val[item];
//                 let type=typeParts[1];
//                 let id=typeParts[2];
//                 if(type=="pat"){
//                     // console.log("type",type);
//                     //ssequence the graphic pattern using declValues[id]
//                     let currentEventMessage=declValues[id];
//                     if(currentEventMessage){
//                         // console.log("defined!");
//                         let stepN=0;
//                         let stepBeingAdded;
//                         function reLinkStep(){
//                             stepBeingAdded={
//                                 on:currentEventMessage,
//                                 stepLength:1
//                             }
//                             if(currentEventMessage.value[0]==EventMessage.headers.triggerOn){
//                                 stepBeingAdded.off=new EventMessage(currentEventMessage);
//                                 stepBeingAdded.off.value[0]=EventMessage.headers.triggerOff;
//                             }
//                         }
//                         reLinkStep();
//                         for(stepVal of value){
//                             if(!isNaN(parseInt(stepVal))){
//                                 //is number, use same note definition but chaging "number"
//                                 stepBeingAdded.on.value[1]=parseInt(stepVal);
//                                 if(stepBeingAdded.off)
//                                     stepBeingAdded.off.value[1]=parseInt(stepVal);
//                             }else if(stepVal=="x"){
//                                 //use the same step definition
//                                 reLinkStep();
//                                 subject.storeNoDup(stepN,stepBeingAdded);
//                             }else if(stepVal=="-"){
//                                 //extends current note length
//                                 stepBeingAdded.stepLength++;
//                             }else if(stepVal==" "){
//                                 //silence.
//                                 reLinkStep();
//                             } if(stepVal=="r"){
//                                 //make it wrap around, repeat
//                             }
//                             stepN++;//TODO: make sequence length to longest definition in the sequencer
//                         }
//                         // console.log(subject.patData)
//                     }
//                 }else if(type=="evm"){
//                     // console.log("type",type);
//                     //defining one step with an event message
//                     //transform strings into ints, or/and
//                     //use EventMessage.headers to translate header names into numbners
//                     //then new EventMEssage({val:transformed thing})
//                     //store EvMessage into declValues[id]
//                     let vals=[... value];//copy, not ref
//                     if(EventMessage.headers[value[0]]!==undefined){
//                         // console.log("is header name");
//                         //TODO: synonyms.
//                         vals[0]=EventMessage.headers[value[0]];
//                     }
//                     let eventMessage=new EventMessage({value:vals});
//                     declValues[id]=eventMessage;
//                 }
//             }
//         }
//     }
// };
// const resetModule=function(subject){
//     subject.outputs.forEach((op)=>{
//         subject.outputs.delete(op);
//     });
// }
// const applyProperty=function(subject, propName, value){
//     let access=propName.split(".");
//     if(
//         specialValues[subject.constructor.name]
//         &&specialValues[subject.constructor.name][propName]
//     ){
//         //dedicated property assignator
//         specialValues[subject.constructor.name][propName](subject,value);
//     }else{
//         //default property assicnator
//         while(access.length){
//             let propName=access.shift();
//             if(!subject[propName])subject[propName]={};
//             if(access.length==0){
//                 subject[propName]=value;
//             }else{
//                 subject=subject[propName];
//             }
//         }
//     }
// }
//TODO: this is not going to work yet:
// environment.interfaces.list.livecoding.interactors is not set
// also is not trying to use Generic interactor as fallback... 
// i thought I implemented this for Calculeitor, which is where I copied this from...
var LiveCode = function (environment) {
    function tryGetInteractorOf(subject) {
        if (subject.interactors && subject.interactors.liveCoding) {
            console.log("interactor exists");
            return subject.interactors.liveCoding;
        } else if (environment.interfaces.list.liveCoding) {
            console.log(subject.constructor.name + " interactor not instanced yet");
            let InteractorConstructor = environment.interfaces.list.liveCoding.interactors.tryGet(subject.constructor.name);
            if (InteractorConstructor) {
                console.log({ InteractorConstructor });
                subject.interactors.liveCoding = new InteractorConstructor(environment, subject);
                console.log(subject.interactors.liveCoding.constructor.name);
                return subject.interactors.liveCoding;
            }
        }
        // console.log(environment.interfaces);
        return false;
    }
    function print(...vals) {
        console.log(">>", ...vals, process.hrtime());
    }
    let ModString = environment.datatypes.requires("ModString");
    const createdModules = {}
    /** e.g.{"moduleA->moduleB":[moduleA,moduleB]} = moduleA->moduleB */
    const connectedList={};
    function deltaRead(modScript) {
        //parse and apply string value
        //only what is different from the current environment state is applied
        let actionsList = false;
        try {
            actionsList = ModString.parse(modScript);
        } catch (e) {
            console.error("syntax error:");
            console.log("  expected", e.expected);
            console.log("  but \"", e.found, "\" found");
            console.log(e.location);
            return;
        }
        let lastPosition = 0;
        let stillExistingModuleNames = [];
        let stillExistingConnections = {};
        for (let actionItm of actionsList) {
            try {
                let action = actionItm[0]
                console.log(actionItm);
                if (action == "define") {
                    let names = Object.keys(actionItm[1])
                    for (let itemName of names) {
                        stillExistingModuleNames.push[itemName];
                        let access = itemName.split(".");
                        if (access.length > 1) {
                            let rootName = access.shift();
                            let current = createdModules[rootName];
                            let value = actionItm[1][itemName];
                            let accessString = access.join(".");
                            print("~", accessString, "=", value);

                            if (!current) {
                                console.log("module called", rootName, "doesnt exist", Object.keys(createdModules));
                            }

                            console.log("get module's constructor name", current.constructor.name)
                            let interactor=tryGetInteractorOf(current);
                            if(interactor){
                                interactor.applyProperty(accessString, value);
                            }

                        } else {
                            let newItemProperties = actionItm[1][itemName];
                            if (!newItemProperties.type) {
                                // print("!","no type property, I don't know what to do."); 
                                newItemProperties = { type: newItemProperties };
                                // continue;
                            }
                            let Constructor = environment.moduleConstructors.list[newItemProperties.type]
                            if (!Constructor) { print("!", newItemProperties.type + "  constructor for the type was not found."); continue }
                            if (createdModules[itemName]) {
                                print("(skip)", itemName, "item already exists");
                                //if the continue is uncommented, then the creation variables are only applied once the module is created. Is that good?
                                //continue;
                            } else {
                                newItemProperties.name = itemName;
                                createdModules[itemName] = new Constructor({ name: itemName }, environment);
                            }
                            for (var propName in newItemProperties) {
                                let interactor=tryGetInteractorOf(createdModules[itemName]);
                                if(interactor){
                                    interactor.applyProperty(propName, newItemProperties[propName]);
                                }
                            }
                            print("+", itemName);
                        }
                    }
                } else if (action == "connect") {
                    let subjectModule = createdModules[actionItm[1]];
                    let destModule = createdModules[actionItm[2]];

                    stillExistingConnections[actionItm[1]+"->"+actionItm[2]]=[subjectModule,destModule];
                    connectedList[actionItm[1]+"->"+actionItm[2]]=[subjectModule,destModule];

                    // console.log(Object.keys(subjectModule));
                    if (subjectModule && destModule) {
                        if (subjectModule.outputs.has(destModule)) {
                            print("(skip)", subjectModule.name, "-->", destModule.name);
                        } else {
                            subjectModule.addOutput(destModule);
                            print(subjectModule.name, "-->", destModule.name);
                        }

                    } else {
                        print("! cannot connect nonexistent module, skipping", {
                            "name of one": actionItm[1].name, "name of two": actionItm[2].name, "list": Object.keys(createdModules)
                        })
                        continue
                    }

                }
            } catch (e) {
                console.warn("  action failed", e);
            }
        }
        //remove what does not remain
        for (let connectionIdentity in connectedList){
            if(!stillExistingConnections[connectionIdentity]){
                let con=stillExistingConnections[connectionIdentity];
                con[0].removeOutput(con[1]);
                console.log(con[0].name,"-X->",con[1].name);
            }
        }
        for (let moduleName in createdModules) {
            if (stillExistingModuleNames.indexOf(moduleName) == 0) {
                //TODO: but other itneractors will not get that module deleted!
                console.log("delete " + moduleName);
                createdModules[moduleName].remove();
                delete createdModules[moduleName];
            }
        }
    }
    this.setFile = function (filename) {
        let ch = () => { fs.readFile(filename, 'utf8', (err, val) => err ? err : deltaRead(val)); }
        fs.exists(filename, does => {
            if (does) {
                ch();
                fs.watch(filename, ch);
            } else {
                console.warn("could not perform setFile(" + filename + "); it does not exist");
            }
        });
    }
    this.setStream = function (stream) {
        //when stream pipes, 
        // read(value);
    }
}
module.exports = LiveCode;
