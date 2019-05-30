const fs=require("fs");
var LiveCode=function(environment){
    function print(...vals){
        console.log(">>",...vals,process.hrtime());
    }
    let ModString=environment.datatypes.requires("ModString");
    const createdModules={}
    deltaRead=function(modScript){
        //parse and apply string value
        //only what is different from the current environment state is applied
        let actionsList;
        try{
            actionsList=ModString.parse(modScript);
        }catch(e){
            console.error("syntax error:");
            console.log("  expected",e.expected);
            console.log("  but",e.found,"found");
            console.log(e.location);
            return;
        }
        let lastPosition=0;
        for(let actionItm of actionsList){
            try{
                let action=actionItm[0]
                console.log(actionItm);
                if(action=="define"){
                let names=Object.keys(actionItm[1])
                for(let itemName of names){
                    let access=itemName.split(".");
                    if(access.length > 1){
                        // console.log("would do a property assign here");
                        let rootName=access.shift();
                        let current=createdModules[rootName];
                        let value=actionItm[1][itemName];
                        print("~",rootName,access.join("."),"=",value);

                        if(!current){
                            console.log("module called",rootName,"doesnt exist",Object.keys(createdModules));
                        }
                        while(access.length){
                            let propName=access.shift();
                            if(!current[propName])current[propName]={};
                            if(access.length==0){
                                current[propName]=value;
                            }else{
                                current=current[propName];
                            }
                        }
                    }else{
                        let newItemProperties=actionItm[1][itemName];
                        if(!newItemProperties.type){ 
                            // print("!","no type property, I don't know what to do."); 
                            newItemProperties={type:newItemProperties};
                            // continue;
                        }
                        let Constructor=environment.moduleConstructors.list[newItemProperties.type]
                        if(!Constructor){ print("!",newItemProperties.type+"  constructor for the type was not found."); continue }
                        if(createdModules[itemName]){ print("(skip)",itemName,"item already exists"); continue}
                        newItemProperties.name=itemName;
                        createdModules[itemName]=new Constructor(newItemProperties,environment);
                        print("+",itemName);
                    }
                }
                }else if(action=="connect"){
                let subjectModule=createdModules[actionItm[1]];
                let destModule=createdModules[actionItm[2]];
                // console.log(Object.keys(subjectModule));
                if(subjectModule&&destModule){
                    if(subjectModule.outputs.has(destModule)){
                        print("(skip)",subjectModule.name,"-->",destModule.name);
                    }else{
                        subjectModule.addOutput(destModule);
                        print(subjectModule.name,"-->",destModule.name);
                    }
                    
                }else{
                    print("! cannot connect nonexistent module, skipping",{
                    "name of one":actionItm[1].name,"name of two":actionItm[2].name,"list":Object.keys(createdModules)
                    })
                    continue
                }

                }
            }catch(e){
              console.warn("  action failed", e);
            }
        }
    }
    read=function(value){
        //parse and apply string value
        console.log("would apply",value);
    }
    this.setFile=function(filename){
        let ch=()=>{ fs.readFile(filename,'utf8',(err,val)=>err?err:deltaRead(val));}
        fs.exists(filename,does=>{
            if(does){
                ch();
                fs.watch(filename,ch);
            }else{
                console.warn("could not perform setFile("+filename+"); it does not exist");
            }
        });
    }
    this.setStream=function(stream){
        //when stream pipes, 
        // read(value);
    }
}
module.exports=LiveCode;
