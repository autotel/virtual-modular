const ModString=require("./");
try{
  console.log(ModString.parse(`
  "main clock":{
    type: ClockGenerator
    name: 'main clock'
    bpm: 120
  }
  "main clock"->(global,"OUT A")
  ("OUT A": {
    type: "MidiIO",
    midi: "chanmap A",
  })->"main clock"
  `))
}catch(e){
  console.error(e);
}