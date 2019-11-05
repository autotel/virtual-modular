const requireProperties=require('../utils/requireProperties');

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
          //callback(self.list[expectedResourceName]);
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
  module.exports=EnvResource;