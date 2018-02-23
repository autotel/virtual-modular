var idArray=[];
//allocates a new data-bound item to the unique array and returns the id within the array;
function add(what){
  var a=0;
  for(a in idArray){
    if(idArray[a]===false){
      idArray[a]=what;
      console.log("assign slot"+a+"to new");
      return a;
    }
  }
  console.log("assign slot"+idArray.length+"to new");
  return idArray.push(what)-1;
}
function detach(id){
  idArray[id]=false;
}
// function whoIs(id){
//   return idArray[a];
// }

module.exports={
  add:add,
  detach:detach,
  // whoIs:whoIs,
  whoIs:idArray,
}
