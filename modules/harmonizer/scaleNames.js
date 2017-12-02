var nameToScale={"major":2741,"melodic minor":2733,"ionian":2741,"harmonic minor":2477,"natural minor":1453,"dorian":1709,"phrygian":1451,"lydian":2773,"mixolydian":1717,"aeolian":1453,"locrian":1387,"blues":1257,"diminished ha-wh":1755,"diminished wh-ha":2925,"whole tone":1365,"major pentatonic":661,"minor pentatonic":1193,"augmented":2457,"leading whole tone":3413,"double harmonic":2483,"overtone":1749,"six tone symmetrical":819,"altered":1371,"altered bb7":859,"enigmatic":3411,"dorian b2":2923,"augmented lydian":2901,"lydian b7":1749,"mixolydian b6":1461,"locrian 2":1389,"locrian 6":1643,"augmented ionian":2869,"dorian #4":1741,"major phrygian":1459,"lydian #9":2777,"diminished lydian":2765,"minor lydian":1493,"arabian":1397,"balinese":331,"byzantine":2483,"chinese":2257,"mongolian":661,"egyptian":1189,"eight tone spanish":1403,"hindu":1461,"hirajoshi":397,"hungarian major":1753,"hungarian minor gipsy":2509,"ichikosucho":2805,"kumoi":653,"mohammedan":2477,"neopolitan":2475,"neopolitan major":2731,"neopolitan minor":1451,"pelog":395,"persian":2419,"prometheus":1621,"prometheus neopolitan":1619,"purvi theta":2515,"todi theta":2507,"chromatic":4095,"octave":1};var scaleToName=[null,"octave","C# octave",null,"D octave",null,null,null,"D# octave",null,null,null,null,null,null,null,"E octave",null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,"F octave",null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,"F# octave",null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,"G octave",null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,"G# octave",null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,"balinese",null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,"F pelog",null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,"pelog",null,"hirajoshi",null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,"F hirajoshi",null,"F kumoi",null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,"A octave",null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,"kumoi",null,null,null,null,null,null,null,"mongolian","C# balinese",null,null,null,null,"D# prometheus neopolitan",null,"A blues",null,null,null,null,null,null,null,"G egyptian",null,null,null,null,null,"D# prometheus",null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,"F# balinese","F# pelog",null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,"A hungarian major",null,null,null,null,null,null,null,null,null,null,null,"F# todi theta",null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,"G# F pelog",null,null,null,"A chinese",null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,"six tone symmetrical",null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,"F# hirajoshi",null,null,null,"F# kumoi",null,null,null,null,null,null,null,null,null,null,null,null,"C# neopolitan",null,null,null,"altered bb7",null,null,null,null,null,null,null,null,null,"G# prometheus neopolitan",null,"F# hungarian minor gipsy",null,null,null,"F# diminished lydian",null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,"G# persian",null,null,null,"G# byzantine",null,"G# purvi theta",null,null,null,null,null,null,null,"F A blues",null,"F G# purvi theta",null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,"G# enigmatic",null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,"A# octave",null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,"A# hirajoshi",null,null,null,null,null,"A# F kumoi",null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,"A# kumoi",null,"egyptian",null,"A# A blues",null,"minor pentatonic",null,null,null,null,null,null,null,"A# F# balinese",null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,"A# G# prometheus neopolitan",null,null,null,null,null,null,null,null,null,null,null,null,null,"A# G# purvi theta",null,"blues",null,null,null,null,null,null,null,null,null,null,null,"A# G# enigmatic",null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,"A# A# F kumoi",null,null,null,null,null,null,null,null,null,null,null,null,null,null,"A# egyptian","A# minor pentatonic",null,"A# A# F# balinese",null,null,null,null,null,null,null,null,null,"A# A# G# prometheus neopolitan",null,null,null,"A# blues",null,null,"A# A# G# enigmatic",null,null,null,null,null,null,null,null,null,null,null,null,"A# A# egyptian",null,null,null,null,"A# A# A# G# enigmatic",null,null,null,null,null,"whole tone","E prometheus","G# arabian",null,"F# prometheus",null,"altered",null,"A# arabian",null,null,null,null,null,null,null,"G# prometheus",null,null,null,null,null,"locrian",null,"locrian 2",null,null,null,null,null,"F neopolitan",null,"arabian",null,null,null,null,null,"eight tone spanish",null,null,null,null,null,null,null,null,null,null,null,null,null,null,"G balinese",null,"G pelog",null,null,null,null,null,null,null,null,"A# prometheus",null,null,null,null,null,"G F# diminished lydian",null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,"neopolitan minor",null,"aeolian",null,"G# ichikosucho",null,null,null,"major phrygian",null,"hindu","A# hungarian major",null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,"G neopolitan","G todi theta",null,null,null,null,null,null,"minor lydian",null,null,null,null,null,"G dorian b2",null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,"F G# ichikosucho",null,"D eight tone spanish",null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,"A balinese",null,null,"A F pelog",null,null,null,null,"A pelog",null,null,"A# chinese",null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,"prometheus neopolitan",null,"prometheus",null,null,null,null,null,"A A hungarian major",null,null,null,null,null,null,null,null,null,null,"A# augmented",null,null,null,null,"locrian 6",null,"A F# diminished lydian",null,null,null,null,null,"A# hungarian minor gipsy",null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,"A A# hirajoshi",null,null,null,null,null,null,null,"A A# kumoi",null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,"A# melodic minor",null,"dorian","A F neopolitan","A eight tone spanish",null,null,null,"A# diminished lydian",null,"mixolydian","A# lydian #9",null,null,null,null,"A G dorian b2",null,"A# ichikosucho",null,null,null,null,null,null,null,null,null,null,null,null,"A prometheus neopolitan","A A A hungarian major",null,"dorian #4","A A# hungarian minor gipsy",null,null,null,null,null,null,"lydian b7","A A# diminished lydian","A A G dorian b2",null,"hungarian major",null,"diminished ha-wh",null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,"A persian",null,null,null,null,null,null,"A neopolitan","A byzantine",null,null,"A todi theta","A purvi theta",null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,"G# A# A blues",null,null,null,"G# A# G# purvi theta",null,null,null,null,null,null,"A# leading whole tone",null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,"A dorian b2",null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,"A enigmatic",null,null,"G G# ichikosucho",null,null,null,null,null,null,null,"G A eight tone spanish",null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,"B octave",null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,"B balinese",null,null,null,null,null,null,null,null,null,null,null,"B F pelog",null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,"B pelog","B hirajoshi",null,null,null,null,null,null,null,null,null,null,"chinese","B F kumoi",null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,"B kumoi",null,null,null,"B mongolian",null,null,"B D# prometheus neopolitan","B A blues",null,null,null,"B G egyptian",null,null,"B D# prometheus",null,null,null,null,null,null,null,null,null,null,null,null,"B F# balinese",null,null,null,null,null,null,null,null,null,null,"B A hungarian major",null,null,null,null,null,"persian",null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,"augmented",null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,"neopolitan",null,"mohammedan",null,null,null,null,"B G# prometheus neopolitan","byzantine",null,"B F# diminished lydian",null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,"todi theta",null,"hungarian minor gipsy","B G# purvi theta",null,null,null,"B F A blues","purvi theta",null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,"B G# enigmatic",null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,"B A# hirajoshi",null,null,"B A# F kumoi",null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,"B A# kumoi","B egyptian","B A# A blues","B minor pentatonic",null,null,null,"B A# F# balinese",null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,"B A# G# prometheus neopolitan",null,null,null,null,null,null,"B A# G# purvi theta","B blues",null,null,null,null,null,"B A# G# enigmatic",null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,"B A# egyptian",null,null,null,null,null,null,null,null,null,"B A# A# G# enigmatic",null,null,null,null,null,null,null,null,"B A# A# A# G# enigmatic",null,null,"B whole tone","neopolitan major","B F# prometheus","melodic minor","B A# arabian",null,null,null,"B G# prometheus",null,null,"ionian","B locrian 2",null,null,"B F neopolitan","B arabian",null,null,"B eight tone spanish",null,null,null,null,null,null,null,null,null,null,null,null,"B A# prometheus",null,null,"diminished lydian",null,null,null,null,null,null,null,"lydian","B aeolian","B G# ichikosucho",null,"lydian #9","B hindu",null,null,null,null,null,null,null,null,null,null,null,"B G neopolitan",null,null,null,"B minor lydian",null,null,"B G dorian b2",null,null,null,null,null,null,null,"ichikosucho","B D eight tone spanish",null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,"B A balinese",null,null,null,"B A pelog",null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,"B prometheus neopolitan","B prometheus",null,null,"B A A hungarian major",null,null,null,null,null,null,null,"augmented ionian","B A F# diminished lydian",null,null,"B A# hungarian minor gipsy",null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,"augmented lydian","B dorian","B A eight tone spanish",null,"B A# diminished lydian","B mixolydian",null,null,"B A G dorian b2","B A# ichikosucho",null,null,null,null,null,null,"B A A A hungarian major","B dorian #4",null,null,null,"B lydian b7","dorian b2","B hungarian major","diminished wh-ha",null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,"B A neopolitan",null,"B A todi theta",null,null,null,null,null,null,null,null,null,null,null,null,null,"B A# leading whole tone",null,null,null,null,null,null,null,null,null,null,null,"B A dorian b2",null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,"B G G# ichikosucho",null,null,null,"B G A eight tone spanish",null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,"B B balinese",null,null,null,null,null,"B B F pelog",null,null,null,null,null,null,null,null,null,"B B pelog",null,null,null,null,null,"B chinese",null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,"B B D# prometheus neopolitan",null,null,null,"B B D# prometheus",null,null,null,null,null,null,null,null,null,null,null,"B B A hungarian major",null,null,"B persian",null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,"B augmented",null,null,null,null,null,null,null,null,"B neopolitan","B mohammedan",null,null,"B byzantine","B B F# diminished lydian",null,null,null,null,null,null,null,null,null,null,"B todi theta","B hungarian minor gipsy",null,null,"B purvi theta",null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,"B B A# hirajoshi",null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,"B B A# kumoi","B B A# A blues",null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,"B B A# G# purvi theta",null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,"enigmatic",null,"leading whole tone","B melodic minor",null,null,null,"B ionian",null,"B B F neopolitan",null,"B B eight tone spanish",null,null,null,null,null,null,null,"B diminished lydian",null,null,null,"B lydian","B B G# ichikosucho","B lydian #9",null,null,null,null,null,null,null,null,null,"B B G dorian b2",null,null,null,"B ichikosucho",null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,"B B prometheus neopolitan",null,"B B A A hungarian major",null,null,null,"B augmented ionian",null,"B B A# hungarian minor gipsy",null,null,null,null,null,null,null,null,null,null,null,null,null,"B augmented lydian","B B A eight tone spanish","B B A# diminished lydian",null,"B B A G dorian b2",null,null,null,"B B A A A hungarian major",null,null,"B dorian b2","B diminished wh-ha",null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,"B B persian",null,null,null,null,null,null,null,null,null,null,null,null,null,"B B neopolitan",null,"B B byzantine",null,null,null,null,null,"B B todi theta",null,"B B purvi theta",null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,"B B B A# A blues",null,null,null,null,null,null,null,"B B B A# G# purvi theta",null,null,null,null,null,null,null,null,null,null,null,null,"B enigmatic","B leading whole tone",null,null,null,null,null,null,null,null,null,null,"B B B G# ichikosucho",null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,"B B B A eight tone spanish",null,null,null,null,"B B dorian b2",null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,"B B enigmatic",null,null,null,null,null,"B B B B G# ichikosucho",null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,"B B B B A eight tone spanish",null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,"chromatic"];module.exports={scaleToName:scaleToName,nameToScale:nameToScale}