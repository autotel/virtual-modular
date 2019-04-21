"use strict"
/**
 base template for interactors when they are x16basic compatible
*/
const Base=function(environment,controlledModule){
  this.engagedHardwares=new Set();
  this.engage=function(hardware){
    engagedHardwares.add(hardware);
  }
  this.disengage=function(hardware){
    engagedHardwares.delete(hardware);
  }
}
module.exports=Base;
