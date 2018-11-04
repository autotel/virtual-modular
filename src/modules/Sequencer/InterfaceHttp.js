// var Base=require('../../interaction/http-server/InteractorBase.js');
module.exports = function (controlledModule, environment) {
    var self=this;
    self.callback=function(){};
    var c=0;
    console.log("HTTP int created");
    setInterval(function(){
        self.callback({name:"test"+c});
        c++;
    });
}
