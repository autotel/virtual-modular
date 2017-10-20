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
        [1,0,60,100],[1,1,60,100],[1,2,60,100],[1,3,60,100],
        [1,0,61,100],[1,1,61,100],[1,2,61,100],[1,3,61,100],
        [1,0,62,100],[1,1,62,100],[1,2,62,100],[1,3,62,100],
        [1,0,63,100],[1,1,63,100],[1,2,63,100],[1,3,63,100]
      ]
    },
    outputs:['default midi out']
  }
]