'use strict';
var base = require('./InterfaceX16.js');
var InterfaceX28 = function (controlledModule, environment) {
  base.call(this, controlledModule, environment);
  var self = this;
  this.bottomButtonPressed = function (event) {
    if (event.button == "right") {
      momentaryBitmap = 0b0000010010000100;
      console.log("page");
      self.page();
    } else {
      momentaryBitmap = 0b0000001000010010;
      console.log("page");
      self.page();
    }
  };
  
  this.bottomButtonReleased = function (event) { };
}
module.exports = InterfaceX28;