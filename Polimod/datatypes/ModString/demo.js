const ModString=require("./");
let modString=new ModString("a->b->(c->(d->e->f))->e\n\
a->b->(c->(d,e,f))->e\n\
");
modString.parse();