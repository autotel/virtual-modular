const Base=  require('./Base');
var btnArray = require('./utils/btnArray');

module.exports = function (controlledModule, environment, superInteractor) {
    let ext = Base.call(this, controlledModule, environment, superInteractor);
    // var mouse = superInteractor.mouse;

    let $el = ext.$el;
    this.$patchInEl = ext.$patchInEl;
    this.$patchOutEl = ext.$patchOutEl;
    this.$el = $el;

    $el.addClass("presetkit");
    $el.css({ width: 150 });
    let $kitEl = $('<p class="monospace"></p>');
    $el.append($kitEl);
    let updateSequence = function () {

        var arr = new Array(16);
        arr.fill("white");

        var $bnts = $(btnArray(arr));
        $bnts.css({ width: 36, margin:"-3px 0px" });
        $kitEl.html("");
        $kitEl.append($bnts);
    }

    // controlledModule.on('step', updateSequence);
    updateSequence();

}