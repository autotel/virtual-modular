/*
pattern can be "user defined", up, up/dn, dn, random, etc.
if it's user defined, the sequencer is enabled allowing to program the arp steps to sequence
the problem with user defined sequencer is that it has a limit of four grades due to the size of the ui matrix
but with the "standard" ones, all the grades are reached
the user defined sequencer also ensures a time metric
the arpeggiator length in a user defined arpeggiator sequence is provided by the position of the last programmed step.
*/
var Observable = require('onhandlers');

module.exports = function (controlledModule) {
  var self = this;
  Observable.call(this);
  var pattern = this.pattern = [];
  var playhead = this.playhead = { value: 0 }
  var length = this.length = { value: 4 }
  this.setStep = function (step, data = 1) {
    pattern[step] = data;
    self.handle('~sequence');
    // console.log(pattern);
  }
  this.clearStep = function (step) {
    if (pattern[step]) {
      delete pattern[step];
    }
    self.handle('~sequence');
  }
  this.toggleStep = function (step, data = 1) {
    if (pattern[step]) {
      self.clearStep(step);
    } else {
      self.setStep(step, data);
    }
  }
  this.getStep = function (step) {
    return (pattern[step] ? pattern[step] : false);
  }
  this.getCurrentStep = function () {
    return self.getStep(playhead.value);
  }
  this.getBitmap = function () {
    var ret = 0;
    for (var a in pattern) {
      if (pattern[a]) {
        ret |= 1 << a;
      }
    }
    return ret;
  }
  this.playStep = function (cb) {
    self.playhead.value++;
    self.playhead.value %= self.length.value;
    var st = self.getStep(self.playhead.value)
    if (st) {
      cb(st);
    }
    self.handle('step');
  }

}