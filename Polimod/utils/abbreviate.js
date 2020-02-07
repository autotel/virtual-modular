
  function abbreviate(str, maxlen){
    if(str.length<=maxlen) return str;
    str = str.match(/[^aeiou]+/g).join("")+"";
    // if(str.length<=maxlen) return str;
    // str = str.match(/[^a-z]/g).join("")+"";
    if(str.length<=maxlen) return str;
    if(maxlen<3) return str.slice(0,maxlen-1)+".";
    if(maxlen<5) return str=str.slice(0,2)+"."+str.slice(str.length-maxlen+3,str.length);
    str=str.slice(0,3)+"."+str.slice(str.length-maxlen+4,str.length);
    return str;
  }
  module.exports=abbreviate;