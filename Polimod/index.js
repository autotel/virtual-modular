'use strict';
const onHandlers=require('onhandlers');
const EventMessage=require('./datatypes/EventMessage');
const TimeIndex=require('./datatypes/TimeIndex');
const LazyQueue=require('./LazyQueue');
const requireProperties=require('./requireProperties');
const Polimod=function(){
  const thisPolimod=this;
  onHandlers.call(this);

  function EnvResource(name){
    let self=this;
    this.use=function(add){
      for(var a in add){
        if(self.list[a]){
          throw "Error: trying to overwrite resource "+a+" from Polimod."+name;
        }else{
          thisPolimod.handle("+"+name,{name:a,val:add[a]});
          self.list[a]=add[a];
        }
        console.log("add test list",add[a].test);
        if(add[a].test){
          let use={}
          use[a]=add[a].test;
          thisPolimod.tests.use(use);
        }
      }
      availCheck();
    }
    const expectingList={};
    function availCheck(){
      console.log("availCheck");
      for(var expectedResourceName in expectingList){
        if(self.list[expectedResourceName]){
          while(expectingList[expectedResourceName].length){
            (expectingList[expectedResourceName].shift())(self.list[expectedResourceName]);
          }
          callback(self.list[expectedResourceName]);
        }
        delete expectingList[expectedResourceName];
      }
    }
    this.whenAvailable=function(expectedResourceName,callback){
      if(self.list[expectedResourceName]){
        callback(self.list[expectedResourceName]);
      }else{
        if(!expectingList[expectedResourceName])expectingList[expectedResourceName]=[];
        expectingList[expectedResourceName].push(callback);
      }
    }
    this.requires=function(requirementsList){
      return requireProperties(requirementsList).name(name+"").in(self.list);
    }
    this.each=function(cb){
      for(var a in self.list) cb(self.list[a],a,self.list);
    }
    this.list={};
  }
  //For different types of user physical interfaces (e.g. calculeitor, command line, web client, launchpad...)
  //each of these interfaces may contain the different interactors in their own ways.
  this.interfaces=new EnvResource("interfaces");
  //For the constructors of different modules (e.g. Harmonizer, Sequencer, Narp...)
  this.modulePrototypes=new EnvResource("modulePrototypes");
  //For the instances of those modules.
  this.modules=new EnvResource("modules");
  // TODO: For testing, to know if somehting will crash before a performance.
  this.tests=new EnvResource("tests");
  this.tests.run=function(){
    for(var a in thisPolimod.tests){
      console.log("running "+a+" test");
      console.log("result",thisPolimod.tests[a]());
    }
  }
  
  this.datatypes=new EnvResource("datatypes");
  this.datatypes.use({EventMessage,TimeIndex});
  
  this.utils=new EnvResource("utils");
  this.utils.use({requireProperties,LazyQueue});


  
}

module.exports = Polimod;
