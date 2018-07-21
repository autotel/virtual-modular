Base = function (controlledModule, environment, superInteractor) {
    var mouse = superInteractor.mouse;
    var $mainEl = superInteractor.$el;

    var $el = $('<div>');
    $el.html(`<p class="modulename">${controlledModule.name}</p>`);

    $el.addClass("module");
    $el.css({ position: "absolute", top: Math.random(), left: Math.random() });

    var $patchOutEl = $('<div class="patch-out"></div>');
    var $patchInEl = $('<div class="patch-in"></div>');

    $el.append($patchInEl);
    $el.append($patchOutEl);

    mouse.makeMovable($el);

    $mainEl.append($el);

    return {
        $el: $el,
        $patchOutEl: $patchOutEl,
        $patchInEl: $patchInEl
    }
}
module.exports = Base;