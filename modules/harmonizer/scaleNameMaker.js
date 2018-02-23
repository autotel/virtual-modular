var fs=require('fs');
var path=require('path');

var nameToScale={};
var scaleToName=[];
var gradeNames=['DO','DO#','RE','RE#','MI','FA','FA#','SOL','SOL#','LA','LA#','SI'];
gradeNames=['C','C#','D','D#','E','F','F#','G','G#','A','A#','B'];
var structures={
  "maj*":"C; E; G;",
  "maj1*":"C; D; G; Bb;",
  "maj6*":"C; E; G; A;",
  "maj7*":"C; E; G; B;",
  "maj9*":"C; D; G; Bb; D;",
  "min*":"C; D#/Eb; G;",
  "min6*":"C; D#/Eb; G; A;",
  "min7*":"C; D#/Eb; G; Bb;",
  "min9*":"C; D#/Eb; G; Bb; D;",
  "dim*":"C; D#/Eb; F#/Gb",
  "dim*":"C; D#/Eb; F#/Gb",
  "aug*":"C; E; G#/Ab;",
  "sus4*":"C; F; G;",
  "major":"C; D; E; F; G; A; B; C;",
  "melodic minor":"C; D; D#/Eb; F; G; A; B; C;",
  "ionian":"C; D; E; F; G; A; B; C;",
  "harmonic minor":"C; D; D#/Eb; F; G; G#/Ab; B; C;",
  "natural minor":"C; D; D#/Eb; F; G; G#/Ab; A#/Bb; C;",
  "dorian":"C; D; D#/Eb; F; G; A; A#/Bb; C;",
  "phrygian":"C; C#/Db; D#/Eb; F; G; G#/Ab; A#/Bb; C;",
  "lydian":"C; D; E; F#/Gb; G; A; B; C;",
  "mixolydian":"C; D; E; F; G; A; A#/Bb; C;",
  "aeolian":"C; D; D#/Eb; F; G; G#/Ab; A#/Bb; C;",
  "locrian":"C; C#/Db; D#/Eb; F; F#/Gb; G#/Ab; A#/Bb; C;",
  "blues":"C; D#/Eb; F; F#/Gb; G; A#/Bb; C;",
  "diminished ha-wh":"C; C#/Db; D#/Eb; E; F#/Gb; G; A; A#/Bb; C;",
  "diminished wh-ha":"C; D; D#/Eb; F; F#/Gb; G#/Ab; A; B; C;",
  "whole tone":"C; D; E; F#/Gb; G#/Ab; A#/Bb; C;",
  "major pentatonic":"C; D; E; G; A; C;",
  "minor pentatonic":"C; D#/Eb; F; G; A#/Bb; C;",
  "augmented":"C; D#/Eb; E; G; G#/Ab; B; C;",
  "leading whole tone":"C; D; E; F#/Gb; G#/Ab; A#/Bb; B; C;",
  "double harmonic":"C; C#/Db; E; F; G; G#/Ab; B; C;",
  "overtone":"C; D; E; F#/Gb; G; A; A#/Bb; C;",
  "six tone symmetrical":"C; C#/Db; E; F; G#/Ab; A; C;",
  "altered":"C; C#/Db; D#/Eb; E; F#/Gb; G#/Ab; A#/Bb; C;",
  "altered bb7":"C; C#/Db; D#/Eb; E; F#/Gb; G#/Ab; A; C;",
  "enigmatic":"C; C#/Db; E; F#/Gb; G#/Ab; A#/Bb; B; C;",
  "dorian b2":"C; C#/Db; D#/Eb; F; F#/Gb; G#/Ab; A; B;",
  "augmented lydian":"C; D; E; F#/Gb; G#/Ab; A; B; C;",
  "lydian b7":"C; D; E; F#/Gb; G; A; A#/Bb; C;",
  "mixolydian b6":"C; D; E; F; G; G#/Ab; A#/Bb; C;",
  "locrian 2":"C; D; D#/Eb; F; F#/Gb; G#/Ab; A#/Bb; C;",
  "locrian 6":"C; C#/Db; D#/Eb; F; F#/Gb; A; A#/Bb; C;",
  "augmented ionian":"C; D; E; F; G#/Ab; A; B; C;",
  "dorian #4":"C; D; D#/Eb; F#/Gb; G; A; A#/Bb; C;",
  "major phrygian":"C; C#/Db; E; F; G; G#/Ab; A#/Bb; C;",
  "lydian #9":"C; D#/Eb; E; F#/Gb; G; A; B; C;",
  "diminished lydian":"C; D; D#/Eb; F#/Gb; G; A; B; C;",
  "minor lydian":"C; D; E; F#/Gb; G; G#/Ab; A#/Bb; C;",
  "arabian":"C; D; E; F; F#/Gb; G#/Ab; A#/Bb; C;",
  "balinese":"C; C#/Db; D#/Eb; F#/Gb; G#/Ab; C;",
  "byzantine":"C; C#/Db; E; F; G; G#/Ab; B; C;",
  "chinese":"C; E; F#/Gb; G; B; C;",
  "mongolian":"C; D; E; G; A; C;",
  "egyptian":"C; D; F; G; A#/Bb; C;",
  "eight tone spanish":"C; C#/Db; D#/Eb; E; F; F#/Gb; G#/Ab; A#/Bb; C;",
  "hindu":"C; D; E; F; G; G#/Ab; A#/Bb; C;",
  "hirajoshi":"C; D; D#/Eb; G; G#/Ab; C;",
  "hungarian major":"C; D#/Eb; E; F#/Gb; G; A; A#/Bb; C;",
  "hungarian minor gipsy":"C; D; D#/Eb; F#/Gb; G; G#/Ab; B; C;",
  "ichikosucho":"C; D; E; F; F#/Gb; G; A; B; C;",
  "kumoi":"C; D; D#/Eb; G; A; C;",
  "mohammedan":"C; D; D#/Eb; F; G; G#/Ab; B; C;",
  "neopolitan":"C; C#/Db; D#/Eb; F; G; G#/Ab; B; C;",
  "neopolitan major":"C; C#/Db; D#/Eb; F; G; A; B; C;",
  "neopolitan minor":"C; C#/Db; D#/Eb; F; G; G#/Ab; A#/Bb; C;",
  "pelog":"C; C#/Db; D#/Eb; G; G#/Ab; C;",
  "persian":"C; C#/Db; E; F; F#/Gb; G#/Ab; B; C;",
  "prometheus":"C; D; E; F#/Gb; A; A#/Bb; C;",
  "prometheus neopolitan":"C; C#/Db; E; F#/Gb; A; A#/Bb; C;",
  "purvi theta":"C; C#/Db; E; F#/Gb; G; G#/Ab; B; C;",
  "todi theta":"C; C#/Db; D#/Eb; F#/Gb; G; G#/Ab; B; C;",
  "chromatic":"C;C#;D;D#;E;F;F#;G;G#;A;A#;B;",
  "octave":"C",
}
//transform each scale's text to a byte, and store it in the arrays
for(var n in structures){
  var scaleString=structures[n];
  var scaleTitle=n;


  var scaleStructure=scaleString.split(/\; */g);
  // console.log(scaleStructure);
  var gradesByte=0;
  for(var a of scaleStructure){
    a=a.replace(/\/.*/,"");
    gradesByte|=1<<gradeNames.indexOf(a);
    // console.log(a);
  }
  gradesByte&=0xFFF;
  scaleToName[gradesByte]=scaleTitle;
  nameToScale[scaleTitle]=gradesByte;
  // console.log(gradesByte.toString(2));
}

