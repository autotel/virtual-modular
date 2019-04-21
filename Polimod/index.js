'use strict';
var onHandlers=require('onhandlers');
var EventMessage=require('./datatypes/EventMessage');
var TimeIndex=require('./datatypes/TimeIndex');
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
  //For different types of user interfaces (e.g. calculeitor, command line, web client, launchpad...)
  this.interfaces=new EnvResource("interfaces");
  //For the constructors of different modules (e.g. Harmonizer, Sequencer, Narp...)
  this.modulePrototypes=new EnvResource("modulePrototypes");
  //For the instances of those modules.
  this.modules=new EnvResource("modules");
  // TODO: For testing, to know if somehting will crash before a performance.
  this.tests=new EnvResource("tests");
  this.datatypes=new EnvResource("datatyoes");
  this.datatypes.use({EventMessage,TimeIndex});
}

module.exports = Polimod;
