module.exports=[
  {
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
    type:'Sequencer',
    outputs:[]
  },{
    type:'NoteSustainer',
    outputs:[]
  },{
    type:'PresetKit',
    properties:{
      name:'nu presetKit',
      autoMap:'note',
      kit:[
        [1,9,36,-1]
      ]
    },
    outputs:['default midi out','O-to DAW']
  },{
    type:'PresetKit',
    properties:{
      autoMap:'note',
      kit:[
        [1,10,36,-1]
      ]
    },
    outputs:['default midi out','O-to DAW']
  },{
    type:'PresetKit',
    properties:{
      autoMap:'note',
      kit:[
        [1,10,36,-1]
      ]
    },
    outputs:['default midi out','O-to DAW']
  },{
    type:'PresetKit',
    properties:{
      autoMap:'note',
      kit:[
        [1,10,36,-1]
      ]
    },
    outputs:[]
  }
]