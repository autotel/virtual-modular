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
      name:"Sync clock",
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
    outputs:['default midi out','O-to DAW']
  },{
    type:'PresetKit',
    properties:{
      name:'nu presetKit',
      autoMap:'note',
      kit:[
        [1,12,36,-1]
      ]
    },
    outputs:['default midi out','O-to DAW']
  },{
    type:'PresetKit',
    properties:{
      autoMap:'note',
      kit:[
        [1,13,36,-1]
      ]
    },
    outputs:['default midi out','O-to DAW']
  },{
    type:'PresetKit',
    properties:{
      autoMap:'note',
      kit:[
        [1,14,36,-1]
      ]
    },
    outputs:['default midi out','O-to DAW']
  },{
    type:'PresetKit',
    properties:{
      autoMap:'note',
      kit:[
        [1,15,36,-1]
      ]
    },
    outputs:[]
  }
]