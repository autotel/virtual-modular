'use strict';
let instances=0;
let Base=require("../Base");
var Bus = function(properties,environment) {
  var self = this;
  Base.call(this,properties,environment);
  this.name=this.constructor.name+instances++;
  if (properties.name) this.name = properties.name;

  this.interactor = {
    type: "interactor",
    compatibilityTags: []
  }

  this.messageReceived = function(evt) {
    this.output(evt.eventMessage);
  }
  this.preventBus = true;
  this.preventRecord=true;
  if (properties.name) this.name = properties.name
  environment.on('+module', function(evt) {
    var module = evt.module;
    if (!module.preventBus) {
      if (module.baseName !== "bus") {
        self.addOutput(module);
      }
    }
  });
};
Bus.color = [110, 120, 130];
module.exports=Bus;