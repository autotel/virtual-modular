'use strict';
let instances=0;
const onHandlers=require('onhandlers');

let Base=require("../Base");
var Composite = function(properties,environment) {
  var self = this;
  Base.call(this,properties,environment);
  var EnvRes=environment.datatypes.requires('EnvResource');
  let subEnvironment=this.subEnvironment=new(function(){
    let thisEnv=this;
    onHandlers.call(this);
    this.modules=new EnvRes("modules",this);
    for(let res in environment){
      if(thisEnv[res]){
        console.warn("not overwriting composite property:",res);
      }else{
        thisEnv[res]=environment[res]
      }
    }
  })();
  
};
Composite.color = [110, 120, 130];
module.exports=Composite;