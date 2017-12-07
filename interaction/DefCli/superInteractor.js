"use strict";
/**
Definition of hardware specific translations of hardware events into internal events
things such as "when the user press a button" become "view the sequencer user interface"

A superInteractor defines the main context for the interactors of the specific hardware. A superinteractor is the entry point to any of the other interfaces. For instance, if somebody created a hardware that is designed only for one specific module, the superinteractor would be in charge of routing the compatible module to that hardware device. If the module is supposed to be able to create and route modules (like in this case), a superinteractor defines the user interaction patterns of how the modules are created; and how one switches between interface.
*/
module.exports = {};
var onHandlers = require("onhandlers");

var moduleInterfaces = [];
/**
 * @constructor
 * singleton
 * @param {environment} input to pass the environment. Needed to access the modulesMan, for things such as adding modules, jumping to modules, etc.
 */
var DefCliSuperInteractorSingleton = function(environment) {
  /**check compatibility of a certain interactor*/
  var compatibilityTags = ["cli"];
  var compatible = function(tagSet) {
    for (var tag of tagSet) {
      if (compatibilityTags.indexOf(tag) != -1) {
        return true;
      }
    }
    return false;
  }
  /**
  affects all the DefCliInteractors. Depending on how much sense it makes, there could be a function that adds an interactor only to a certain hardware instance.
  */
  this.appendModuleInteractor = function(what) {
    if (what.type == "interactor") {
      if (compatible(what.compatibilityTags)) {
        moduleInterfaces.push(what);
      } else {
        // console.log(what);
        console.error("no command line interface for "+what.name);
      }
    } else {
      console.error("tried to add an object to a SuperInteractor that is not an interactor");
    }
  }
  /** get the list of interactors @return array*/
  this.getModuleInteractors = function() {
    return moduleInterfaces;
  }

  /**
   * @constructor
   * Super interactor instance: one per connected ui. hardware
   * X16SuperInteractor a {@link superInteractor} prototype for x16basic {@link HardwareDriver}.
   * @param {x16Hardware}
   * @returns {undefined} no return
   */
  this.SuperInteractor = function(myHardware) {
    /** @private @var engagedInterface stores the module that is currently engaged, the interaction events are forwarded to the {@link moduleInterface} that is referenced here*/
    var engagedInterface = false;
    onHandlers.call(this);
    var thisInteractor = this;

    // console.log("HWWW",myHardware);

    this.commandInput = function(command) {
      if (engagedInterface) {
        engagedInterface.commandInput(command);
      }else{
        console.log(command);
        if(command[">"]=="exit") process.exit();
      }
    }

    environment.on('module created', function(evt) {
      myHardware.print("new module",evt.module.name);
    });

    this.engage = function(evt) {
      sayHi();
      displayModules();
      engagedInterface = false;
    }

    function sayHi() {
      myHardware.print("command line root");
    }

    function help() {
      myHardware.print("help:");
    }
    return this;
  }
};

module.exports = DefCliSuperInteractorSingleton;