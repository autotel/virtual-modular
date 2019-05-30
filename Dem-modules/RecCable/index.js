'use strict';
var EventMessage = require('../../Polimod/datatypes/EventMessage.js');
var headers = EventMessage.headers;
var NoteOnTracker = require('../moduleUtils/NoteOnTracker.js');
const Base= require('../Base')
var RecCable = function(properties, environment) {
    this.preventBus=true;
    var self=this;
    Base.call(this,properties,environment);
    
    this.recordingReceived = function(event) {   
        var eventMessage = event.eventMessage;
        console.log("->rec->",eventMessage.value);
        self.inputs.forEach(function(tModule){      
            var recordEventMessage=eventMessage.clone();
            tModule.recordingReceived({eventMessage:recordEventMessage,origin:this});
        });
    }

}
RecCable.color = [129, 93, 4];
module.exports = RecCable

/*
TEsting:
- does it send notes upon tap?
- does it record notes?
- does it send notes off?
- if anote is tapped, then asecond note is tapped and the first note released, does it send all the note off and on?
- if another module sends a note off, does it stop an note that is going on in the interface?
- does the note ons that are being tracked get removed when it receives note off from another module? (example recording to an arpeggiator)


*/
