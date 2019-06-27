const u=require("../utils");
const display=(...lets)=>{
    console.log("Launchpad >>",...lets);
}

let sName={
    up:0,
    down:1,
    left:2,
    right:3,
    session:4,
    user1:5,
    user2:6,
    mixer:7,
    volume:8,
    pan:9,
    sendA:10,
    sendB:11,
    stop:12,
    mute:13,
    solo:14,
    recordArm:15
}
let SuperInteractor=function(environment,hardware){
    const self=this;
    const hasParent=this.hasParent?true:false;
    let engagedInteractor=self;
    let selectedModule=false;
    //TODO:actually use the two coords.
    let currentScroll={x:0,y:0}
    let inputsMode=false;
    let muteMode=false;
    let deleteMode=false;
    let engageSelectedOnRelease=true;
    let buttonPressOwners={};
    const launchpadGlobals=environment.interfaces.list.launchpads.globals;
    if(!launchpadGlobals.modulePositions)launchpadGlobals.modulePositions=[];
    const modulePositions=launchpadGlobals.modulePositions;
    function buttonToPosition(button){
        return button+currentScroll.y*4;
    }
    function positionToButton(position){
        return position-currentScroll.y*4;
    }
    function tryGetInteractorOf(subject){
        if(subject.interactors && subject.interactors.launchpad){
            console.log("interactor exists");
            return subject.interactors.launchpad;
        }else if(environment.interfaces.list.launchpads){
            console.log(subject.constructor.name+" interactor not instanced yet");
            let InteractorConstructor=environment.interfaces.list.launchpads.interactors.tryGet(subject.constructor.name);
            if(InteractorConstructor){
            console.log({InteractorConstructor});
            subject.interactors.launchpad=new InteractorConstructor(environment,subject);
            console.log(subject.interactors.launchpad.constructor.name);
            return subject.interactors.launchpad;
            }
        }
        // console.log(environment.interfaces);
        return false;
    }
    function tryGetModuleAtButton(button){
        console.log("Launchpad tryGetModuleAtbutton",button);
        return tryGetModuleAtPosition(buttonToPosition(button));
    }
    function tryGetModuleAtPosition(position){
        
        if(modulePositions[position]){
            if(modulePositions[position].length)
            return modulePositions[position][0];
        }
        return false;
    }
    function tryGetPositionOf(subject){
        for(var position in modulePositions){
            if(modulePositions[position].includes(subject)) return position;
        }
        return false;
    }
    function findEmptyPosition(minPos=0){
        
        for(let position=minPos; position<0xFFFFFFFF; position++){
            if(!modulePositions[position]||!modulePositions[position].length) return position;
        }
    }
    function detachModule(subject){
        for(var position in modulePositions){
            if(modulePositions[position].includes(subject)) {
            return modulePositions[position].splice(modulePositions[position].indexOf(subject),1);
            };
        }
        return false;
    }
    function relocateModule(subject,position){
        console.log("Launchpad Relocate Module",subject.name,position);
        let currentPosition=tryGetPositionOf(subject);
        //and just so the subject's interactor is created right away:
        tryGetInteractorOf(subject);
        if(currentPosition!==false){
            detachModule(subject);
        }
        if(!modulePositions[position]) modulePositions[position]=[];
        modulePositions[position].push(subject);
        return subject;
    }
    function updateSelectorButtons(){
        hardware.col(hardware.yellow, {0:8,1:8} );
        hardware.col(hardware.yellow, {0:7,1:8} );
        hardware.col(hardware.yellow, {0:6,1:8} );
    }
    function updateMatrixButtons(tries=0){
        // hardware.reset();
        /*
            hardware.red
            hardware.green
            hardware.amber
            hardware.yellow
            hardware.off
        */
       console.log("Launchpad update Matrix");
        let colSequence=[];
        for (let button = 0; button < 64; button++) {
            // let position = buttonToPosition(button);
            let bmodule = tryGetModuleAtPosition(button);
            // console.log(bmodule.name);
            colSequence[button]=hardware.off;
            if (bmodule) {
                // console.log({selectedModule:selectedModule.name,bmodule:bmodule.name});
                colSequence[button]=hardware.yellow;
                if(deleteMode && deleteMode.has(bmodule)){
                    colSequence[button] = hardware.amber;
                }else if(bmodule.mute && !deleteMode ){
                    colSequence[button] = hardware.amber;
                }else if(selectedModule==bmodule){
                    colSequence[button]=hardware.green;
                }else if(selectedModule && (inputsMode && selectedModule.inputs.has(bmodule))){
                    colSequence[button]=hardware.red;
                }else if(selectedModule && (!inputsMode && selectedModule.outputs.has(bmodule))){
                    colSequence[button]=hardware.red;
                }
            }
            hardware.col(colSequence[button],u.posToKey(button));
        }
    }
      
    hardware.on( 'key', event => {
        let dir=event.pressed?"Pressed":"Released";
        try{
            if(event.buttonType=="selector" && event.x==sName.mixer){
                self["selectorKey"+dir](event);
            }else{
                let evId=event.x+","+event.y;
                //buttonPressOwners have the objective of being able release a button even after having engaged into a different interactor.
                if(event.pressed){
                    if(!buttonPressOwners[evId])buttonPressOwners[evId]={};
                    buttonPressOwners[evId]=engagedInteractor;
                }
                if(!event.pressed && buttonPressOwners[evId]){
                    let dir=event.pressed?"Pressed":"Released";
                    buttonPressOwners[evId][event.buttonType+"Key"+dir](event);
                    delete buttonPressOwners[evId];
                }else{
                    let dir=event.pressed?"Pressed":"Released";
                    if(engagedInteractor[event.buttonType+"Key"+dir]) engagedInteractor[event.buttonType+"Key"+dir](event);
                }
            }

        }catch(e){
            console.error("engaged interactor "+engagedInteractor.name+"["+event.buttonType+"] function failed",e);
        }
    } );
    this.engage=function(){
        environment.modules.each((subject)=>{
            let position=tryGetPositionOf(subject);
            if(!position){
                relocateModule(subject,findEmptyPosition());
            }
        });
        updateMatrixButtons();
        
        engagedInteractor=self;
        console.log("launchpad engaged");
        // hardware.on( 'event', console.log);
    }
    environment.on('+module',(evt)=>{
        // console.log("super: + module",evt); 
        if(engagedInteractor==self) setImmediate(()=>{
            //setImmediate, so that module has all the properties. Otherwise "subject" is only a copy of Base.
            let subject=evt.module;
            let position=tryGetPositionOf(subject);
            if(!position){
                relocateModule(subject,findEmptyPosition());
                updateMatrixButtons()
            }
        });
    });
    environment.on('-module',()=>{
        if(engagedInteractor==self) setImmediate(()=>updateMatrixButtons());//setImmediate is a patch 
    });
    environment.on('~module',()=>{
        if(engagedInteractor==self) setImmediate(()=>updateMatrixButtons());//setImmediate is a patch 
    });
    this.matrixKeyPressed=function(event){
        let buttonModule=tryGetModuleAtButton(event.pos);
        let buttonPosition=buttonToPosition(event.pos);
        engageSelectedOnRelease=true;
        if(buttonModule){
            display("buttonModule:",buttonModule.name);
        }
        if(deleteMode){
            if(buttonModule){
                if(deleteMode.has(buttonModule)){
                    display("Don't delete");
                    deleteMode.delete(buttonModule);
                    buttonModule.mute=false;
                }else{
                    deleteMode.add(buttonModule)
                    buttonModule.mute=true;
                    display("To delete "+deleteMode.size);
                }
            }      
            updateMatrixButtons();
        }else if(muteMode){
            if(buttonModule){
                buttonModule.mute=!buttonModule.mute;
                display(buttonModule.mute?"Mute":"Unmute");
            }
            updateMatrixButtons();
        }else if(event.chained){
            //TODO: chained buttons
            if(selectedModule&&buttonModule){
                let connected=selectedModule.toggleOutput(buttonModule);
                display("Connect");
                display((selectedModule.name,7)+(connected ? "→" : "╳")+(buttonModule.name,8));
            }else if(selectedModule){
                relocateModule(selectedModule,buttonPosition);
                display("Moved module");
                display(selectedModule.name);
            }
            updateMatrixButtons();
        }else{
            selectedModule=buttonModule;
            if(selectedModule){
                updateMatrixButtons();
            }else{
                display("would engage module creator");
                // moduleCreator.engage(event,function(newModule){
                //     if(newModule) relocateModule(newModule,buttonPosition);
                //     engagedInteractor=self;
                //     updateMatrixButtons();
                //     updateSelectorButtons();
                //     display("Canceled")
                // });
                // engagedInteractor=moduleCreator;
            }
        }
    }
    this.matrixKeyReleased=function(event){
        
    }
    let selectorButtonsPressed=[];
    this.selectorKeyPressed=function(event){
        console.log("selector",event);
        selectorButtonsPressed[event.pos]=true;
        if(event.pos==sName.sendA){
            display("Watching inputs");
            inputsMode=true;
        }else if(event.pos==sName.mute){
            muteMode=true;
            display("Mute");
        }else if(event.pos==sName.stop){
            display("Delete");
            display("Press to select");
            deleteMode=new Set();
        }else if(event.pos==sName.mixer){
            if(engagedInteractor!==self){
                engagedInteractor.disengage(event);
                self.engage();
                engageSelectedOnRelease=false;
            }else{
                display("Open module: ",selectedModule.name);
                if(selectedModule){
                    engagedInteractor=tryGetInteractorOf(selectedModule);
                    engagedInteractor.engage(event);
                //     ioView.selectModule(selectedModule)
                //     ioView.engage(event);
                //     engagedInteractor=ioView;
                }
            }
        }else if(event.pos==sName.left){
            currentScroll.x--;
        }else if(event.pos==sName.right){
            currentScroll.x++;
        }else if(event.pos==sName.up){
            currentScroll.y++;
        }else if(event.pos==sName.down){
            currentScroll.y--;
        }else if(event.pos==sName.user1){
            encoderSim({delta:-1});
        } if(event.pos==sName.user2){
            encoderSim({delta:1});
        }
        if(engagedInteractor==self){
            updateSelectorButtons();
            updateMatrixButtons();
        }
    }
    function encoderSim(event){
        let selectedInterface=tryGetInteractorOf(selectedModule);
        if (selectedInterface) {
            if(selectedInterface.outsideScroll){
                let str = selectedInterface.outsideScroll(event);
                if (str) {
                display(str);
                }
            }
        } else {
            currentScroll+=event.delta;
            if(currentScroll<0)currentScroll=15;
            if(currentScroll>15)currentScroll=0;
            updateSelectorButtons();
            display("Page:"+currentScroll/4)
            updateMatrixButtons();
        }
    }
    this.selectorKeyReleased=function(event){
        selectorButtonsPressed[event.pos]=false;
        if(event.pos==sName.sendA && inputsMode){
          inputsMode=false;
        }else if(event.pos==sName.stop && deleteMode){
          deleteMode.forEach(delModule=>{
            detachModule(delModule);
            environment.modules.remove([delModule]);
          });
          
          deleteMode=false;
        }else if(event.pos==sName.mute){
          muteMode=false;
        }else if(event.pos==sName.mixer){
          if(engagedInteractor==self){//||engagedInteractor==ioView
            // if(engagedInteractor==ioView){
            //   selectedModule=ioView.selectedModule;
            // }
            // console.log({engageSelectedOnRelease});
            if(selectedModule && engageSelectedOnRelease){
              engagedInteractor.disengage();
              engagedInteractor=tryGetInteractorOf(selectedModule);
              if(engagedInteractor){
                hardware.selectorsPaintBitmap(0xF,selectedModule.color?selectedModule.color:[0,0,0]);
                //this is duplicate
                engagedInteractor.engage(event);
              }else{
                console.log("selected module "+selectedModule.name+" has no interactor for Launchpads")
                engagedInteractor=self;
              }
            }
          }
          engageSelectedOnRelease=true;
        }
        if(engagedInteractor==self){
          updateSelectorButtons();
          updateMatrixButtons();
        }
    }
    this.selectorKeyReleased=function(event){
        
    }
    
    this.disengage=function(){}
}

SuperInteractor.Sub=function(environment,hardware){
    this.hasParent=true;
    SuperInteractor.call(this,environment,hardware);
}



/*launchpad interactor entry point */
const interactors={
    SuperInteractor,
    Sequencer:require("./Sequencer"),
}

module.exports={
    list:interactors,
    tryGet:function(interactorName){
        console.log("try get launchpad interactor: "+interactorName);
        if(interactors[interactorName])return interactors[interactorName];
        console.log("no "+interactorName+" in",interactors);
        return false;
    }
    // environment.interfaces.whenAvailable("launchpads",function(launchpads){
    //     console.log("launchpads became available");
    // });
};
