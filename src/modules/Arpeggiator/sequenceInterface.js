/*
pattern can be "user defined", up, up/dn, dn, random, etc.
if it's user defined, the sequencer is enabled allowing to program the arp steps to sequence
the problem with user defined sequencer is that it has a limit of four grades due to the size of the ui matrix
but with the "standard" ones, all the grades are reached
the user defined sequencer also ensures a time metric
the arpeggiator length in a user defined arpeggiator sequence is provided by the position of the last programmed step.
*/

module.exports=function(controlledModule){
  this.pattern=[];
  this.playhead={value:0}
  this.stepPressed=function(step,data=1){
    pattern[step]=data;
  }

  this.getBitmap=function(){
    var ret=0;
    for(var a in pattern){
      if(pattern[a]){
        ret|=1<<a;
      }
    }
    return ret;
  }

}