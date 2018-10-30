module.exports=[
  {
    type: 'ClockGenerator',
    properties: {
      name: 'main clock',
      bpm: 120
    },
    outputs: ['global']
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
      name: 'drumkit C',
      autoMap: 'timbre',
      kit: [
        [1, 60, 0, -1]
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
