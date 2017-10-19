'use strict';
//this module is not active because it's not listed in "modulesList.js". It is just an boilerplate to create modules
var EventMessage=require('../../datatypes/EventMessage.js');
var moduleInstanceBase=require('../moduleInstanceBase');
//we require the user interface script. It should be one per hardware that we want to be compatible with.
var uix16Control=require('./x16basic');
/**
@constructor ModuleSingleton
singleton, only one per run of the program
every module needs to run at the beginning of the runtime to register it's interactor in the interactionManager
*/
module.exports=function(environment){return new (function(){
  //creating the instance of the singleton for the user interface
  var interactorSingleton=this.InteractorSingleton=new uix16Control(environment);
  //counting how many instances of this module there are, so we can give unique names
  var instanced=0;
  var name=function(){
    this.name=this.baseName+" "+instanced;
    instanced++;
  }
  /**
  @constructor
  the instance of the of the module, ment to be instantiated multiple times.
  require to moduleBase.call
  */
  this.Instance=function(properties){
    //this make this module to be recognized as a module, and makes it possible for it to connect to other modules
    moduleInstanceBase.call(this);
    this.baseName="empty module";
    //get my unique name
    name.call(this);
    //create the instance of my interactor. There is one interactor per module, per compatible hardware version. (two of the same hardware have only one interactor)
    var myInteractor=this.interactor=new interactorSingleton.Instance(this);
    this.interactor.name=this.name;

    //here the custom code for the module
    //we send an EventMessage to the module's output by using this.output(EventMessage);
  }
})};