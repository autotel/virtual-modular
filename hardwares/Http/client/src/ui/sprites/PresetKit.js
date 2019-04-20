var colours = require("../colours");

var Base = require('./ModuleBase.js');
const TWO_PI = Math.PI * 2;
// var testC=0;
module.exports = function (ui, properties) {
  var node = this.node = properties.node;

  Base.call(this, ui, properties);
  var self = this;
  // var direction = Math.sign(Math.random()-0.5);
  var steps = 0;
  var currentStep = 0;
  var stepsPerRotation = 16;
  var mid={
    x:window.innerWidth/2,
    y:window.innerHeight/2
  }

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
    var distance = 10;

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

      circles[n].setX((n%4)*distance);
      circles[n].setY(Math.floor(n/4)*distance);
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
  //   console.log(">>",from,val);
  // };
  // this.messageOut = function (from, val) {
  //   console.log("<<",from,val);
  // };

  this.applyChanges = function (properties) {

    if (properties.steps) setLength(properties.steps);
    // if (properties.patData) console.log(properties.patData);
    if (properties.bitmap!==null) setBitmap(properties.bitmap);

    // console.log("applychanges", properties);
  }

  var place = { x: 0, y: 0 }
  place.x = Math.random() * 100;
  place.y = Math.random() * 100;

  this.K.setX(place.x);
  this.K.setY(place.y);

  var lastPosition={
    x:place.x,
    y:place.y
  }
  // var myTestC=testC;
  var _upd = this.update;
  this.update=function(a){
    _upd(a);
    // if(myTestC==0)
    // console.log(place)
    var position = self.K.position();
    if(Math.abs(lastPosition.x-position.x)+Math.abs(lastPosition.y-position.y)>=1)
      self.K.rotation(180*Math.atan2(position.x-mid.x, position.y-mid.y)/Math.PI);
    lastPosition=position;
  }
  var absTime = 0;
  // testC++;
}