var shiftedScalesArray=[];
//search for all unnammed possible scales, and search for a scale that would fit
for(var n = 0; n<scaleToName.length; n++){
  if(!scaleToName[n]){
    var scaleTitle=false;
    // console.log("fill "+n);
    for(var shift=0; shift<12; shift++){
      for(var scaleNumber in scaleToName){
        var shiftedScale=scaleNumber<<shift
        shiftedScale|=shiftedScale>>12;
        shiftedScale|=shiftedScale<<12;
        shiftedScale&=0xFFF;
        // console.log("shifted"+shiftedScale.toString(2));
        if(shiftedScale==n){
          scaleTitle=gradeNames[shift]+" "+scaleToName[scaleNumber];
          console.log(n.toString(2)+" = "+scaleToName[scaleNumber]+"<<"+shift+""+scaleTitle);
          shiftedScalesArray[n]=scaleTitle;
        }
      }
    }
  }
}
for(var n in shiftedScalesArray){
  scaleToName[n]=shiftedScalesArray[n];
}


fs.writeFile(path.join(__dirname,'/scaleNames.js'),
"var nameToScale="+JSON.stringify(nameToScale, null)+
";var scaleToName="+JSON.stringify(scaleToName, null)+
";module.exports={scaleToName:scaleToName,nameToScale:nameToScale}"
, 'utf8'
, console.log);
