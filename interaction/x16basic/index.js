myInteractorBase=require('./interactorBase.js');
SuperInteractorSingleton=require('./superInteractor.js');

module.exports=(function(environment){
  /**
  definition of the base for interactors to be .called(this) on every interactor
  */
  this.interactorBase=myInteractorBase;
  /**
  my SuperInteractor singleton
  */
  this.superInteractorSingleton=new SuperInteractorSingleton(environment);
  this.SuperInteractor=this.superInteractorSingleton.SuperInteractor;
})