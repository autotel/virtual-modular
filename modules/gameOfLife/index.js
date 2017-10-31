'use strict';
var EventMessage=require('../../datatypes/EventMessage.js');
var moduleInstanceBase=require('../moduleInstanceBase');
var uix16Control=require('./x16basic');
// var clockSpec=require('../standards/clock.js');
var CLOCKTICKHEADER = 0x00;
var TRIGGERONHEADER = 0x01;
var TRIGGEROFFHEADER = 0x02;
var RECORDINGHEADER = 0xAA;
/**
@constructor ModuleSingleton
singleton, only one per run of the program
every module needs to run at the beginning of the runtime to register it's interactor in the interactionManager

http://www.synthtopia.com/content/2008/05/29/glitchds-cellular-automaton-sequencer-for-the-nintendo-ds/
http://www.synthtopia.com/content/2009/04/29/game-of-life-music-sequencer/
http://www.synthtopia.com/content/2011/01/12/game-of-life-music-sequencer-for-ios-runxt-life/
*/

module.exports=function(environment){return new (function(){
  var interactorSingleton=this.InteractorSingleton=new uix16Control(environment);
  // environment.interactionMan.registerModuleInteractor(uix16Control);
  var testcount=0;
  var testGetName=function(){
    this.name=this.baseName+" "+testcount;
    testcount++;
  }
  /**
  @constructor
  the instance of the of the module, ment to be instantiated multiple times.
  require to moduleBase.call
  */
  this.Instance=function(properties){
    var noteOnTracker=new Set();
    var thisInstance=this;
    var myBitmap=0;
    moduleInstanceBase.call(this);
    this.baseName="game of life";
    testGetName.call(this);

    if(properties.name) this.name=properties.name;

    var myInteractor=new interactorSingleton.Instance(this);
    this.interactor=myInteractor;
    this.interactor.name=this.name;
    var cells=[[0,0,0,0],[0,0,0,0],[0,0,0,0],[0,0,0,0]];
    this.setStep=function(square){
      cells[Math.floor(square/4)][square%4]=1;
    }
    this.clearStep=function(square){
      cells[Math.floor(square/4)][square%4]=0;
    }
    this.toggleStep=function(square){
      var x=Math.floor(square/4);
      var y=square%4;
      // console.log(x,y);
      if(cells[x][y]==1){
        myBitmap&=~(1<<square);
        cells[x][y]=0;
      }else{
        myBitmap|=1<<square;
        cells[x][y]=1;
      }
      return myBitmap;
    }
    this.eventReceived=function(evt){
      if(evt.EventMessage.value[0]==CLOCKTICKHEADER&&(evt.EventMessage.value[2]%evt.EventMessage.value[1]==0)){
        // console.log("step");
        for(var x in cells){
          for(var y in cells[x]){
            var neighbours=0;
            x=parseFloat(x);
            y=parseFloat(y);
            var left=x-1;
            if(left==-1) left=3;
            var right=x+1;
            if(right==4) right=0;
            var top=y-1;
            if(top==-1) top=3;
            var bott = y+1;
            if(bott==4) bott=0;

            // console.log("x"+x,"y"+y,"left"+left,"right"+right,"top"+top,"bott"+bott);

            neighbours+=cells[left][top];
            neighbours+=cells[left][y];
            neighbours+=cells[left][bott];

            neighbours+=cells[x][top];
            // neighbours+=cells[x][y];
            neighbours+=cells[x][bott];

            neighbours+=cells[right][top];
            neighbours+=cells[right][y];
            neighbours+=cells[right][bott];

            if(neighbours<2||neighbours>3){
              myBitmap&=~(1<<(x*4+y));
            }else if(neighbours==3){
              myBitmap|=1<<(x*4+y);
            }
          }
        }
        for(var a=0; a<16; a++){
          var x=Math.floor(a/4);
          var y=a%4;
          cells[x][y]=myBitmap>>a&1;
        }
        this.handle('step');
      }else{
        //console.log(evt.EventMessage);
      }
    }

    this.getBitmap16=function(){

      return myBitmap;
    }
    this.delete=function(){
      for(var noff of noteOnTracker){
        thisInstance.output(noff);
        noteOnTracker.delete(noff);
      }
    }
  }
})};