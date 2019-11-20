//TODO: signal when a module is deleted, and also check that calculeitor superinteractor removes deleted modules from the interface

const onHandlers=require('onhandlers');
const EventMessage = require('../../Polimod/datatypes/EventMessage');
const fs = require("fs");
const LiveCodeInteractorsManager=require("./interactors");
const dotAccess=require("./utils/dotAccess");
//TODO: this is not going to work yet:
// environment.interfaces.list.livecoding.interactors is not set
// also is not trying to use Generic interactor as fallback... 
// i thought I implemented this for Calculeitor, which is where I copied this from...
var LiveCode = function (environment) {
    onHandlers.call(this);
    const interactorsManager=new LiveCodeInteractorsManager(environment);
    function print(...vals) {
        console.log(">>", ...vals, process.hrtime());
    }
    environment.utils.add({dotAccess});
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
        if(actionsList) for (let actionItm of actionsList) {
            try {
                let actionType=actionItm[0];
                let actionArgs=actionItm[1];
                console.log("actionItm",actionItm);
                if (actionType == "define") {
                    console.log("LiveCode define",actionArgs);
                    for (let itemName in actionArgs) {
                        let itemProperties=actionArgs[itemName];
                        console.log("LiveCode define",itemName,itemProperties);

                        
                        if (!itemProperties.type) {
                            print("!","no type property, not creating."); 
                        }else{
                            print("module definition",itemProperties);
                            let Constructor = environment.moduleConstructors.list[itemProperties.type]
                            if (!Constructor) {
                                print(" !", itemProperties.type + "  constructor for the type was not found."); continue 
                            }
                            if (createdModules[itemName]) {
                                print(" (skip)", itemName, "item already exists");
                                stillExistingModuleNames.push[itemName];
                                itemProperties.name = itemName;
                            }else{
                                print(" module "+itemName+" is new");
                                createdModules[itemName] = new Constructor(itemProperties, environment);
                            }
                        }
                        console.log("dotaccess",createdModules,itemName);
                        let moduleAccess=dotAccess(createdModules,itemName);
                        let subjectModule=moduleAccess.oneLevelDown();
                        if(!subjectModule) console.warn("subject module is ",subjectModule);
                        let interactor=interactorsManager.tryGetInteractorOf(subjectModule);

                        if(interactor){
                            let props={}
                            interactor.applyProperties(itemProperties);
                            print("~", itemName);
                        }
                        
                    }
                } else if (actionType == "connect") {
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
                            "name of one": actionItm[1], "name of two": actionItm[2], "list": Object.keys(createdModules)
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
                let con=connectedList[connectionIdentity];
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
    console.log("liveCode added");
    environment.interfaces.add({"liveCoding":this});
}
module.exports = LiveCode;
