'use strict'
/**
@example ` myOutput.receive(new EventMessage([0x01,0x40,0x30])) `
*/
var EventMessage = function (inputValue) {
  var thisEm = this;
  var self = this;
  this.isEventMessage = true;
  /**
  value of the EventMessage

  [0]=function header, indicates the receiving module what function to perform with the following data

  [1]=main event number, indicates information such as what note to play, what cc to change, or what event to trigger.
  
  [2]=submode/ voice specification (channel), indicates a variation of the mode or what voice to play. Sometimes unused

  [3 ... ]= more data, depending on the particular function of the receiver following data may make sense or not.

  all the efforts are done to avoid it's value to be a reference. to simulate modular elements, the EventMessages must have their own copy of the data, otherwise it could happen that a module edits an EventMessage that has been received by other. This is why to modify the .value of EventMessage, you can opt for
  * set a single index of the value `myEventMessage.value[2]=0x44`
  * or use the set function `myEventMessage.set({value:[0x44,0x44,0x44]});
  */

  this.value = [];
  /**
  valuenames is correlated to values array, and is used to have friendlier names to a certain EventMessage. It helps make these more readable; however you must avoid referencing to values using the names because that doesn't ensure compatibility with modules that may name values differently, and also it is slower in execution.
  @example myEventMessage.print();
  */
  this.valueNames = [];
  /**print to the console it's values with index and names (if applicable)*/
  this.print = function () {
    console.log("EventMessage { ");
    for (var a in this.value) {
      var str = "[" + a + "]";
      if (this.valueNames[a]) str += "(" + valueNames[a] + ") ";
      str += ": " + this.value[a];
      console.log(" " + str);
    }
    console.log("}");
  }
  /**
  set parameters of the EventMessage Data contains properties to set.
  @example myEventMessage.set({value:[0x44,0x44,0x44],note:"example event message"});

  the only standard property that can be set is the value, other properties such as the exaple "note" are not standard, avoid using non-standard parameters unless it excplusively within the same module that is using it
  */
  this.set = function (data) {
    for (var a in data) {
      if (typeof data[a] !== "function")
        this[a] = JSON.parse(JSON.stringify(data[a]));
    }
  }
  /**
  @returns a copy of itself
  */
  this.clone = function () {
    return new EventMessage(this);
  }
  this.compareValuesTo = function (otherEvent, valuesList) {
    if (otherEvent === self) return true;
    for (var index of valuesList) {
      if (otherEvent.value[index] !== self.value[index]) return false;
    }
    return true;
  }
  this.compareTo = function (otherEvent, propertyList) {
    if (otherEvent === self) return true;
    function recurse(currentObject, pathArr, level = -1) {
      // console.log("R",currentObject);
      var nextLevel = level + 1;
      if (level == pathArr.length - 1) {
        // console.log("<<",currentObject);
        return currentObject;
      } else if (currentObject[pathArr[nextLevel]]) {
        // console.log(">>",currentObject[pathArr[nextLevel]]);
        return recurse(currentObject[pathArr[nextLevel]], pathArr, nextLevel);
      } else {
        // console.log("?! currentObject["+pathArr[nextLevel]+"]=",currentObject[pathArr[nextLevel]]);
        return;
      }
    }
    for (var a of propertyList) {
      var splitVal = a.split('.');
      if (splitVal.length > 1) {
        let comparableA = recurse(self, splitVal);
        let comparableB = recurse(otherEvent, splitVal);
        // console.log("compare",comparableA,comparableB);
        if (comparableA != comparableB) {
          // console.log(comparableA,"!==",comparableB);
          return false;
        }
      } else {
        if (JSON.stringify(self[a]) != JSON.stringify(otherEvent[a])) {
          // console.log(`${JSON.stringify(self[a])}!=${JSON.stringify(otherEvent[a])}`,JSON.stringify(self[a])!=JSON.stringify(otherEvent[a]))
          return false;
        } else {
          // console.log(`${JSON.stringify(self[a])}==${JSON.stringify(otherEvent[a])}`,JSON.stringify(self[a])==JSON.stringify(otherEvent[a]))

        }
      }
    }
    return true;
  }
  /**apply all the characteristics of other event message to this one, except the ones that are
  "transparent" in the other (value==-1)*/
  this.superImpose = function (otherEvent) {
    for (var a in otherEvent.value) {
      if (otherEvent.value[a] >= 0) {
        thisEm.value[a] = otherEvent.value[a];
      }
    }
    return thisEm;
  }
  /**apply only the characteristics of other event message if the ones in  this are transparent*/
  this.underImpose = function (otherEvent) {
    for (var a in otherEvent.value) {
      if (!(thisEm.value[a] >= 0)) {
        thisEm.value[a] = otherEvent.value[a];
      }
    }
    return thisEm;
  }

  var next=false;
  Object.defineProperty(this, "next", {
    get: function () {
      return next;
    },
    set: function (a) {
      if (otherEvent.isEventMessage) {
        next = otherEvent;
      } else {
        next=false;
      }
    }
  });
  
  this.set(inputValue);
}
EventMessage.from = function (original) {
  return new EventMessage(original);
}

EventMessage.test = function () {

  var eM = new EventMessage({ value: [0, 2, 2] });
  function aa() { return }

  var scripts = [
    function () {
      return eM
    },
    function () {
      return eM.clone()
    },
    function () {
      return eM.compareTo(eM.clone(), ['value'])
    },
    function () {
      return eM.compareTo(new EventMessage({ value: [0, 1, 2, 3] }), ['value'])
    },
    function () {
      return eM.compareTo(eM.clone(), ['value.1'])
    },
    function () {
      return eM.compareTo(new EventMessage({ value: [0, 1, 2, 3] }), ['value.2'])
    },
    function () {
      return eM.compareTo(new EventMessage({ value: [0, 1, 2, 3] }), ['value.1', 'value.2'])
    },
  ];
  for (var scr of scripts) {
    console.log(String(scr) + '\n\n>', eval(scr)(), "\n");
  }
}



EventMessage.headers = {
  clockTick: 0x0,
  triggerOn: 0x01,
  triggerOff: 0x02,
  changePreset: 0x03,
  changeRate: 0x04,
  choke: 0x05,
  playhead: 0x06,
  record: 0xAA,
  recordStatus: 0xAB
}
// EventMessage.test();
module.exports = EventMessage;
/**/