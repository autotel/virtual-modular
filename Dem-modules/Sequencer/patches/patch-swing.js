module.exports = [
  {
    type: "MidiIO",
    properties: {
      name: "Daw send",
      midi: "DAW"
    }, outputs: []
  }, {
    type: "DelayClockBased",
    properties: {
      name: "swing delay",
    }, outputs: ['Daw send']
  }, {
    type: "RouteSequencer",
    properties: {
      name: "swing",
      bitmap: 0xF
    }, outputs: ['Daw send', 'swing delay']
  }, {
    type: "MidiIO",
    properties: {
    }, outputs: []
  }, {
    type: "MidiIO",
    properties: {
    }, outpupts: []
  }, {
    type: "MidiIO",
    properties: {
    }, outputs: []
  }, {
    type: 'ClockGenerator',
    properties: {
      name: 'main clock',
      bpm: 120
    },
    outputs: ['global']
  }, {
    type: 'Harmonizer',
    outputs: ['swing']
  }, {
    type: 'PresetKit',
    properties: {
      name: 'main drumkit',
      autoMap: 'note',
      kit: [
        [1, 36, 12, -1]
      ]
    },
    outputs: ['swing']
  }, {
    type: 'PresetKit',
    properties: {
      autoMap: 'note',
      kit: [
        [1, 36, 13, -1]
      ]
    },
    outputs: ['swing']
  }, {
    type: 'PresetKit',
    properties: {
      autoMap: 'note',
      kit: [
        [1, 36, 14, -1]
      ]
    },
    outputs: ['swing']
  }, {
    type: 'Sequencer',
    properties: {
    },
    outputs: ['harmonizer 0']
  }, {
    type: 'Sequencer',
    properties: {
    },
    outputs: ['main drumkit']
  }, {
    type: 'Sequencer',
    properties: {
    },
    outputs: ['preset kit 1']
  }, {
    type: 'Sequencer',
    properties: {
    },
    outputs: ['preset kit 2']
  },
]
