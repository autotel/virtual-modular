var Observable = require('onhandlers');
module.exports = function (controlledModule, environment) {
    var self = this;
    Observable.call(this);
    var bitmapCache = 0;

    var getBitmap = function () {
        var ret = 0x0000;
        // console.log(controlledModule.patData);

        for (var step in controlledModule.patData) {
            if (controlledModule.patData[step])
                if (controlledModule.patData[step].length)
                    ret |= 1 << step;
        }

        return ret;
    }

    var mySequenceInterval = false;
    var baseEngage = this.engage;
    this.engage = function (callback) {
        baseEngage(callback);
        controlledModule.on('step', function (evt) {
            // console.log(controlledModule.currentStep);
            var msg = {
                type: "~module",
                origin: controlledModule,
                step: controlledModule.currentStep.value
            }
            var nBp = getBitmap();
            // if (nBp != bitmapCache) {
                bitmapCache = nBp;
                msg.bitmap = nBp;
                // console.log("send ~bitmap");
            // }
            callback(msg);

        });
        mySequenceInterval = setInterval(function () {

        }, 200);
    }
}