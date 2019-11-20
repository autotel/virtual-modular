const Base=require("./Base.js");
let tweakTypes={
    /**
     * @param {object} root 
     * @param {string} access both params have to be usable as root[access]();
     * */
    function:function(root,access){
        this.val=root[access]();
        let self=this;
        this.add=function(delta){
            self.val=root[access](self.val+delta);
        }
        this.set=function(val){
            self.val=root[access](val);
        }
    },
    /**
     * @param {object} root 
     * @param {string} access both params have to be usable as root[access]="string";
     * */
    string:function(root,access){
        this.val=root[access];
        let self=this;
        let arrayOfPossibilities=false;

        let usingCurrent=!isNaN(root.current);

        if(Array.isArray(root.options)){
            arrayOfPossibilities=root.options;
        }else if(Array.isArray(root.possible)){
            arrayOfPossibilities=root.possible;
        }

        let max=Array.isArray(arrayOfPossibilities)?arrayOfPossibilities.length-1:0;
        let min=0;
        if(max==0) arrayOfPossibilities=false;


        if(arrayOfPossibilities){
            this.tracked=arrayOfPossibilities.indexOf(this.val);
            this.options=arrayOfPossibilities;
        }
        
        function update(){
            root[access]=self.val;
            if(usingCurrent) root.current=self.tracked;
        }
        /**
         * strange case where adding to string, is interpreted as selecting the next option
        */
        this.add=function(delta){
            delta=parseInt(delta);
            if(!arrayOfPossibilities) return
            self.tracked+=delta;
            if(self.tracked>max)self.tracked=min;
            if(self.tracked<min)self.tracked=max;
            self.val=arrayOfPossibilities[self.tracked];
            update();
        }

        this.set=function(val){
            if(!arrayOfPossibilities) return
            //if user wrote string value
            if(isNaN(val)) val=arrayOfPossibilities.indexOf(val);
            if(val==-1) return console.warn("value "+val+" is not valid in "+this.name);
            self.tracked=val%max;
            self.val=arrayOfPossibilities[self.tracked];
            update();
        }
    },
    /**
     * @param {object} root 
     * @param {string} access both params have to be usable as root[access]="string";
     * @param {number|string|false?} step
     * @param {number|string|false?} min
     * @param {number|string|false?} max
     * */
    number:function(root,access){
        let self=this;
        this.val=root[access];
        function tryGetNumber(...ps){
            for(let a of ps){
                if(!isNaN(a)) return parseInt(a);
            }
            return false;
        }
        //normalize types
        let step=tryGetNumber(root.step)
        let min=tryGetNumber(root.min,root.minimum)
        let max=tryGetNumber(root.max,root.maximum);
        //but check if they're usable
        let useStep=step!==false;
        let useMin=min!==false;
        let useMax=max!==false;

        //deduce a reasobable step value if not set
        if(useMin && useMax){
            if(!useStep){
                useStep=true;
                step=(max-min)/256;
            }
        }

        function update(){
            root[access]=self.val;
        }

        this.add=function(delta){
            if(isNaN(delta)) return console.warn("numeric value "+delta+" cannot be evaluated");
            delta=parseFloat(delta)
            if(useStep) delta*=step;
            self.val+=delta;
            //wraparound max and min if it applies
            if(useMax && self.val>max) self.val=min;
            if(useMin && self.val<min) self.val=max;

            update();
        }

        this.set=function(val){
            if(isNaN(val)) return console.warn("numeric value "+val+" cannot be evaluated");
            val=parseFloat(val)
            self.val=val;
            //wraparound max and min if it applies
            if(useMax && self.val>max) self.val%=min;
            if(useMin && self.val<min) self.val%=max;
            update();
        }
    },

    /**
     * @param {object} root 
     * @param {string} access both params have to be usable as root[access]="string";
     * */
    boolean:function(root,access){
        function parseBool(value){
            switch (value) {
                case "true":
                    return true;
                case "1":
                    return true;
                case "y":
                    return true;
                case "yes":
                    return true;
                case "t":
                    return true;
                
                case "false":
                    return false;
                case "0":
                    return false;
                case "n":
                    return false;
                case "no":
                    return false;
                case "f":
                    return false;
                default:
                    return null;
            }
        }
        this.val=root[access];
        let self=this;
        function update(){
            root[access]=self.val;
        }
        this.add=function(delta){
            //IDK what to do here.. leave it for later
            return console.error("dont' know how to add to delta");
            let isOdd=1==delta%2;
            self.val=self.val!=isOdd;
            update();
        }

        this.set=function(val){
            let parsedBool=parseBool(val+"");
            if(parsedBool===null) return console.warn(val+" cannot be converted to boolean");
            self.val=parsedBool;
            update();
        }
    }
}
/**
 * @param {object} variable: the controlledModule's single variables to control
 * @param {object} root: the controlledModule's full list of variables (the container of variable)
 * @param {string} key: the key name sof the variable in the root object
 * */
const CurrentValueTracker=function(root,variable,key){
    this.name=key;
    let tweakable=false;
    let objectThatContainsTheVariable=root;
    let keyThatAccessTheValue=key;
    let typeOfVar=typeof variable;
    this.add=function(){
        console.log("untweakable");
    }
    this.set=function(){
        console.log("untweakable");
    }
    //try find a tweakable value on that variable
    if(typeOfVar=="object"){
        if(tweakTypes[typeof variable.value]){
            objectThatContainsTheVariable=variable;
            keyThatAccessTheValue="value";
            typeOfVar=typeof variable.value
            tweakable=true;
        }else if(tweakTypes[typeof variable.val]){
            objectThatContainsTheVariable=variable;
            keyThatAccessTheValue="val";
            typeOfVar=typeof variable.val

            tweakable=true;
        }else if(tweakTypes[typeof variable.current]){
            objectThatContainsTheVariable=variable;
            keyThatAccessTheValue="current";
            typeOfVar=typeof variable.current
            tweakable=true;
        }
    }
    
    if(tweakTypes[typeOfVar]){
        tweakTypes[typeOfVar].call(this,objectThatContainsTheVariable,keyThatAccessTheValue);
        tweakable=true;
    }

    
}
const Generic=function(environment,controlledModule){
    let tweakables={};
    let self=this;
    Base.call(this,environment,controlledModule);
    updateAvailableProperties();

    this.applyProperties=function(properties){
        console.log("applyProperties",properties);
        for(let propname in properties){
            if(propname=="name") controlledModule.name=properties[propname];
            if(tweakables[propname]){
                tweakables[propname].set(properties[propname]);
            }else{
                console.warn("  "+controlledModule.name+" has no tweakable property "+propname);
            }
        }
    }
    
    function updateAvailableProperties(){
        for(let propertyName in controlledModule.properties){
            if(!tweakables[propertyName]){
                console.log("new property",propertyName);
                tweakables[propertyName]=new CurrentValueTracker(
                    controlledModule.properties,
                    controlledModule.properties[propertyName],
                    propertyName
                );
            };
        }
    }
}
Generic.compatibility=function(module){
    return module.properties!==undefined;
}
module.exports=Generic;