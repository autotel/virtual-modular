'use strict';
var onHandlers=require('onhandlers');

const Polimod=function(){
  const thisPolimod=this;
  onHandlers.call(this);

  function EnvResource(name){
    let self=this;
    this.use=function(add){
      for(var a in add){
        if(self[a]){
          throw "Error: trying to overwrite resource "+a+" from Polimod."+name;
        }else{
          thisPolimod.handle("+"+name,{name:a,val:add[a]});
          self[a]=add[a];
        }
      }
      availCheck();
    }
    const expectingList={};
    function availCheck(){
      console.log("availCheck");
      for(var expectedResourceName in expectingList){
        if(self[expectedResourceName]){
          while(expectingList[expectedResourceName].length){
            (expectingList[expectedResourceName].shift())(self[expectedResourceName]);
          }
          callback(self[expectedResourceName]);
        }
        delete expectingList[expectedResourceName];
      }
    }
    this.whenAvailable=function(expectedResourceName,callback){
      if(self[expectedResourceName]){
        callback(self[expectedResourceName]);
      }else{
        if(!expectingList[expectedResourceName])expectingList[expectedResourceName]=[];
        expectingList[expectedResourceName].push(callback);
      }
    }
  }

  this.interfaces=new EnvResource("interfaces");
  this.interactors=new EnvResource("interactors");
  this.modulePrototypes=new EnvResource("modulePrototypes");
  this.modules=new EnvResource("modules");
  this.tests=new EnvResource("tests");
}

module.exports = Polimod;
