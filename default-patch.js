module.exports=[
  {
    type:'clockGenerator',
    properties:{
      name:'main clock',
      bpm:120
    },
    outputs:['default sequencer','test tape']
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
        [1,9,36,-1],[1,9,37,-1],[1,9,38,-1],[1,9,39,-1],
        [1,9,40,-1],[1,9,41,-1],[1,9,42,-1],[1,9,43,-1],
        [1,9,44,-1],[1,9,45,-1],[1,9,46,-1],[1,9,47,-1],
        [1,9,48,-1],[1,9,49,-1],[1,9,50,-1],[1,9,51,-1]
      ]
    },
    outputs:['default midi out','O-to DAW']
  },{
    type:'presetKit',
    properties:{
      name:'seq PresetKit',
      kit:[
        [1,0,0,-1]
      ]
    },
    outputs:['default sequencer']
  },{
    type:'tape',
    properties:{
      name:'test tape',
    },
    outputs:[]
  }
]