'use strict';
var $ = require('jquery');
var SVG = require('svg.js');
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

    gui.add(guiProps, 'f',0,5);
    gui.add(guiProps, 'linkTension',0,5);
    gui.add(guiProps, 'vlinktension',0,5);
    gui.add(guiProps, 'centerTension',0,5);
    gui.add(guiProps, 'maxRepulsion',0,5);
};


var DomSuperInteractor = function (environment) {

    var $mainEl = $("#domDraw");
    var svg = SVG('svgDraw');

    
    var autoPlacer = new (function (environment) {
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
    })(environment);
    // var rect = svg.rect(100, 100).attr({ fill: '#f06' });
    var connectorDrawer = new (function (environment) {
        var linkSprites = [];
        this.update = function () {
            var linkNum = 0;
            for (var module of environment.modules.list) {
                for (var output of module.outputs) {
                    var startSprite = module._instancedInterfaces.dom;
                    var endSprite = output._instancedInterfaces.dom;
                    if (startSprite && endSprite) {

                        var startpos = startSprite.$patchOutEl.offset();
                        var endpos = endSprite.$patchInEl.offset();
                        startpos.x = startpos.left;
                        startpos.y = startpos.top;
                        endpos.x = endpos.left;
                        endpos.y = endpos.top;
                        var tension = 30;
                        var pstr = `M${startpos.x} ${startpos.y} C ${startpos.x + tension} ${startpos.y},${endpos.x - tension} ${endpos.y}, ${endpos.x} ${endpos.y}`;
                        if (linkSprites[linkNum]) {
                            linkSprites[linkNum].plot(pstr)
                        } else {
                            var p = svg.path(pstr);
                            linkSprites[linkNum] = (p);
                        }
                        linkSprites[linkNum].attr({ fill: "transparent", stroke: '#000', 'stroke-width': 1 });
                        linkNum++;

                    } else {
                        console.warn("no dom sprite in one of these modules:",
                            [module.name, startSprite], [output.name, endSprite]);
                    }
                    // console.log("module",module.name,"->",output.name);
                }
            }
            //hide the remaining links
            while (linkNum < linkSprites.length) {
                linkSprites[linkNum].attr({ fill: "transparent", stroke: 'transparent', 'stroke-width': 0 });
                linkNum++;
            }
        }
        // setInterval(this.update, 200);
    })(environment);

    var mouse = new (function () {
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
    })();

    var Sprites = {};
    Sprites.Base = function (controlledModule, environment) {
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
    Sprites.Sequencer = function (controlledModule, environment) {
        let ext = Sprites.Base.call(this, controlledModule, environment);
        let $el = ext.$el;
        this.$patchInEl = ext.$patchInEl;
        this.$patchOutEl = ext.$patchOutEl;
        this.$el = $el;

        $el.addClass("sequencer");
        $el.css({ width: 300 });
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

    var moduleInstances = environment.modules.list;
    var newModuleCallback = function (evt) {
        if (evt.module)
            if (evt.module._instancedInterfaces)
                if (evt.module._instancedInterfaces.dom) return;
        var sprite = false;
        if (Sprites[evt.module.type]) {
            sprite = new Sprites[evt.module.type](evt.module, environment);
        } else {
            sprite = new Sprites.Base(evt.module, environment);
        }
        if (!evt.module._instancedInterfaces) evt.module._instancedInterfaces = {};
        evt.module._instancedInterfaces.dom = sprite;
    }
    environment.on('created', function () {
        console.log("DOMSUPER CREATED");
        environment.on('+ module', newModuleCallback);
        for (var mm of environment.modules.list) {
            newModuleCallback({ module: mm });
        }

        var upfn = function () {
            connectorDrawer.update();
            autoPlacer.update();
            requestAnimationFrame(upfn);
        };
        upfn();
    });

    environment.on('- module', function (evt) {
        console.log("DOMSUPER", evt);
    });
    environment.on('~ module', function (evt) {
        console.log("DOMSUPER", evt);
    });
}
module.exports = DomSuperInteractor;