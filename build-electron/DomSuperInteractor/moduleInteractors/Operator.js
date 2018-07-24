var Base = require('./Base');
module.exports = function (controlledModule, environment, superInteractor) {
    let ext = Base.call(this, controlledModule, environment, superInteractor);
    // var mouse = superInteractor.mouse;

    let $el = ext.$el;
    this.$patchInEl = ext.$patchInEl;
    this.$patchOutEl = ext.$patchOutEl;
    this.$el = $el;

    $el.addClass("operator");
    $el.css({ width: 100 });
    let $operationEl = $('<p class="monospace"></p>');
    $el.append($operationEl);
    let updateOp = function () {
        var opNames = controlledModule.opMap.map(function (val, i) {
            if (!val) return "--";
            return controlledModule.opNames[val] + controlledModule.baseEventMessage.value[i];
        })
        var str = "[" + opNames.toString() + "]";
        $operationEl.html(str);
    }

    controlledModule.on('~', updateOp);
    updateOp();

}