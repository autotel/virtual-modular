const ModString=require("./");
console.log(ModString.parse(`
  sequencer:{
    type:Sequencer,
    sequence:[[12,31,12],[123,123,123,]], 
    randomtext:"some text string with spaces allowed", 
  }
  presetkit:{ 
    type:Presetkit,
    finius:"nigelous" 
  }
  
  sequencer->presetkit->( 
    a,
    (
      (b->c),
      d,e, 
      f->g->h->(i,a)
    ),
    j
  )->k
  (l->m)->n
`))