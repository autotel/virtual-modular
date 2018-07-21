var Base = require('./Base');
module.exports = function (controlledModule, environment, superInteractor) {
    let ext = Base.call(this, controlledModule, environment, superInteractor);
    // var mouse = superInteractor.mouse;

    let $el = ext.$el;
    this.$patchInEl = ext.$patchInEl;
    this.$patchOutEl = ext.$patchOutEl;
    this.$el = $el;

    $el.addClass("sequencer");
    $el.css({ width: 180 });
    let $seqEl = $('<p></p>');
    $el.append($seqEl);
    let updateSequence = function () {
        var str = "";
        var stepn = ' [_]';
        var stepc = ' [x]';
        var steph = ' [+]';
        var stepch = ' [*]';
        var playHead = controlledModule.currentStep.value;
        var loopLength = controlledModule.loopLength.value;
        for (var step = 0; step < loopLength; step++) {
            if (step == playHead) {
                str += stepc;
            } else {
                str += stepn;
            }
        }
        $seqEl.text(str);
    }

    controlledModule.on('step', updateSequence);
    updateSequence();

}