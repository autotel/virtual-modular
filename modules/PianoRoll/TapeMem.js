var EventMessage = require('../../datatypes/EventMessage.js');
var Observable = require('onhandlers');
var TRIGGERONHEADER = 0x01;
var TRIGGEROFFHEADER = 0x02;

var TapeMem=function(props={}){
    Observable.call(this);
    var self=this;
    var lastFrame=0;
    //resolution
    var framesPerStep=96;
    var memory={};
    var currentFrame=0;
    var loopLength=0;
    var loopStart=0;
    var loopEnd=0;
    var notesOn=new Set();
    // var loopLastFrame=0;
    function stepToFrame(step){
        return Math.round(step*framesPerStep);
    }
    function frameToStep(frame){
        return frame/framesPerStep;
    }
    //stepIncrement should come as a float, it will be quantized back to array index using framesPerStep
    //it represents steps to advance, and portions of it.
    // var teststep=0;
    this.tapeFrame=function(stepIncrement){
        var frameIncrement = stepToFrame(stepIncrement);
        // console.log(stepIncrement%frameIncrement);
        currentFrame = lastFrame + frameIncrement;
        // console.log(currentFrame%(framesPerStep/12));
        // if(currentFrame%framesPerStep==0){
        //     console.log("STEP int", teststep++);
        // }
        if(currentFrame>=loopEnd) currentFrame=loopStart;
        //scan all memory from last frame to current frame and trigger all those events.
        //...
        var eventsInRange = [];
        var framesInRange = self.getFrameRange(currentFrame,currentFrame+frameIncrement-1);
        for(var frevli in framesInRange){
            var frevl=framesInRange[frevli];
            eventsInRange=eventsInRange.concat(frevl);
        }
        
        eventsInRange.map(function(evt){
            if(evt.value[0]==TRIGGERONHEADER){
                notesOn.add(evt);
                if(!evt.duration){
                    console.warn("note on without duration in tape:",evt);
                    evt.duration=framesPerStep;
                }
            }
        });
        // console.log("FRAME");
        notesOn.forEach(function(note){
            if(!note.life) note.life= note.duration;
            note.life-=frameIncrement;
            // var trst="";
            // for(var a=0; a<note.life; a+=4){
            //     trst+="-";
            // }
            // console.log("NON",trst);
            
            if (note.life <= 0) { 
                var noff = note.clone();
                noff.value[0] = TRIGGEROFFHEADER;
                eventsInRange.push(noff) 
                notesOn.delete(note);
            };
        });

        lastFrame=currentFrame;
        self.eventTriggerFunction(eventsInRange);
        // console.log("currentFrame",stepToFrame(stepIncrement),currentFrame);
    }
    this.setLoopPoints=function(start,end){
        loopEnd=stepToFrame(end);
        // loopLastFrame=loopEnd-1;
        loopStart=stepToFrame(start);
        loopLength=loopEnd-loopStart;
    }
    this.eventTriggerFunction=function(eventsList){

    }
    var noteOnRecordTracker={};
    this.recordEvent=function(event){
        var eventFrame=currentFrame;
        if (event.value[0] == TRIGGERONHEADER) {
            noteOnRecordTracker[event.value[1],event.value[2]]=event;
            event.started=currentFrame;
            return;
        } else if (event.value[0] = TRIGGEROFFHEADER) {
            event=noteOnRecordTracker[event.value[1],event.value[2]];
            if(!event) return;
            if(event.started!==undefined) {
                var countFrame=currentFrame;
                //wraparound loop
                while(countFrame<event.started){
                    countFrame+=Math.abs(loopLength);
                }
                event.duration = countFrame-event.started
                console.log("event duration", Math.round(frameToStep(event.duration)));
                
                eventFrame=event.started;
            }
            delete noteOnRecordTracker[event.value[1], event.value[2]];
        }
        if(!memory[eventFrame])memory[eventFrame]=[];
        // console.log("REC",eventFrame,event.value,event.duration)
        memory[eventFrame].push(event);
        self.handle('changed',{added:[event]});
        return event;
    }
    this.addEvent=function(event,step){
        var frame=stepToFrame(step);
        if (!memory[frame]) memory[frame] = [];
        memory[frame].push(event);
        self.handle('changed',{added:[event]});
        return event;
    }
    this.removeEvent=function(event){
        for(var frame in memory){
            var memfr=memory[frame];
            var eventLoc = memfr.indexOf(event);
            if(eventLoc!==-1){
                foundEvent = memfr.splice(eventLoc,1);
            }
        }
        self.handle('changed',{removed:[event]});
    }
    this.clearStepRange = function (start,end) {
        var firstFrame = stepToFrame(start);
        var lastFrame = stepToFrame(end);
        var removed = [];
        for (var index in memory) {
            if (index > firstFrame && index < lastFrame) {
                removed=removed.concat(memory[index]);
                delete memory[index];
            }
        }
        self.handle('changed', { removed: removed });
    }
    this.clearStep=function(step){
        self.clearStepRange(step,step+1);
    }
    this.getStepRange=function(start,end,quantization=false){
        var frameStart = stepToFrame(start);
        var frameEnd = stepToFrame(end);
        var ret = self.getFrameRange(frameStart, frameEnd-1);
        if(quantization){
            var qret={};
            for(var stindex in ret){
                var round=Math.round(stindex*quantization)/quantization;
                if(!qret[round])qret[round]=[];
                if(!isNaN(round)){
                    qret[round] = qret[round].concat(ret[stindex]);
                }
            
            }
            // console.log("QINDEX",qret);
            return qret
        }
        return ret;
    }
    this.getFrameRange=function(frameStart,frameEnd){
        var ret = {}
        for (var index in memory) {
            if (index >= frameStart && index <= frameEnd) {
                var thisStep = frameToStep(index);
                var thisRelativeStep = thisStep - frameStart;
                ret[thisRelativeStep] = memory[index];
            }
        }
        return ret;
    }
}
module.exports=TapeMem;