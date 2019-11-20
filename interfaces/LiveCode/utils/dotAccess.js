
let dotAccess=function(rootObject,accessStringOrArray){
    let accessArray;
    if(Array.isArray(accessStringOrArray)){
        accessArray=accessStringOrArray
    }else if(typeof accessStringOrArray=="string"){
        accessArray=accessStringOrArray.split(".");
    }else{
        throw new Error("dotAccess second argument is wrong type");
    }
    if(accessArray[0]==="") accessArray.shift() //so that user can do dotAccess(root,".prop.thing");
    let navigator={
        root:function(callback){
            if(callback) callback(rootObject,accessArray);
            return navigator.root;
        },
        oneLevelDown:function(callback){
            let subAccess=accessArray.slice(1);
            if(subAccess.length==0) subAccess=null;
            if(callback) callback(rootObject[accessArray[0]],subAccess);
            return rootObject[accessArray[0]];
        },
        tip:function(callback){
            let tip=rootObject;
            let failed=false;
            let nextAccess=null;
            for(let accessPartNum=0; accessPartNum<accessArray.length; accessPartNum++){
                nextAccess=accessArray[accessPartNum];
                tip=tip[nextAccess]
                if(tip===undefined){
                    callback(undefined,nextAccess);
                    return undefined;
                }
            }
            if(callback) callback(tip,null);
            return tip;
        },
        tipReference:function(callback){
            let tip=rootObject;
            let failed=false;
            let nextAccess=null;
            let accessPartNum=0;
            for(accessPartNum=0; accessPartNum<accessArray.length-1; accessPartNum++){
                nextAccess=accessArray[accessPartNum];
                tip=tip[nextAccess];
                if(tip===undefined){
                    callback(undefined,nextAccess);
                    return undefined;
                }
            }
            nextAccess=accessArray[accessPartNum];
            if(callback) callback(tip,nextAccess);
            return tip;
        },
    }
    return navigator;
}
module.exports=dotAccess;
function test(){
    let testObj={
        a:{
            a1:{
                a11:0
            }
        },
        b:[1,2,3],
        c:[
            {
                "01":33,
                "02":34,
            }
        ],
        d:980
    }
    let access1=dotAccess(testObj,"a.a1.a11");
    let tip=access1.tip(function(tip,unused){
        if(tip!==0) throw new Error("dotAccess is not accessing tip correctly");
        if(unused!==null) throw new Error("dotAccess is not passing null as second callback argument of tip");
    });
    if(tip!==0) throw new Error("dotAccess.tip is not returning the tip but "+tip);
    tip=access1.tipReference(function(prevToTip,reference){
        if(prevToTip[reference]!==0) throw new Error("dotAccess is not calling tipReference correctly");
    });
    if(tip!==testObj.a.a1) throw new Error("dotAccess.tipReference is not returning last to tip but "+tip);

    let access2=dotAccess(testObj,"c.0.01");
    access2.tip(function(tip,unused){
        if(tip!==33) throw new Error("dotAccess is not accessing tip correctly");
        if(unused!==null) throw new Error("dotAccess is not passing null as second callback argument of tip");
    });
    access2.tipReference(function(prevToTip,reference){
        if(prevToTip[reference]!==33) throw new Error("dotAccess is not calling tipReference correctly");
    });
    access2.oneLevelDown(function(subRoot,subAccess){
        dotAccess(subRoot,subAccess).oneLevelDown(function(subRoot,subAccess){
            dotAccess(subRoot,subAccess).oneLevelDown(function(subRoot,subAccess){
                console.log(subRoot,subAccess);
                if(subRoot!==33) throw new Error("dotAccess is not accessing tip correctly");
                if(subAccess!==null) throw new Error("dotAccess is not passing null as second callback when tip reached");

            })
        })
    });

    let access3=dotAccess(testObj,"b.0");
    access3.tip(function(tip,unused){
        if(tip!==1) throw new Error("dotAccess is not accessing tip correctly");
        if(unused!==null) throw new Error("dotAccess is not passing null as second callback argument of tip");
    });
    access3.tipReference(function(prevToTip,reference){
        if(prevToTip[reference]!==1) throw new Error("dotAccess is not calling tipReference correctly");
    });
    access3.oneLevelDown(function(subRoot,subAccess){
        if(subRoot[subAccess]!=1)throw new Error("dotAccess is not accessing oneLevelDown correctly");
    });

    let access4=dotAccess(testObj,"d");
    access4.tip(function(tip,unused){
        if(tip!==980) throw new Error("dotAccess is not accessing depthless item tip correctly");
        if(unused!==null) throw new Error("dotAccess is not passing null as second callback argument of tip");
    });
    access4.tipReference(function(prevToTip,reference){
        if(prevToTip[reference]!==980) throw new Error("dotAccess is not calling depthless tipReference correctly");
    });
}

test();