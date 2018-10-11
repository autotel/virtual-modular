
module.exports = function (superInteractor) {
    var $mainEl=superInteractor.$el;
    var self = this;
    var dragging = new Set();
    this.position = {
        x: 0,
        y: 0
    }
    this.isDragging = function ($el) {
        return dragging.has($el);
    }
    $mainEl.on("mousemove", function (evt) {

        self.position = {
            x: evt.clientX,
            y: evt.clientY
        }
        dragging.forEach(function ($el) {
            var off = { x: 0, y: 0 };
            if ($el.movable.draggingOffset) {
                off = $el.movable.draggingOffset;
                // console.log(off);
            }
            $el.css({ left: evt.clientX - off.x, top: evt.clientY - off.y });
        })
        // console.log("MB");

    });
    this.makeMovable = function ($el) {
        $el.movable = {};
        $el.lockPosition = false;
        var $lockButton = $('<div>');
        $lockButton.addClass('button lock');
        $lockButton.text('lock');
        $el.append($lockButton);
        $lockButton.on('click', function () {
            $el.lockPosition = $el.lockPosition == false;
        });
        $el.on('mousedown', function (evt) {
            evt.preventDefault();
            $el.addClass("dragging");
            // console.log("DRAGSTART",evt);

            var off = $el.offset();
            off.x = off.left;
            off.y = off.top;

            $el.movable.draggingOffset = {
                x: evt.clientX - off.x,
                y: evt.clientY - off.y
            };
            dragging.add($el);
        });
        $mainEl.on('mouseup mouseleave', function () {
            $el.removeClass("dragging");

            dragging.delete($el);
        });
    }
};