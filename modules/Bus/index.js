'use strict';
var instanced = 0;
var name = function() {
  this.name = this.baseName + " " + instanced;
  instanced++;
}

var Bus = function(properties,environment) {
  this.baseName = "bus";
  this.color = [110, 120, 130];
  var self = this;
  name.call(this);
  this.interactor = {
    type: "interactor",
    compatibilityTags: []
  }

  this.eventReceived = function(evt) {
    this.output(evt.eventMessage);
  }
  this.preventBus = true;
  if (properties.name) this.name = properties.name
  environment.on('module created', function(evt) {
    var module = evt.module;
    if (!module.preventBus) {
      if (module.baseName !== "bus") {
        self.addOutput(module);
      }
    }
  });
};

module.exports=Bus;