module.exports=[
  {
    type: "MidiIO",
    properties: {
      name: "OUT A",
      midi: "UM-1"
    }, outpupts: []
  }, {
    type: "MidiIO",
    properties: {
      name: "OUT B",
      midi: "chanmap B"
    }, outpupts: []
  }, {
    type: "MidiIO",
    properties: {
      name: "OUT C",
      midi: "chanmap C"
    }, outpupts: []
  }, {
    type: "MidiIO",
    properties: {
      name: "OUT D",
      midi: "chanmap D"
    }, outpupts: []
  },{
    type:'ClockGenerator',
    properties:{
      name:'main clock',
      bpm:120
    },
    outputs:['global']
  },{
    type:'Harmonizer',
    outputs:['OUT A']
  }, {
    type: 'PresetKit',
    properties: {
      name: 'main drumkit',
      autoMap: 'timbre',
      kit: [
        [1, 60, 0, -1]
      ]
    },
    outputs: ['OUT B']
  }, {
    type: 'PresetKit',
    properties: {
      name: 'main drumkit',
      autoMap: 'timbre',
      kit: [
        [1, 60, 0, -1]
      ]
    },
    outputs: ['OUT C']
  }, {
    type: 'PresetKit',
    properties: {
      name: 'main drumkit',
      autoMap: 'timbre',
      kit: [
        [1, 60, 0, -1]
      ]
    },
    outputs: ['OUT D']
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
  }, 
]
