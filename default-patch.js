module.exports=[
  {
    type:'ClockGenerator',
    properties:{
      name:'main clock',
      bpm:120
    },
    outputs:[]
  },{
    type:'Harmonizer',
    outputs:['default midi out','O-to DAW']
  },{
    type:'Sequencer',
    outputs:[]
  },{
    type:'Bouncer',
    outputs:['O-to DAW']
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
      kit:[
        [1,11,36,-1],[1,11,37,-1],[1,11,38,-1],[1,11,39,-1],
        [1,11,40,-1],[1,11,41,-1],[1,11,42,-1],[1,11,43,-1],
        [1,11,44,-1],[1,11,45,-1],[1,11,46,-1],[1,11,47,-1],
        [1,11,48,-1],[1,11,49,-1],[1,11,50,-1],[1,11,51,-1]
      ]
    },
    outputs:['default midi out','O-to DAW']
  },{
    type:'PresetKit',
    properties:{
      kit:[
        [1,12,36,-1],[1,12,37,-1],[1,12,38,-1],[1,12,39,-1],
        [1,12,40,-1],[1,12,41,-1],[1,12,42,-1],[1,12,43,-1],
        [1,12,44,-1],[1,12,45,-1],[1,12,46,-1],[1,12,47,-1],
        [1,12,48,-1],[1,12,49,-1],[1,12,50,-1],[1,12,51,-1]
      ]
    },
    outputs:[]
  }
]