const requireProperties=require('../utils/requireProperties');

class EnvResource{
  /**
    @param name: the name, in plural to give to this EnvResource
    @param parent: the parent, is intended to be a Polimod; but it can be anything that has a handle function. The handle function is called whenever new resources are added or removed from the list property
  */  
  constructor(name,parent){
    let self=this;
    let singularName=name.replace(/s$/,"")
    /**
      add a new item to the list (items should never be added directly, but only by using this function)
      it throws an error if a resource named the same already exists.
      @param add: @type Object list of envResources to add. The object keys need become the resource name.
      @example `envResource.add({Midi:MidiInputOutput}); //envResource.list appends MidiInputOutput in the `[Midi]` property.

      @see EnvResource.list
    */
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
    /**
      remove envResources from the list, by their name
      a "-" event handler is called with the name of that resource in singular. 
      @example ```
        let plugins=new EnvResource("plugins",this);
        plugins.add({tester:Tester});
        this.on('-plugin',console.log);
        plugins.removeByNames([tester]);
        //log expected: {name:"tester",val:Tester}
      ```
      if the name doesn't exist, nothing happens.

      @see EnvResource.list
    */
    this.removeByNames=function(namesList){
      // console.log("Remove by nameslist",{namesList,sl:self.list});
      for(let what of namesList){
        if(typeof self.list[what].remove=="function") self.list[what].remove();
        delete self.list[what];
        parent.handle("-"+singularName,{name:what,val:self.list[what]});
      }
      // console.log("Remove by nameslist",{namesList,sl:self.list});
    }
    /**
      remove envResources from the list, by the object reference itself.
      a "-" event handler is called with the name of that resource in singular. 
      @example ```
        let plugins=new EnvResource("plugins",this);
        plugins.add({tester:Tester});
        this.on('-plugin',console.log);
        plugins.remove([Tester]);
        //log expected: {name:"tester",val:Tester}
      ```
      if the name doesn't exist, nothing happens.

      @see EnvResource.list
    */
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
    /**
      make a check of availability of all envResources, in order to trigger callbacks that could have been attached using the @function EnvResource.whenAvailable()
      envResource takes care of calling this
    */
    function availCheck(){
      // console.log("availCheck");
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

    /**
      Establish a callback to call when an envResouce named as @param expectedResourceName is added.
      Useful when something requires an EnvResource, but it is possible that it will be added after the time of requirement. 
      
      If it doesn't make the code more complicated, then it is advisable to use always this function instead of @function EnvReosurce.requires()
      
      @example ``` 
        environment.interfaces.whenAvailable("commandline",function(theResource){
          //the code that requires that resource
          console.log(theResource);
        }) 
      ```
      @see EnvResource.list
    */
    this.whenAvailable=function(expectedResourceName,callback){
      if(self.list[expectedResourceName]){
        callback(self.list[expectedResourceName]);
      }else{
        if(!expectingList[expectedResourceName])expectingList[expectedResourceName]=[];
        expectingList[expectedResourceName].push(callback);
      }
    }
    /**
      get resources from the list, or cause an arror if a set of resources are not available.
      In this way, the code fails at startup instead of failing when a property is accessed.
      @param requirementsList is the list of resource names that are required. It can also be one single name.
      @see EnvResource.list
    */
    this.requires=function(requirementsList){
      return requireProperties(requirementsList).name(name+"").in(self.list);
    }
    /**
      iterate over each resource that is available
      @param cb(resource,name,list) is the callback that gets called with the resource, the name and the list as parameters
    */
    this.each=function(cb){
      for(var a in self.list) cb(self.list[a],a,self.list);
    }
    /**
      list of available resources.
      never add or remove a resource directly to the list, because that will cause availability checking and event listening to be skipped. 
      @see EnvResource.add()
    */
    this.list={};
  }
}
module.exports=EnvResource;