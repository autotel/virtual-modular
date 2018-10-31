module.exports=[
  {
    type: 'ClockGenerator',
    properties: {
      name: 'main clock',
      bpm: 120
    },
    outputs: ['global']
  }, {
    type: 'Chord',
    properties: {
    }
  },{
    type: "MidiIO",
    properties: {
      name: "OUT A",
      midi: "UM-1",
      loc:4
    }, outpupts: []
  }, {
    type: "MidiIO",
    properties: {
      name: "OUT B",
      midi: "chanmap B", 
    }, outpupts: []
  }, {
    type: "MidiIO",
    properties: {
      name: "OUT C",
      midi: "chanmap C",
    }, outpupts: []
  }, {
    type: "MidiIO",
    properties: {
      name: "OUT D",
      midi: "chanmap D",
    }, outpupts: []
  },{
    type:'Harmonizer',
    outputs:['OUT A']
  }, {
    type: 'PresetKit',
    properties: {
      name: 'drumkit B',
      autoMap: 'timbre',
      kit: [
        [1, 60, 0, -1]
      ],
    },
    outputs: ['OUT B']
  }, {
    type: 'PresetKit',
    properties: {
      name: 'drumkit climate',
      kit: [
        [1, 56, 0, -1],
        [1, 56, 1, -1],
        [1, 60, 2, -1],
        [4, 22, 100, 0],//control change!
        
        [1, 58, 0, -1],
        [1, 56, 5, -1],
        [1, 47, 2, -1],
        [4, 22, 100, 44],//control change!
        
        [1, 56, 8, -1],
        [1, 56, 9, -1],
        [1, 52, 2, -1],
        [1, 56, 11, -1],

        [1, 56, 12, -1],
        [1, 56, 13, -1],
        [1, 45, 2, -1],
        [1, 56, 15, -1],
      ],
    },
    outputs: ['OUT C']
  }, {
    type: 'PresetKit',
    properties: {
      name: 'drumkit D',
      autoMap: 'timbre',
      kit: [
        [1, 60, 0, -1]
      ],
    },
    outputs: ['OUT D']
  },{
    type: 'Sequencer',
    properties: {
      loc:12,
    },
    outputs: ['harmonizer 0']
  }, {
    type: 'Sequencer',
    outputs: ['main drumkit']
  }, {
    type: 'Sequencer',
    outputs: ['main drumkit']
  }, {
    type: 'Sequencer',
    outputs: ['main drumkit']
  }, 
]
