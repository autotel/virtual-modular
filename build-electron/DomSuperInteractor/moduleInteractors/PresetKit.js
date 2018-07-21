var Base = require('./Base');
module.exports = function (controlledModule, environment, superInteractor) {
    let ext = Base.call(this, controlledModule, environment, superInteractor);
    // var mouse = superInteractor.mouse;

    let $el = ext.$el;
    this.$patchInEl = ext.$patchInEl;
    this.$patchOutEl = ext.$patchOutEl;
    this.$el = $el;

    $el.addClass("presetkit");
    $el.css({ width: 100 });
    let $kitEl = $('<p></p>');
    $el.append($kitEl);
    let updateSequence = function () {
        var str = "";
        var stepn = ' [_]';
        for (var step = 0; step < 16; step++) {
            str += stepn;
        }
        $kitEl.text(str);
    }

    controlledModule.on('step', updateSequence);
    updateSequence();

}