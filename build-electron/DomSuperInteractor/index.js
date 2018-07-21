'use strict';
window.$ = require('jquery');
var Mouse = require('./Mouse');
var ForceDirectedPlacer=require('./ForceDirectedPlacer');
var LinksRenderer=require('./LinksRenderer');
var Sprites = {
    Base: require('./moduleInteractors/Base'),
    Sequencer: require('./moduleInteractors/Sequencer'),
    PresetKit: require('./moduleInteractors/PresetKit'),
    Harmonizer: require('./moduleInteractors/Harmonizer'),
    Operator: require('./moduleInteractors/Operator'),
}



var DomSuperInteractor = function (environment) {
    var self = this;
    this.$el = $("#domDraw");
    
    this.mouse=new Mouse(self);
    
    var autoPlacer=new ForceDirectedPlacer(environment,self);
    
    var connectorDrawer=new LinksRenderer(environment,self);


    var moduleInstances = environment.modules.list;
    var newModuleCallback = function (evt) {
        if (evt.module)
            if (evt.module._instancedInterfaces)
                if (evt.module._instancedInterfaces.dom) return;
        var sprite = false;
        if (Sprites[evt.module.type]) {
            sprite = new Sprites[evt.module.type](evt.module, environment, self);
        } else {
            sprite = new Sprites.Base(evt.module, environment, self);
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