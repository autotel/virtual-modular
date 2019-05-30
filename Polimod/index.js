'use strict';
const onHandlers=require('onhandlers');
const EventMessage=require('./datatypes/EventMessage');
const TimeIndex=require('./datatypes/TimeIndex');
const LazyQueue=require('./utils/LazyQueue');
const abbreviate=require('./utils/abbreviate');
const throttle=require('./utils/throttle');
const requireProperties=require('./utils/requireProperties');
const ModString=require('./datatypes/ModString');
const Polimod=function(){
  const thisPolimod=this;
  onHandlers.call(this);

  function EnvResource(name,parent){
    let self=this;
    let singularName=name.replace(/s$/,"")
    this.add=function(add){
      for(var a in add){
        if(self.list[a]){
          throw "Error: trying to overwrite resource "+a+" from Polimod. "+name;
        }else{
          let evntArg={name:a,val:add[a]};
          evntArg[singularName]=add[a];
          parent.handle("+"+singularName,evntArg);
          self.list[a]=add[a];
        }
        // if(add[a].test){
        //   console.log("add test list",add[a].test);
        //   let use={}
        //   use[a]=add[a].test;
        //   parent.tests.add(use);
        // }
      }
      availCheck();
    }
    this.removeByNames=function(namesList){
      // console.log("Remove by nameslist",{namesList,sl:self.list});
      for(let what of namesList){
        if(typeof self.list[what].remove=="function") self.list[what].remove();
        delete self.list[what];
        parent.handle("-"+singularName,{name:what,val:self.list[what]});
      }
      // console.log("Remove by nameslist",{namesList,sl:self.list});

    }
    this.remove=function(objList){
      // console.log("Remove by obj list",{objList,sl:self.list});
      let namesList=[];
      for(let name in self.list){
        let itm=self.list[name];
        if(objList.indexOf(itm)>-1) namesList.push(name);
      }
      self.removeByNames(namesList);
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
  this.interfaces=new EnvResource("interfaces",this);
  //For the constructors of different modules (e.g. Harmonizer, Sequencer, Narp...)
  this.moduleConstructors=new EnvResource("moduleConstructors",this);
  //For the instances of those modules.
  this.modules=new EnvResource("modules",this);
  // TODO: For testing, to know if somehting will crash before a performance.
  this.tests=new EnvResource("tests",thisPolimod);
  this.tests.run=function(){
    for(var a in thisPolimod.tests){
      console.log("running "+a+" test");
      console.log("result",thisPolimod.tests[a]());
    }
  }
  
  this.datatypes=new EnvResource("datatypes",this);
  this.datatypes.add({EventMessage,TimeIndex,ModString,EnvResource});
  
  this.utils=new EnvResource("utils",this);
  this.utils.add({requireProperties,LazyQueue,abbreviate,throttle});


  
}

module.exports = Polimod;
