/*
This module should allow to route signals from module (e.g. sequencer) into midi.
The options are:
* map each number to a midi note in an fixed channel
* map each number to a channel in a fixed midi note
* map each number to a channel to an optional note with a fixed fallback note (transparent)
* map each number to a custom individual midi event (with transparency options)

*/