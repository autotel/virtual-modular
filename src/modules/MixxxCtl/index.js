'use strict';
var NoteOnTracker = require('../moduleUtils/NoteOnTracker.js');
var EventMessage = require('../../datatypes/EventMessage.js');
var Observable=require('onhandlers');
var InterfaceX16 = require('./InterfaceX16');
// var InterfaceHttp = require('./HttpGui');
// var clockSpec=require('../standards/clock.js');
var headers = EventMessage.headers;
/**
@constructor ModuleSingleton
singleton, only one per run of the program
every module needs to run at the beginning of the runtime to register it's interactor in the interactionManager

*/
var actuatorTypes={
  Base:function(props){
    Observable.call(this);
    this.name="unnamed";
    this.act=function(){};
    this.release=function(){};
    for(var a in props){
      self[a]=props[a];
    }

  },
  Toggle:function(props){
    var self=this;
    this.steps=1;
    this.active=0;
    this.value=0;
    buttonTypes.Base.call(this,props);

    this.act=function(delta = 1){
      self.active+=delta;
      self.active%=self.steps;
      self.handle("active",self);
      self.handle("active-"+self.active,self);
      return self.active;
    }
    return this;
  },
  Momentary:function(props){
    var self=this;
    this.active=0;
    this.value=0;
    buttonTypes.Base.call(this,props);

    this.act=function(active = 1){
      self.active=active;
      self.handle("act",self);
      self.handle("act-"+self.active,self);
      return self.active;
    }
    this.release=function(){
      self.active=0;
      self.handle("release");
      return self.active;
    }
    return this;
  }
}
var instancesCount = 0;
var testGetName = function () {
  this.name = this.baseName + " " + instancesCount;
  instancesCount++;
}
/**
@constructor
the instance of the of the module, ment to be instantiated multiple times.
require to moduleBase.call
*/
var MixxxCtl = function (properties, environment) {
  var self = this;
  var myBitmap = this.bitmap = 0;
  var a=actuatorTypes;
  var h=EventMessage.headers;
  this.decks = [
    {
      playrate: a.Toggle({steps:0xFF}),
      play: a.Toggle(),
      cue1: a.Toggle(),
      cue2: a.Toggle(),
      cue3: a.Toggle(),
      cue4: a.Toggle(),
    },
  ];

  userAction=function(actuator){
    self.output(new EventMessage({
      value:[actuator.head,actuator.number,actuator.deck]
    }) );
  }

  for(var deckn in decks){
    var deck=deckn;
    for(var button of deck){
      button.on
      button.deck=deckn;
      button.on("act", userAction);
      button.on("release", userAction);
    }
  }


  this.messageReceived = function (evt) {
  }
  this.getBitmaps16 = function () {
    return {
      steps: myBitmap,
      header: headerBmp & myBitmap
    };
  }

}

MixxxCtl.color = [100, 80, 190];
module.exports = MixxxCtl
