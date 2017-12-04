'use strict';
var ON=require('onhandlers');
var prompt = require('prompt');
console.log("using command line interface");
prompt.start();
var Defcli = function(environment,settings) {
  ON.call(this);
  var myInteractionPattern = environment.interactionMan.newSuperInteractor("DefCli", this);
  myInteractionPattern.handle('serialopened');
  var self=this;
  var promptAgain;

  function init() {
    self.print=function(text){
      console.log('\x1b[36m%s\x1b[0m',text);
    }
    promptAgain=function(){
      console.log('Type command');
      prompt.get(['>'], function(err, result) {
        if (err) {
          console.error(result);
        } else {
          myInteractionPattern.commandInput(result);
          console.log("command",result);
        }
        self.handle('command finished');
      });
    }
    promptAgain();
    self.on('command finished',promptAgain);
  }
  init();
  return this;
}
module.exports = Defcli;