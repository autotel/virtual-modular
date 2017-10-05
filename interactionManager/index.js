//this module handles what happen when there is a hardware event (such as pressing a button)
let onHandlers=require('onhandlers');

let x16basic=require('./x16-basic');

module.exports=(function(environment){
  this.patterns={};
  this.patterns.x16basic=x16basic;
  return this;
});