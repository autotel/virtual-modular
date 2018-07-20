'use strict';
var $ = require('jquery');
var SVG = require('svg.js');

var DomSuperInteractor = function (environment) {

    var $mainEl = $("#domDraw");
    var svg = SVG('svgDraw');

    var autoPlacer = new (function (environment) {
        var links = [];
        this.update = function () {
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
                        var tension = 90;

                        var toward = {
                            x: thispos.x,
                            y: thispos.y
                        }
                        if (isInput) {
                            toward.x = otherPos.x - otherSize.width;
                            toward.y = otherPos.y;
                            var force = {
                                x: (toward.x - thispos.x),
                                y: (toward.y - thispos.y),
                            }
                            links[linkNum].forces.push(force);
                        }
                        if (isOutput) {

                            toward.x = otherPos.x + otherSize.width;
                            toward.y = otherPos.y;
                            var force = {
                                x: (toward.x - thispos.x),
                                y: (toward.y - thispos.y),
                            }
                            links[linkNum].forces.push(force);
                        }
                        // if (!(isInput || isOutput)) {

                        //trigVer
                        var d = {
                            x: thispos.x - otherPos.x,
                            y: thispos.y - otherPos.y,
                        };

                        var aan = Math.atan2(d.y, d.x);

                        // var dist = Math.sqrt(d.x ^ 2 + d.y ^ 2);
                        // console.log(dist);
                        var repel = 0.3;
                        // if(dist>sizeSum.width) repel=0.00001;
                        var distx = Math.abs(d.x);
                        var disty = Math.abs(d.y);

                        if (distx > sizeSum.width)
                            if (disty > sizeSum.height) repel = 0;
                        // if (    Math.abs(thispos.y - otherPos.y) < sizeSum.height/2 
                        //     &&  Math.abs(thispos.x - otherPos.x) < sizeSum.width/2) {
                        //     repel=0.2;
                        // }

                        links[linkNum].forces.push({
                            x: (Math.cos(aan) * sizeSum.width * repel),
                            y: (Math.sin(aan) * sizeSum.height * repel),
                        });

                        //cartesian ver, incomplere
                        var pad = 0;
                        var speed = 100;
                        // if (thispos.x + thisSize.width > otherPos.x + otherSize.width + pad) {
                        //     toward.x = thispos.x + speed;
                        // } else if (thispos.x < otherPos.x + pad + sizeSum.width) {
                        //     toward.x = thispos.x - speed;
                        // }
                        // if (Math.abs(thispos.y - otherPos.y) < sizeSum.height) {
                        //     toward.y = Math.sign(otherPos.y - thispos.y) * 10;
                        // }
                        // if (Math.abs(thispos.x - otherPos.x) < sizeSum.width) {
                        //     toward.x = Math.sign(otherPos.x - thispos.x) * 10;
                        // }

                        // }



                        links[linkNum].position = thispos;



                    } else {
                        console.warn("no dom sprite in one of these modules:",
                            [module.name, startSprite], [output.name, endSprite]);
                    }
                    // console.log("module",module.name,"->",output.name);
                }
                linkNum++;
            }
            var linkNum = 0;
            for (var link of links) {
                link.force = { x: 0, y: 0 };
                // link.forces=[];

                if (!linkNum) {
                    var cx = window.innerWidth / 8
                    var cy = window.innerHeight / 2
                    link.forces.push({ x: (cx - link.position.x) * 10, y: (cy - link.position.y) * 10 });
                }
                if (!mouse.isDragging(link.$el)) {
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
                            p.attr({ fill: "transparent", stroke: '#000', 'stroke-width': 1 });
                            linkSprites.push(p);
                        }
                        linkNum++;

                    } else {
                        console.warn("no dom sprite in one of these modules:",
                            [module.name, startSprite], [output.name, endSprite]);
                    }
                    // console.log("module",module.name,"->",output.name);
                }
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
        $el.css({ position: "absolute" });

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