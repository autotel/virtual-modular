/**
 * @module ./Polimod
*/
const onHandlers=require('onhandlers');
const EventMessage=require('./datatypes/EventMessage');
const TimeIndex=require('./datatypes/TimeIndex');
const LazyQueue=require('./utils/LazyQueue');
const abbreviate=require('./utils/abbreviate');
const throttle=require('./utils/throttle');
const requireProperties=require('./utils/requireProperties');
const ModString=require('./datatypes/ModString');
const EnvResource=require('./datatypes/EnvResource');
/**
 * Instance of a polimod environment
*/
class Polimod{
  // interfaces;modules;moduleConstructors;plugins;tests; datatypes;utils;
  constructor(){
    const thisPolimod=this;
    onHandlers.call(this);
    /**
      @type{EnvResource} containing different types of user physical interfaces (e.g. calculeitor, command line, web client, launchpad...)
      each of these interfaces may contain the different interactors in their own ways, and they do all the work of finding the interactor for each different module.
    */
    this.interfaces=new EnvResource("interfaces",this);
    /**
      @type{EnvResource} containing the constructors of different modules (e.g. Harmonizer, Sequencer, Narp...),
      A moduleConstructor is a class or function that gets called with (properties, environment) arguments. Properties intend to be a representation of their configuration (e.g. if they are being loaded from a file) and environment is the Polimod instance, from where they can access any of the global resources.
    */
    this.moduleConstructors=new EnvResource("moduleConstructors",this);
    /**
      @type{EnvResource} containing the instanced moduleConstructors.
      @see Polimod.moduleConstructors
    */
    this.modules=new EnvResource("modules",this);
    /**
      @type{EnvResource} containing other types of add-ons such as OSC IO.
    */
    this.plugins=new EnvResource("plugins",this);
    /** 
      @type{EnvResource} containing tests. This is useful to know if somehting will crash before a performance. Writing these tests, though, is in the to-do list.
    */
    this.tests=new EnvResource("tests",thisPolimod);
    this.tests.run=function(){
      for(var a in thisPolimod.tests.list){
        console.log("running "+a+" test");
        console.log("result",thisPolimod.tests[a]());
      }
    }
    /** 
      @type{EnvResource} containing the globally shared data types such as EventMessage 
    */
    this.datatypes=new EnvResource("datatypes",this);
    this.datatypes.add({EventMessage,TimeIndex,ModString,EnvResource});
    /** 
      @type{EnvResource} containing globally shared utilities
    */
    this.utils=new EnvResource("utils",this);
    this.utils.add({requireProperties,LazyQueue,abbreviate,throttle});
  }
}

module.exports = Polimod;
