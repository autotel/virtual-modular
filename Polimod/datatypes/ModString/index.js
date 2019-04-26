let parser=require('./parser.js');
ModString=function(string){
    this.parse=function(){
        parser.parse(string);
    };
}
module.exports=ModString;