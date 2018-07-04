var EventMessage = require('../../datatypes/EventMessage.js');
var Observable = require('onhandlers');
var headers = EventMessage.headers;

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
        if(currentFrame>=loopEnd) currentFrame=loopStart;
        
        if(currentFrame%framesPerStep==0 || lastFrame>currentFrame){
            self.handle("step",self.getPlayhead());
        }
        //scan all memory from last frame to current frame and trigger all those events.
        //...
        var eventsInRange = [];
        var framesInRange = self.getFrameRange(currentFrame,currentFrame+frameIncrement-1);
        for(var frevli in framesInRange){
            var frevl=framesInRange[frevli];
            eventsInRange=eventsInRange.concat(frevl);
        }
        
        eventsInRange.map(function(evt){
            if(evt.value[0]==headers.triggerOn){
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
                noff.value[0] = headers.triggerOff;
                eventsInRange.push(noff) 
                notesOn.delete(note);
            };
        });

        lastFrame=currentFrame;
        self.eventTriggerFunction(eventsInRange);
        // console.log("currentFrame",stepToFrame(stepIncrement),currentFrame);
    }
    this.getPlayhead=function(){
        return { frame: currentFrame, step: frameToStep(currentFrame), start:frameToStep(loopStart),end:frameToStep(loopEnd) }
    }
    this.setLoopPoints=function(start,end){
        if(start) loopStart=stepToFrame(start);
        if(end) loopEnd=stepToFrame(end);
        // loopLastFrame=loopEnd-1;
        loopLength=loopEnd-loopStart;
    }
    this.setLoopLength=function(to){
        loopEnd = loopStart+stepToFrame(to);
        // loopLastFrame=loopEnd-1;
        loopLength = loopEnd - loopStart;
    }
    this.setLoopDisplacement=function(start){
        loopStart = stepToFrame(start);
        loopEnd=loopStart+loopLength;
    }
    this.eventTriggerFunction=function(eventsList){
    }
    var noteOnRecordTracker={};
    this.recordEvent=function(event){
        var eventFrame=currentFrame;
        //prevent more than one same event in the same spot..
        for(var n in memory[eventFrame]){
            if (memory[eventFrame][n].compareValuesTo(event,[0,1,2,3])){
                console.log("duplicate prevented"); 
                return;
            }
        }
        //manage noteon and offs
        if (event.value[0] == headers.triggerOn) {
            noteOnRecordTracker[event.value[1],event.value[2]]=event;
            event.started=currentFrame;
            return;
        } else if (event.value[0] = headers.triggerOff) {
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
    
    //TODO: create a tape view object, which defines view start and end, and addresses all modification/ request functions in accordnce to view's position & zoom.
    //this would also be good for multi-controller sequencing
    //these functions return relative event positions!
    this.getStepRange=function(start,end){
        var frameStart = stepToFrame(start);
        var frameEnd = stepToFrame(end);
        var ret = self.getFrameRange(frameStart, frameEnd-1);
        
        return ret;
    }
    this.getFrameRange=function(frameStart,frameEnd){
        var ret = {}
        for (var index in memory) {
            if (index >= frameStart && index <= frameEnd) {
                var thisStep = frameToStep(index);
                var thisRelativeStep = thisStep - frameToStep(frameStart);
                ret[thisRelativeStep] = memory[index];
            }
        }
        return ret;
    }
    this.View=function(){
        var start=0;
        var end=0;
        var cursor=0;
        this.properties = function () {
            return { cursorFrame: cursor, cursor: frameToStep(cursor), start: frameToStep(start), end: frameToStep(end) }
        }
        this.set=function(to){
            if(to.cursor!==undefined){
                cursor=stepToFrame(to.cursor);
            }
            if (to.cursorFrame !== undefined) {
                cursor = to.currentFrame;
            }
            if (to.start !== undefined) {
                start = stepToFrame(to.start);
            } 
            if (to.end !== undefined) {
                end = stepToFrame(to.end);
            }
        }
        this.setLoopPoints = function (start, end) {
            if (start) loopStart = stepToFrame(start);
            if (end) loopEnd = stepToFrame(end);
            // loopLastFrame=loopEnd-1;
            loopLength = loopEnd - loopStart;
        }
        this.setLoopLength = function (to) {
            loopEnd = loopStart + stepToFrame(to);
            // loopLastFrame=loopEnd-1;
            loopLength = loopEnd - loopStart;
        }
        this.setLoopDisplacement = function (start) {
            loopStart = stepToFrame(start);
            loopEnd = loopStart + loopLength;
        }
    }
}
module.exports=TapeMem;