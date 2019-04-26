var peg = require("pegjs");
// var fs=require('fs');
// var parser = peg.generate(fs.readFileSync('./Polimod/datatypes/ModString/parser.pegjs'));
var parser=require('./parser.js');
ModString=function(string){
    parser.declarationFunction=(a)=>{
        console.log(a);
    };
    parser.connectFunction=(a,b)=>{
        console.log(a,"->",b);
    };
    console.log(parser);
    this.parse=function(){
        parser.parse(string);
    };
}
module.exports=ModString;