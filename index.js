var Polimod=require('./Polimod');
const environment=new Polimod();
//appending hardwares
// either: environment.addHardware(require("./hardwares/Calculeitor")); or:
var calculeitor = new(require("./interfaces/Calculeitor"))(environment);
var launchpad = new(require("./interfaces/LaunchpadMini"))(environment);
var liveCode = new(require("./interfaces/LiveCode"))(environment);
liveCode.setFile('./patches/live-patch.1.mod');

//thusly it becomes possible:
//var webVisualization=new(require("hardwares/WebVis"));//which can be another submodule
new(require("./Dem-modules"))(environment);

// setTimeout(environment.tests.run,300);
/*
hardware: has own functions
interactors: may be integrated in the hardware, or appended. The thing is each interactor is oriented specifically to a hardware,
hence the main interactor index knows how to append these interactors to that hardware. It makes sense
environment.hardwares.calculeitor.addInteractors({Sequencer,Narp,etc...});


*/
// console.log(environment);