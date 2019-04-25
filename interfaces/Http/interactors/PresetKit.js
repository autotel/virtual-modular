var Observable = require('onhandlers');
module.exports = function (controlledModule, environment) {
    var self = this;
    Observable.call(this);
    var baseEngage = this.engage;
    this.engage = function (callback) {
        baseEngage(callback);
        controlledModule.on('bitmap-triggered', function (evt) {
            callback({
                type: "~module",
                origin: controlledModule,
                bitmap: evt.bitmap
            });

        });
    }
}
