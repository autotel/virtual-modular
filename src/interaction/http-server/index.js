"use strict";
var myInteractorBase=require('./interactorBase.js');
var SuperInteractorSingleton=require('./superInteractor.js');
module.exports=(function(environment){
  this.interactorBase=myInteractorBase;
  this.superInteractorSingleton=new SuperInteractorSingleton(environment);
  this.SuperInteractor=this.superInteractorSingleton.SuperInteractor;
})