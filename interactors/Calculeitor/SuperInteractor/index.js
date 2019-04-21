"use strict";
var RARROW = String.fromCharCode(199);
var XMARK = String.fromCharCode(183);



const SuperInteractor=function(environment,hardware){
  const self=this;
  let engagedInteractor=self;
  let selectedModule=false;
  let matrixLocationOffset=0;
  let inputsMode=false;
  let deleteMode=false;
  const calculeitorGlobals=environment.interfaces.calculeitors.globals;
  if(!calculeitorGlobals.modulePositions)calculeitorGlobals.modulePositions=[];
  const modulePositions=calculeitorGlobals.modulePositions;

  console.log(environment.modulePrototypes);
  var DummyModule=environment.modulePrototypes.TestDummy;

  function tryGetModuleAt(position){
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
  function detachModule(subject){
    for(var position in modulePositions){
      if(modulePositions[position].includes(subject)) {
        delete modulePositions[position][modulePositions[position].indexOf(subject)];
      };
    }
    return false;
  }
  function relocateModule(subject,position){
    let currentPosition=tryGetPositionOf(subject);
    if(currentPosition!==false){
      detachModule(subject);
    }
    if(!modulePositions[position])modulePositions[position]=[];
    modulePositions[position].push(subject);
  }
  
  hardware.definePresetColor("basic",[0xA2,0x9E,0xBA]);
  hardware.definePresetColor("basic-dim",[0x38,0x36,0x40]);
  
  hardware.definePresetColor("sequencer",[0x11,0x57,0xFF]);
  hardware.definePresetColor("sequencer-dim",[0x05,0x18,0x46]);
  
  hardware.definePresetColor("generative",[0xFF,0x01,0x90]);
  hardware.definePresetColor("generative-dim",[0x44,0x00,0x26]);
  
  hardware.definePresetColor("direct",[0xD2,0xF1,0x0B]);
  hardware.definePresetColor("direct-dim",[0x6A,0x71,0x05]);

  hardware.definePresetColor("selected",[0xFF,0xFF,0xFF]);
  

  //available colors for module categories
  // ("orange",[0xFF,0xA7,0x0D]);
  // ("orange_dim",[0x57,0x39,0x04]);
  // ("yellow",[0xD2,0xF1,0x0B]);
  // ("yellow_dim",[0x6A,0x71,0x05]);
  // ("cyan",[0x13,0xF0,0xDA]);
  // ("cyan_dim",[0x06,0x52,0x4A]);
  // ("blue",[0x11,0x57,0xFF]);
  // ("blue_dim",[0x05,0x18,0x46]);
  // ("gray",[0xA2,0x9E,0xBA]);
  // ("gray_dim",[0x38,0x36,0x40]);
  // ("magenta",[0xFF,0x01,0x90]);
  // ("magenta_dim",[0x44,0x00,0x26]);

  function updateMatrixButtons(){
    let colSequence=[];
    for (let button = 0; button < 16; button++) {
      let location = button + matrixLocationOffset;
      let bmodule = tryGetModuleAt(location);
      
      colSequence[button]=[0,0,0];
      if (bmodule) {        
        if(deleteMode && deleteMode.has(bmodule)){
          colSequence[button]=[32,32,0];
          if (bmodule.color) {
            colSequence[button] = bmodule.color.map(a=>a/4);
          }
        }else if(selectedModule==bmodule){
          colSequence[button]=[255,255,255];
        }else if(selectedModule && (inputsMode && selectedModule.inputs.has(bmodule))){
          colSequence[button]=[0,255,255];
        }else if(selectedModule && (!inputsMode && selectedModule.outputs.has(bmodule))){
          colSequence[button]=[255,0,0];
        }else{
          colSequence[button]=[255,255,0];
          if (bmodule.color) {
            colSequence[button] = bmodule.color;
          }
        }
      }
    }
    hardware.setButtonColors(colSequence,8);
  }
  
  hardware.on("uiEvent",function(event){
    if(engagedInteractor[event.type]){
      /*Note: under this mode of operation, the interactor must never
      have a public property with the same name as a hardware event. */
      engagedInteractor[event.type](event);
    }
  })
  this.matrixButtonPressed=function(event){
    console.log(event);
    let buttonModule=tryGetModuleAt(event.button);

    if(deleteMode){
      if(buttonModule){
        if(deleteMode.has(buttonModule)){
          deleteMode.delete(buttonModule);
          buttonModule.mute=false;
        }else{
          deleteMode.add(buttonModule)
          buttonModule.mute=true;
        }
      }
    }else if(event.chained){
      console.log(buttonModule);
      if(selectedModule&&buttonModule){
        selectedModule.toggleOutput(buttonModule);
      }else if(selectedModule){
        relocateModule(selectedModule,event.button);
      }
    }else{
      selectedModule=buttonModule;
      if(selectedModule){
      }else{
        console.log("engage module creator");
        relocateModule(new DummyModule({},environment),event.button);
      }
    }
    updateMatrixButtons();
  }
  this.matrixButtonReleased=function(event){
  }
  this.matrixButtonHold=function(event){
  }
  this.matrixButtonVelocity=function(event){
  }
  this.selectorButtonPressed=function(event){
    if(event.button==0){
      inputsMode=true;
    }else if(event.button==1){
    }else if(event.button==2){
      deleteMode=new Set();
    }else if(event.button==3){
    }
    updateMatrixButtons();
  }
  this.selectorButtonReleased=function(event){
    if(event.button==0 && inputsMode){
      inputsMode=false;
    }else if(event.button==2 && deleteMode){
      deleteMode.forEach(delModule=>{
        detachModule(delModule);
        delModule.remove()
      });
      
      deleteMode=false;
    }
    updateMatrixButtons();
  }
  this.bottomButtonPressed=function(event){
  }
  this.bottomButtonReleased=function(event){
  }
  this.encoderScrolled=function(event){
  }
  this.encoderPressed=function(event){
  }
  this.encoderReleased=function(event){
  }
  this.comTester=function(event){
  }
  this.rcvMidi=function(event){
  }
  this.getFirmwareVersionResponse=function(event){
  }
  this.log=function(event){
  }
};
module.exports=SuperInteractor;