var EventMessage = require('../../datatypes/EventMessage');
var headers = EventMessage.headers;
var Note = function (props) {
    var self=this;
    if(!props) props={};
    if (props.value) {
        props.value[0] = headers.triggerOn;
    }else{
        props.value=[headers.triggerOn,-1,-1,-1]
    }

    EventMessage.call(this, props);
    this.noteOff = function () {
        self.value[0] = headers.triggerOff;
        var ret = self.clone();
        return ret;
    }
    this.noteOn = function () {
        self.value[0] = headers.triggerOn;
        var ret = self.clone();
        return ret;
    }
    this.note = function (to) {
        if (to !== undefined) self.value[1] = to;
        return self.value[1];
    }
    this.timbre = function (to) {
        if (to !== undefined) self.value[2] = to;
        return self.value[2];
    }
    this.velo = function (to) {
        if (to !== undefined) self.value[3] = to;
        return self.value[3];
    }
}
module.exports=Note;