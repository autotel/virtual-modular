var environment=new(function(){
  function requireProperties(propList){
    var missing={};
    for(var a in propList){
      if(typeof propList[a] === 'function'){
        let eval=propList[a](this[a]);
        if(!eval){
          missing[a]=eval;
        }
      }else{
        if(!this[propList[a]]){
          missing[propList[a]]="is "+missing[a];
        }else{
        }
      }
    }
    if(Object.keys(missing).length==0) missing=false;
    return missing;
  }
  this.useModule=function(Module){
    var fails=requireProperties.call(Module,['color','name','constructor','interfaces']);
    if(fails){
      console.error("a module couldn't be added because of problems the properties:",fails);
    }else{
      console.log("added module",Module.name);
    }
  }
  this.useHardware=function(hardware){
    var fails=requireProperties.call(Module,['name','constructor']);
    if(fails){
      console.error("a module couldn't be added because of problems the properties:",fails);
    }else{
      console.log("added module",Module.name);
    }
  }
  return this;
});


var TestModule=function(){

}
TestModule.color="ofo";
TestModule.name="masm";
TestModule.interfaces=['x28'];
environment.useModule(TestModule);