
module.exports={
    keyToPos:function(k){
        if(k[0]<8 && k[1]<8){
            k.buttonType="matrix";
            //matrix pos
            return k[0]+k[1]*8;
        }else{
            k.buttonType="selector";
            //selector pos
            let ret=k[0]+k[1];
            if(k[1]==8){
                //is a button in the horizontal row
                ret-=8;
            }
            return ret;
        }
    },
    posToKey:function(pos){
        return {
            0:pos%8,
            1:Math.floor(pos/8)
        }
    },
    appendPos:function(k){
        k.pos=this.keyToPos(k);
        return k;
    }
}