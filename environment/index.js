var Observable=require('onhandlers');

var ModulesManager=require('./ModulesManager');


var Environment=function(){
  Observable.call(this);
  var self=this;
  this.on('a',console.log)
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

  var modules=this.modules=new ModulesManager(this);

  this.module=function(Constructor){
    var fails=requireProperties.call(Constructor,['name','constructor']);
    if(fails){
      console.error("a module couldn't be added because of problems the properties:",fails);
      return;
    }else{
      console.log("added module",Constructor.name);
    }
    if(typeof Constructor.initialization==="function"){
      Constructor.initialization(self);
    }
    modules.addConstructor(Constructor);
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
}



module.exports=Environment;