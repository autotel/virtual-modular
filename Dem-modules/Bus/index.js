'use strict';
let instances=0;
let Base=require("../Base");
var Bus = function(properties,environment) {
  var self = this;
  Base.call(this,properties,environment);
    this.messageReceived = function(evt) {
    this.output(evt.eventMessage);
  }
  this.preventBus = true;
  this.preventRecord=true;
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