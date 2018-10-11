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
      name:"sync in",
      midi:"to sequencer"
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
      name:'main drumkit',
      autoMap:'timbre',
      kit:[
        [1,60,0,-1]
      ]
    },
    outputs:['Daw send']
  },{
    type: 'Sequencer',
    properties: {
    },
    outputs: ['harmonizer 0']
  }, {
    type: 'Sequencer',
    properties: {
    },
    outputs: ['main drumkit']
  }, {
    type: 'Sequencer',
    properties: {
    },
    outputs: ['preset kit 1']
  }, {
    type: 'Sequencer',
    properties: {
    },
    outputs: ['preset kit 2']
  }, 
]
