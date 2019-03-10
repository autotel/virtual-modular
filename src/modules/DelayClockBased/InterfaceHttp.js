var Observable = require('onhandlers');
module.exports = function (controlledModule, environment) {
    var self = this;
    Observable.call(this);
    var bitmapCache = 0;

    

    var mySequenceInterval = false;
    var baseEngage = this.engage;
    this.engage = function (callback) {
        baseEngage(callback);
        mySequenceInterval = setInterval(function () {
            controlledModule.handle('~module', { 
                steps: controlledModule.memory.size 
            });
        }, 200);
    }
}