Observable= require("onhandlers");
module.exports=function(a,b,c){

    console.log("x8superinteractor singleton",a,b,c);
    this.SuperInteractor= function(hardware){
        Observable.call(this);
        
        this.on("*",function(evt){
            // hardware.bitmap(0xCC);
            console.log("HARDWARE", hardware);
            try {
                hardware.bitmap(0xCC);
            } catch (e) {
                console.log("e", e);
            }
        });
        
        this.engage=function(a){
            console.log(a);
            a.hardware.bitmap(0xCC);

        }
    }
}