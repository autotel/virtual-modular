const Base=  require('./Base');
var btnArray=require('./utils/btnArray');
module.exports = function (controlledModule, environment, superInteractor) {
    let ext = Base.call(this, controlledModule, environment, superInteractor);
    // var mouse = superInteractor.mouse;

    let $el = ext.$el;
    this.$patchInEl = ext.$patchInEl;
    this.$patchOutEl = ext.$patchOutEl;
    this.$el = $el;

    $el.addClass("sequencer");
    $el.css({ width: 275 });
    let $seqEl = $('<p class="monospace"></p>');
    $el.append($seqEl);

    let updateSequence = function () {
        var playHead = controlledModule.currentStep.value;
        var loopLength = controlledModule.loopLength.value;
        var patData = controlledModule.patData;
        var arr=new Array(loopLength % 127);
        arr.fill(false);
        arr[playHead]="white";
        for(var step in patData){
            if (patData[step]) if (patData[step].length){
                arr[step]=true;
            }
        }
        var $bnts = $( btnArray(arr) );
        $bnts.css({width:30, margin:2, cursor:"pointer"});
        $seqEl.html('');
        $seqEl.append($bnts);
    }

    controlledModule.on('step', updateSequence);
    updateSequence();

}