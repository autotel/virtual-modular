var jazz = require('jazz-midi');
var midi = new jazz.MIDI();
var name=true;
var count=0;
while(count<1){
  console.log(midi);
  name = midi.MidiInOpen(count, function(t, msg){
    console.log(msg);
  });
  if(name){
    console.log('Default MIDI-In port:', name);
  } else {
    console.log('Cannot open default MIDI-In port!');
  }
  count++;
}
