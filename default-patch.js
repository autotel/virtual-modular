module.exports=[
  {
    type:'clockGenerator',
    properties:{
      name:'main clock',
      bpm:120
    },
    outputs:['global']
  },{
    type:'harmonizer',
    outputs:['default midi out','O-to DAW']
  },{
    type:'sequencer',
    outputs:[]
  },{
    type:'sequencer',
    outputs:[]
  },{
    type:'sequencer',
    outputs:[]
  },{
    type:'sequencer',
    outputs:[]
  },{
    type:'presetKit',
    properties:{
      name:'nu presetKit',
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
      kit:[
        [1,10,36,-1],[1,10,37,-1],[1,10,38,-1],[1,10,39,-1],
        [1,10,40,-1],[1,10,41,-1],[1,10,42,-1],[1,10,43,-1],
        [1,10,44,-1],[1,10,45,-1],[1,10,46,-1],[1,10,47,-1],
        [1,10,48,-1],[1,10,49,-1],[1,10,50,-1],[1,10,51,-1]
      ]
    },
    outputs:['default midi out','O-to DAW']
  },{
    type:'presetKit',
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
    type:'presetKit',
    properties:{
      kit:[
        [1,12,36,-1],[1,12,37,-1],[1,12,38,-1],[1,12,39,-1],
        [1,12,40,-1],[1,12,41,-1],[1,12,42,-1],[1,12,43,-1],
        [1,12,44,-1],[1,12,45,-1],[1,12,46,-1],[1,12,47,-1],
        [1,12,48,-1],[1,12,49,-1],[1,12,50,-1],[1,12,51,-1]
      ]
    },
    outputs:[]
  },{
    type:'multiloop',
    properties:{
      name:'test multiloop',
    },
    outputs:[]
  }
]