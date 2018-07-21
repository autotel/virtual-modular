
var SVG = require('svg.js');
var svg = SVG('svgDraw');
// var rect = svg.rect(100, 100).attr({ fill: '#f06' });
module.exports = function (environment, superInteractor) {
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
};