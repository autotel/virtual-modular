var colours = require("../colours");

var Base = require('./ModuleBase.js');
const TWO_PI = Math.PI * 2;
module.exports = function (ui, properties) {
  var node = this.node = properties.node;

  Base.call(this, ui, properties);
  var self = this;
  // var direction = Math.sign(Math.random()-0.5);
  var steps = 0;
  var currentStep = 0;
  var stepsPerRotation = 16;

  var circles = [];
  var circlesGroup = new Konva.Group();

  var line = new Konva.Line({
    x: 0,
    y: 0,
    points: [0,35,0,20],
    stroke: colours.lines,
    strokeWidth: 1
  });

  var microRotation = 0;
  this.K.add(circlesGroup);
  this.K.add(line);
  function setLength(to) {

    stepsPerRotation = Math.min(16, to);
    if (stepsPerRotation == 0) return;
    var distance = 40;

    for (var n = 0; n < to; n++) {
      if (!circles[n]) {
        circles[n] = new Konva.Circle({
          radius: 5,
          fill: 'transparent',
          stroke: colours.lines,
          strokeWidth: 1
        });
        circlesGroup.add(circles[n]);
      } else {
        circles[n].setAttr('visible', true);
      }
      steps = to;

      var modPos = (n / stepsPerRotation) % 1;
      circles[n].setX(Math.sin((modPos) * TWO_PI) * (distance));
      circles[n].setY(Math.cos((modPos) * TWO_PI) * (distance));
      if (to > 16) distance -= 0.5;
    }
    for (var n = to; n < circles.length; n++) {
      circles[n].setAttr('visible', false);
    }
  }
  function setBitmap(bitmap) {
    eachStepCircle(function (circle, n) {
      if (1 << n & bitmap)
        circle.setAttr('fill', colours.highlights);
      else
        circle.setAttr('fill', 'transparent');

    });
  }
  function eachStepCircle(callback) {
    for (var n = 0; n < circles.length; n++) {
      callback(circles[n], n);
    }
  };

  setLength(16);
  //this fn works, but only for a time.. ?
  // this.messageIn = function (from, val) {
  //   if (val[0] == 0) {
  //     if (steps > 0) {
  //       microRotation++;
  //       circlesGroup.setAttr('rotation', (currentStep + microRotation / val[1]) * 360 / stepsPerRotation);
  //     }
  //   }
  // };

  this.applyChanges = function (properties) {
    if (properties.steps) setLength(properties.steps);
    // if (properties.patData) console.log(properties.patData);
    if (properties.bitmap!==null) setBitmap(properties.bitmap);
    if (properties.step) {
      currentStep = properties.step;
      circlesGroup.setAttr('rotation', currentStep * 360 / stepsPerRotation);
      microRotation = 0;
    }
    // console.log("applychanges", properties);
  }

  var place = { x: 0, y: 0 }
  place.x = Math.random() * 100;
  place.y = Math.random() * 100;

  this.K.setX(place.x);
  this.K.setY(place.y);

  var _upd = this.update;
  var absTime = 0;

}