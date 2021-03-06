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
        let properties=[];
        parser.declarationFunction=(a)=>{
            // console.log(a);
            declarations.push(["define",a]);
        };
        // parser.propertyFunction=(path,val)=>{
        //     // console.log(a);
        //     properties.push(["set",path,val]);
        // };
        parser.connectFunction=(a,b)=>{
            // console.log(a,b);      
            if(Array.isArray(a) && Array.isArray(b)){
                a.forEach(a=>{
                    b.forEach((b)=>connections.push(["connect",a,b]))
                })
            }else if(Array.isArray(a)){
                a.forEach(a=>connections.push(["connect",a,b]))
            }else if(Array.isArray(b)){
                b.forEach(b=>connections.push(["connect",a,b]))
            }else{
                connections.push(["connect",a,b]);
            }
        };  
        parser.parse(string);
        self.actionsList=declarations.concat(connections).concat(properties);
    };
}
ModString.parse=function(string){
    let m=new ModString(string);
    m.parse();
    return m.actionsList;
}
module.exports=ModString;