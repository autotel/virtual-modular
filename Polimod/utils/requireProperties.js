
//@example: var environmentProps=requireProperties(["propertyone.subpropone","propertytwo"]).in(environment);
module.exports=function(propList){
  let ret={
    reqName:"root",
    in:function(thing){
      if(!Array.isArray(propList)){
        if(thing[propList]===undefined){
          throw new Error(this.reqName+" doesn't contain required property "+propList); 
        }else{
          return thing[propList];
        }
      }
      let missing=[];
      let present=[];
      let goIn=function(obj,proplist,trace){
        if(!trace)trace=this.reqName
        // console.log("goin",{obj,proplist});
        if(propList.length){
          let proplistClone=proplist.slice();
          let nextProp=proplistClone.shift();
          if(obj[nextProp]!==undefined){
            if(proplistClone.length){
              return goIn(obj[nextProp],proplistClone,trace+"."+nextProp);
            }else{
              return obj[nextProp];
            }
          }else{
            missing.push(trace);
            return false;
          }
        }
      }
      for(var propN in propList){
        let prop=propList[propN];
        let deep=prop.split(".");
        let result=goIn(thing,deep);
        ret[propN]=result;
        // console.log("require?",result);
      }
      if(missing.length){
        throw "Required properties missing: ["+missing.join()+"]";
      }
      return ret;
    },
    name:function(name){
      this.reqName=name;
      return ret;
    }
  }
  return ret;
}
module.exports.test=function(){
  // console.log("required",module.exports(["a","b","c.d"]).name("testRequire").in({
  //   a:0,b:1,c:{d:{e:33}}
  // }));
};