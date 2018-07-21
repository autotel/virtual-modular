var Base = require('./Base');
module.exports = function (controlledModule, environment, superInteractor) {
    let ext = Base.call(this, controlledModule, environment, superInteractor);
    // var mouse = superInteractor.mouse;

    let $el = ext.$el;
    this.$patchInEl = ext.$patchInEl;
    this.$patchOutEl = ext.$patchOutEl;
    this.$el = $el;

    $el.addClass("harmonizer");
    $el.css({ width: 100 });
    let $keyboardEl = $('<p></p>');
    $el.append($keyboardEl);
    let updateKeyboard = function () {
        var currentScale = controlledModule.currentScale;
        var map = controlledModule.getScaleMap(currentScale);
        var scaleName = controlledModule.getScaleName(currentScale);
        var str = scaleName + "<br />" + map.toString(2);
        $keyboardEl.html(str);
    }

    controlledModule.on('chordchange', updateKeyboard);
    updateKeyboard();

}