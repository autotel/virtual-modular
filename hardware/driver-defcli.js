'use strict';
var ON=require('onhandlers');
var prompt = require('prompt');
console.log("using command line interface");
var Defcli = function(environment,settings) {
  ON.call(this);
  var myInteractionPattern = environment.interactionMan.newSuperInteractor("defcli", this);
  myInteractionPattern.handle('serialopened');
  var self=this;
  function init() {
    prompt.start();
    this.print=console.log;
    function newCommand(){
      prompt.get(['command'], function(err, result) {
        if (error) {
          console.error(result);
        } else {
          myInteractionPattern.commandInput(result);
          console.log("command",result);
          self.handle('command finished');
        }
      });
    }
  }
  self.on('command finished',newCommand);
}
module.exports = Defcli;