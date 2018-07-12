module.exports=[
  {
    type:"MidiIO",
    properties:{
      name:"Daw send",
      midi:"DAW"
    },outpupts:[]
  },{
    type:"MidiIO",
    properties:{
      name:"to beatslicer",
      midi:"to beatslicer"
    },outpupts:[]
  },{
    type:'ClockGenerator',
    properties:{
      name:'main clock',
      bpm:120
    },
    outputs:['global']
  },{
    type:'Harmonizer',
    outputs:['Daw send']
  },{
    type:'PresetKit',
    properties:{
      name:'nu presetKit',
      autoMap:'note',
      kit:[
        [1,36,12,-1]
      ]
    },
    outputs:['Daw send']
  },{
    type:'PresetKit',
    properties:{
      autoMap:'note',
      kit:[
        [1,36,13,-1]
      ]
    },
    outputs:['Daw send']
  },{
    type:'PresetKit',
    properties:{
      autoMap:'note',
      kit:[
        [1,36,14,-1]
      ]
    },
    outputs:['Daw send']
  }, {
    type: 'Alteration',
    properties: {
    },
    outputs: ['Daw send']
  }, {
    type: 'Chord',
    properties: {
    },
    outputs: ['Daw send']
  },
]
