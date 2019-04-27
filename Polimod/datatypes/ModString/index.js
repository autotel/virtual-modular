var peg = require("pegjs");
// var fs=require('fs');
// var parser = peg.generate(fs.readFileSync('./Polimod/datatypes/ModString/parser.pegjs'));
var parser=require('./parser.js');
ModString=function(string){
    let self=this;
    parser.declarationFunction=(a)=>{
        console.log(a);
    };
    parser.connectFunction=(a,b)=>{
        console.log(a,"->",b);
    };
    // console.log(parser);
    this.actionsList=[];
    this.parse=function(){
        let declarations=[];
        let connections=[];
        parser.declarationFunction=(a)=>{
            // console.log(a);
            declarations.push(a);
        };
        parser.connectFunction=(a,b)=>{
            // console.log(a,b);      
            if(Array.isArray(a) && Array.isArray(b)){
                a.forEach(a=>{
                    b.forEach((b)=>connections.push([a,b]))
                })
            }else if(Array.isArray(a)){
                a.forEach(a=>connections.push([a,b]))
            }else if(Array.isArray(b)){
                b.forEach(b=>connections.push([a,b]))
            }else{
                connections.push([a,b]);
            }
        };  
        parser.parse(string);
        self.actionsList=declarations.concat(connections);
    };
}
ModString.parse=function(string){
    let m=new ModString(string);
    m.parse();
    return m.actionsList;
}
module.exports=ModString;