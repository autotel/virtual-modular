
var modulesList=require('./modulesList');
var modulePrototypes=[];
var modules=[];
for(var a in modulesList){
  modulePrototypes[a]=require(modulesList[a]);
}
module.exports=(function(environment){
  this.addModule=function(){
    modules.push(new modulePrototypes.monoSequencer(environment));
    // console.log(modules);
  }
  return this;
});


