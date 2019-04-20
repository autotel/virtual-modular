var Polimod=require('./Polimod');
const environment=new Polimod();
//appending hardwares
// either: environment.addHardware(require("./hardwares/Calculeitor")); or:
var calculeitor = new(require("./hardwares/Calculeitor"))(environment);
//thusly it becomes possible:
//var webVisualization=new(require("hardwares/WebVis"));//which can be another submodule
new(require("./interactors/Calculeitor"))(environment);

/*
hardware: has own functions
interactors: may be integrated in the hardware, or appended. The thing is each interactor is oriented specifically to a hardware,
hence the main interactor index knows how to append these interactors to that hardware. It makes sense
environment.hardwares.calculeitor.addInteractors({Sequencer,Narp,etc...});


*/
