
module.exports=function(propList){
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