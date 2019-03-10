module.exports=[
  {
    type: 'ClockGenerator',
    properties: {
      name: 'main clock',
      bpm: 120
    },
    outputs: ['global']
  }, {
    type: 'CalculeitorMidi',
    properties: {
    }
  },{
    type: "MidiIO",
    properties: {
      name: "OUT A",
      midi: "UM-1",
      loc:8
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
    outputs: ['OUT A','CalculeitorMidi 0']
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
  }
]
