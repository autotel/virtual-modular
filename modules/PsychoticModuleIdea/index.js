
/**

idea for a module that can have one independend interface per hardware, given the new structure
*/
'use strict';
var EventMessage = require('../../datatypes/EventMessage.js');

// var clockSpec=require('../standards/clock.js');
var CLOCKTICKHEADER = 0x00;
var CLOCKABSOLUTEHEADER = 0x03;
var instanced = 0;
var name = function() {
  this.name = this.baseName + " " + instanced;
  instanced++;
}
var PsychoticModuleIdea = function(properties) {
  this.interfaces={};
  this.interfaces.X16 = new (function(){
    this.intances={};
    this.Instance=function(ownHardware){
      this.draw=function(){
        ownHardware.draw(0x00);
      }
    }
    this.engage(function(hardware){
      if(!instances[hardware]){
        instances[hardware]=new Instance(hardware);
      }
    });
    this.onMatrixButtonPressed(event){
      if(instances[event.hardware]){
        instances[event.hardware].onMatrixButtonPressed(event);
      }else{
        console.error("??");
      }
    }
  })(this);

}
module.exports = PsychoticModuleIdea;