module.exports=[
  {
    type:'clockGenerator',
    properties:{
      name:'main clock',
      bpm:120
    },
    outputs:['default sequencer']
  },{
    type:'sequencer',
    properties:{
      name:'default sequencer',
    },
    outputs:['default presetKit']
  },{
    type:'presetKit',
    properties:{
      name:'default presetKit',
      kit:[
        [1,9,36,100],[1,9,37,100],[1,9,38,100],[1,9,39,100],
        [1,9,40,100],[1,9,41,100],[1,9,42,100],[1,9,43,100],
        [1,9,44,100],[1,9,45,100],[1,9,46,100],[1,9,47,100],
        [1,9,48,100],[1,9,49,100],[1,9,50,100],[1,9,51,100]
      ]
    },
    outputs:['default midi out']
  }
]