var Observable = require('onhandlers');
module.exports = function (controlledModule, environment) {
    var self = this;
    Observable.call(this);
    var bitmapCache = 0;

    var tBitmap=function(){
        

        var playHeadBmp = 0x1111;
        var int = (
                controlledModule.sequenceBitmap.value 
                >> controlledModule.clock.step
            ) & playHeadBmp;
        return int | int>>3 | int>>6 | int>>9;
    }

    var mySequenceInterval = false;
    var baseEngage = this.engage;
    this.engage = function (callback) {
        baseEngage(callback);
        controlledModule.on("step",function () {
            callback({
                type:'~module', 
                steps: 4,
                // step:controlledModule.clock.step, not used, instead I send currently on
                bitmap: tBitmap(),//controlledModule.sequenceBitmap.value,
                origin:controlledModule
            });
        });
    }
}