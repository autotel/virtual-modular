var Base=require('./interactorBase.js');
var IoView=function(hardware,environment){
  this.engaged=false;
  var self=this;
  Base.call(this);

  //   module <---> num <---> button
  var buttonToNum=[
    undefined,        6,        7,        8,
            0,undefined,        9,       10,
            1,        3,undefined,       11,
            2,        4,        5,undefined,
  ]

  var numToButton=[];
  var numToModule=[];
  var selectedModule=false;
  var centeredModule=false;
  for(var a=0; a<6; a++){
    var ntb=buttonToNum.indexOf(a);
    numToButton=ntb;
  }
  function centerAroundModule(module){
    centeredModule=module;
    var i=Array.from(module.inputs);
    var o=Array.from(module.outputs);
    while(i.length<6) i.push(undefined);
    numToModule=i.concat(o);
    self.updateHardware();
  }
  function getModuleAtButton(button) {
    var num=undefined;
    num=buttonToNum[button];
    if(num!==undefined) return numToModule[num];
    return centeredModule;//default to selectedModule
  }
  function getButtonOfModule(module) {
    var num=numToModule.indexOf(module);
    if(num!==-1){
      return numToButton[num]?numToButton[num]:0;//default to button 0
    }
    return 0;//default to button 0
  }
  this.selectModule=function(module){
    selectedModule=module;
    centerAroundModule(selectedModule);
  }
  this.engage=function(event){
    self.updateHardware();
    self.engaged=true;
  }
  this.disengage=function(event){
    self.engaged=false;
  }
  this.updateHardware=function(){
    self.updateLeds();
    self.updateScreen();
  }
  this.updateLeds=function(){
    hardware.clear();
    let lowLight = environment.vars.light;

    for (let button = 0; button < 16; button++) {
      var bmodule = getModuleAtButton(button);
      if (bmodule) {
        var posBmp = 1 << button;
        var color = [0, 0, 127];
        if (bmodule.color) {
          color = bmodule.color;
        }

        if (bmodule.mute) {
          color = panton.mixColors(panton.disabled, color, 0.4);
          color = panton.homogenize(color, lowLight / 16);
        } else {
          color = panton.homogenize(color, lowLight);
        }

        if (selectedModule == bmodule) {
          color = panton.homogenize(color, Math.min((lowLight << 2), 0xff));
        }

        hardware.drawColor(posBmp, color);
      }
    }
  }
  this.updateScreen=function(){
    hardware.sendScreenB(selectedModule.name+"");
  }

  this.matrixButtonPressed=function(event){
    var btnInt=getModuleAtButton(event.button);
    if(btnInt){
      selectedModule=btnInt;
    }
    self.updateHardware();
  };
  this.matrixButtonReleased=function(event){
  };
  this.matrixButtonHold=function(event){};
  this.matrixButtonVelocity=function(event){};
  this.selectorButtonPressed=function(event){};
  this.selectorButtonReleased=function(event){};
  this.encoderScrolled=function(event){};
  this.encoderPressed=function(event){};
  this.encoderReleased=function(event){};
}
module.exports=IoView;
