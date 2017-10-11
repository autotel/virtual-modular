/*

x00: clock tick
x01: trigger one preset given by the data 2 number, until note off (NI.! all headers give
x02: send note off from one preset given by the data 2 number *2
x04: trigger one preset given by the data 2 number, and hold that note on until the amount of
*/

module.exports=[
  {
    "triggerNoteOn":0x01,
    "triggerNoteOff":0x02
  },
]