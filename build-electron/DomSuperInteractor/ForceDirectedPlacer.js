
const dat = require('dat.gui');
var guiProps = {
    f: 0.5,
    linkTension: 2.3,
    vlinktension: 0.7,
    centerTension: 0.15,
    maxRepulsion: 0.32,
}
window.onload = function () {
    var gui = new dat.GUI();
    // window.datgui=gui;
    gui.closed = true;

    gui.add(guiProps, 'f', 0, 5);
    gui.add(guiProps, 'linkTension', 0, 5);
    gui.add(guiProps, 'vlinktension', 0, 5);
    gui.add(guiProps, 'centerTension', 0, 5);
    gui.add(guiProps, 'maxRepulsion', 0, 5);
};

module.exports = function (environment, superInteractor) {
    var mouse = superInteractor.mouse;
    var links = [];
    this.update = function () {

        var f = guiProps.f;
        var linkTension = f * guiProps.linkTension;
        var vlinktension = f * guiProps.vlinktension;
        var centerTension = f * guiProps.centerTension;
        var maxRepulsion = f * guiProps.maxRepulsion;

        //TODO: this needs optimization
        var linkNum = 0;
        for (var thismodule of environment.modules.list) {
            for (var othermodule of environment.modules.list) {


                var thisSprite = thismodule._instancedInterfaces.dom;
                var otherSprite = othermodule._instancedInterfaces.dom;

                if (thisSprite && otherSprite) {


                    if (!links[linkNum]) links[linkNum] = {
                        $el: thisSprite.$el,
                        forces: []
                    };

                    var isInput = thismodule.outputs.has(othermodule);
                    var isOutput = othermodule.outputs.has(thismodule);

                    function leftisx(what) {
                        return { x: what.left, y: what.top }
                    }

                    var otherPos = otherSprite.$el.position();
                    otherPos = leftisx(otherPos);

                    var thispos = thisSprite.$el.position();
                    thispos = leftisx(thispos);

                    var thisSize = {
                        width: thisSprite.$el.width(),
                        height: thisSprite.$el.height(),
                    }
                    var otherSize = {
                        width: otherSprite.$el.width(),
                        height: otherSprite.$el.height(),
                    }
                    var sizeSum = {
                        width: thisSize.width + otherSize.width,
                        height: thisSize.height + otherSize.height,
                    };


                    var toward = {
                        x: thispos.x,
                        y: thispos.y
                    }
                    if (isInput) {
                        toward.x = otherPos.x - otherSize.width;
                        toward.y = otherPos.y;
                        var force = {
                            x: (toward.x - thispos.x) * linkTension,
                            y: (toward.y - thispos.y) * linkTension * vlinktension,
                        }
                        links[linkNum].forces.push(force);
                    }
                    if (isOutput) {

                        toward.x = otherPos.x + otherSize.width;
                        toward.y = otherPos.y;
                        var force = {
                            x: (toward.x - thispos.x) * linkTension,
                            y: (toward.y - thispos.y) * linkTension * vlinktension,
                        }
                        links[linkNum].forces.push(force);
                    }
                    var d = {
                        x: thispos.x - otherPos.x,
                        y: thispos.y - otherPos.y,
                    };

                    var aan = Math.atan2(d.y, d.x);
                    var repel = 0.3;
                    var distx = Math.abs(d.x);
                    var disty = Math.abs(d.y);
                    repel = Math.min(maxRepulsion, 0.0001 + (Math.sqrt((d.x * d.x) + (d.y * d.y))))
                    links[linkNum].forces.push({
                        x: (Math.cos(aan) * sizeSum.width * repel),
                        y: (Math.sin(aan) * sizeSum.height * repel),
                    });
                    links[linkNum].position = thispos;

                } else {
                    console.warn("no dom sprite in one of these modules:",
                        [module.name, startSprite], [output.name, endSprite]);
                }
            }
            linkNum++;
        }
        var linkNum = 0;
        for (var link of links) {
            link.force = { x: 0, y: 0 };
            // link.forces=[];
            // 
            // if (!linkNum) {
            var cx = window.innerWidth / 3
            var cy = window.innerHeight / 2
            link.forces.push({ x: (cx - link.position.x) * centerTension, y: (cy - link.position.y) * centerTension });
            // }
            if (!(mouse.isDragging(link.$el) || link.$el.lockPosition)) {
                for (var force of link.forces) {
                    link.force.x += force.x / link.forces.length;
                    link.force.y += force.y / link.forces.length;
                }
                link.forces = [];
                // console.log(link.force.x);
                link.$el.css({
                    left: link.position.x + link.force.x,
                    top: link.position.y + link.force.y
                });
            }
            linkNum++;
        }
    }
    // setInterval(this.update, 200);
};