
  function abbreviate(str, maxlen){
    if(str.length<=maxlen) return str;
    str = str.match(/[^aeiou]+/g).join("")+"";
    // if(str.length<=maxlen) return str;
    // str = str.match(/[^a-z]/g).join("")+"";
    if(str.length<=maxlen) return str;
    str=str.slice(0,maxlen-1)+str.slice(-1);
    return str;
  }
  module.exports=abbreviate;