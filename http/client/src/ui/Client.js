// var TWEEN = require('@tweenjs/tween.js');
var Observable=require('onhandlers');
// var $=require('jquery');
// Setup the animation loop.
function animate(time) {
  requestAnimationFrame(animate);
  // TWEEN.update(time);
}

requestAnimationFrame(animate);
module.exports = function() {
  Observable.call(this);
  let self = this;
  let off = 10;
  let w = window;
  let d = document;
  // let $b=$('body');
  let e = d.documentElement;
  let g = d.getElementsByTagName('body')[0];

  this.width = 0;
  this.height = 0;
  this.scroll = {
    x: 0,
    y: 0
  }

  function updateSize(){
    // self.width=$b.innerWidth();
    // self.height=$b.innerHeight();
    self.width=w.innerWidth;
    self.height=w.innerHeight;
  };

  updateSize();

  // var scrollTween = new TWEEN.Tween(this.scroll);

  // this.scrollTo = function(to, duration = 1, easing = 'Sinusoidal.InOut') {
  //   duration *= 1000;
  //   let _easing=TWEEN.Easing;
  //   //http://tweenjs.github.io/tween.js/examples/03_graphs.html
  //   let easplt=easing.split(".");
  //   for(let part of easplt){
  //     _easing=_easing[part];
  //   }
  //
  //   return scrollTween.to({
  //       x: to.x,
  //       y: to.y
  //     }, duration)
  //   .easing(_easing)
  //   .onUpdate(function(d) {
  //     window.scrollTo(d.x, d.y);
  //   }).start();
  // }

  // console.log("MMM",self.container);
  d.addEventListener("scroll", function(event) {
    // console.log("SC");
    self.scroll.x = event.pageX;
    self.scroll.y = event.pageY;
    self.handle('scroll',event);
  });

  w.onresize = function(event) {
    updateSize();
    self.handle('resize',event);
  };
  this.mouse=new(function(){
    Observable.call(this);
    console.log("MOUS#");
    var mouse=this;
    this.x=0;
    this.y=0;
    this.buttonsPressed=[false,false,false,false];
    w.addEventListener("move", function(evt){
      mouse.x=event.clientX;
      mouse.y=event.clientY;
    }, false);
    document.addEventListener('mousedown',function(evt){
      mouse.buttonsPressed[evt.button]=true;
    });
    document.addEventListener('mouseup',function(evt){
      mouse.buttonsPressed[evt.button]=false;
    });
  })();
  console.log("MIOS");

  return this;
};