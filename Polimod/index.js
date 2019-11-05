'use strict';
const onHandlers=require('onhandlers');
const EventMessage=require('./datatypes/EventMessage');
const TimeIndex=require('./datatypes/TimeIndex');
const LazyQueue=require('./utils/LazyQueue');
const abbreviate=require('./utils/abbreviate');
const throttle=require('./utils/throttle');
const requireProperties=require('./utils/requireProperties');
const ModString=require('./datatypes/ModString');
const EnvResource=require('./datatypes/EnvResource');
const Polimod=function(){
  const thisPolimod=this;
  onHandlers.call(this);

  //For different types of user physical interfaces (e.g. calculeitor, command line, web client, launchpad...)
  //each of these interfaces may contain the different interactors in their own ways.
  this.interfaces=new EnvResource("interfaces",this);
  //For the constructors of different modules (e.g. Harmonizer, Sequencer, Narp...)
  this.moduleConstructors=new EnvResource("moduleConstructors",this);
  //For the instances of those modules.
  this.modules=new EnvResource("modules",this);
  //for other types of add-ons such as OSC IO. MIDI IO should be a plugin too but haven't ported it yet.
  this.plugins=new EnvResource("plugins",this);
  // TODO: For testing, to know if somehting will crash before a performance.
  this.tests=new EnvResource("tests",thisPolimod);
  this.tests.run=function(){
    for(var a in thisPolimod.tests){
      console.log("running "+a+" test");
      console.log("result",thisPolimod.tests[a]());
    }
  }
  
  this.datatypes=new EnvResource("datatypes",this);
  this.datatypes.add({EventMessage,TimeIndex,ModString,EnvResource});
  
  this.utils=new EnvResource("utils",this);
  this.utils.add({requireProperties,LazyQueue,abbreviate,throttle});


  
}

module.exports = Polimod;
