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

    var clock=this.clock={subSteps:4,subStep:0}

    moduleInstanceBase.call(this);
    this.baseName="game of life";
    testGetName.call(this);
    if(properties.name) this.name=properties.name;

    var baseEventMessage=this.baseEventMessage= new EventMessage({value:[TRIGGERONHEADER,-1,-1,-1]});
    var myInteractor=new interactorSingleton.Instance(this);
    this.interactor=myInteractor;
    this.interactor.name=this.name;
    var cells=[[0,0,0,0],[0,0,0,0],[0,0,0,0],[0,0,0,0]];
    var fixedCells=0;
    var setStep= this.setStep=function(square){
      // console.log("st",square);
      myBitmap|=1<<square;
      cells[Math.floor(square/4)][square%4]=1;
    }
    var clearStep= this.clearStep=function(square){
      myBitmap&=~(1<<square);
      cells[Math.floor(square/4)][square%4]=0;
    }

    var toggleStep= this.toggleStep=function(square){
      var x=Math.floor(square/4);
      var y=square%4;
      // console.log(x,y);
      if(cells[x][y]==1){

        clearStep(square);
      }else{

        setStep(square);
      }
      return myBitmap;
    }

    var setFixedStep= this.setFixedStep=function(square){
      fixedCells|=1<<square;
      setStep(square);
    }
    var clearFixedStep= this.clearFixedStep=function(square){
      fixedCells&=~(1<<square);
      clearStep(square);
    }
    var toggleFixedStep= this.toggleFixedStep=function(square){
      var x=Math.floor(square/4);
      var y=square%4;
      if(cells[x][y]){
        clearFixedStep(square);
      }else{
        setFixedStep(square);
      }
      return myBitmap;
    }

    this.cellOutput=function(x,y,val){
      if(self.mute) return;
      if(val){
        baseEventMessage.value[2]=x*4+y;
        thisInstance.output(baseEventMessage);
      }else{

      }
    }

    this.eventReceived=function(evt){
      if(evt.eventMessage.value[0]==CLOCKTICKHEADER&&(evt.eventMessage.value[2]%evt.eventMessage.value[1]==0)){
        clock.subStep++;
        if(clock.subStep>=clock.subSteps){
          clock.subStep=0;
          cellOperation();
          this.handle('step');
        }
      }else if(evt.eventMessage.value[0]==TRIGGERONHEADER){
        // this.setFixedStep(evt.eventMessage.value[2]%16);
        this.setStep(evt.eventMessage.value[2]%16);
      }else if(evt.eventMessage.value[0]==TRIGGEROFFHEADER){
        // this.clearFixedStep(evt.eventMessage.value[2]%16);
      }else if(evt.eventMessage.value[0]==TRIGGEROFFHEADER+1){
        // this.setStep(evt.eventMessage.value[2]%16);
      }else if(evt.eventMessage.value[0]==RECORDINGHEADER){
        evt.eventMessage.value.shift();
        thisInstance.eventReceived(evt);
        // if(evt.eventMessage.value[0]==TRIGGERONHEADER){
        //   this.setFixedStep(evt.eventMessage.value[2]%16);
        // }else  if(evt.eventMessage.value[0]==TRIGGEROFFHEADER){
        //   this.clearFixedStep(evt.eventMessage.value[2]%16);
        // }
      }else{
      }
    }

    this.getBitmap16=function(){
      return myBitmap;
    }
    this.delete=function(){
      for(var noff of noteOnTracker){
        thisInstance.output(noff,true);
        noteOnTracker.delete(noff);
      }
      return true;
    }

    function cellOperation(){
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

          var linearCord=(x*4+y);

          // if(fixedCells &(1<<linearCord)){
          //   cells[x][y]=1;
          //   myBitmap|=1<<linearCord;
          // }else{
            if(neighbours<2||neighbours>3){
              myBitmap&=~(1<<linearCord);
            }else if(neighbours==3){
              myBitmap|=1<<linearCord;
            }
          // }
        }
      }
      // myBitmap|=fixedCells;
      for(var a=0; a<16; a++){
        var x=Math.floor(a/4);
        var y=a%4;
        var set=myBitmap>>a&1;
        cells[x][y]=set;
        thisInstance.cellOutput(x,y,set>0);
      }
    }
  }
})};