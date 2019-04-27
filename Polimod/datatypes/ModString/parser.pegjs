
{	
	// console.log(this);
	var declarationFunction=this.declarationFunction;
	var connectFunction=this.connectFunction;
	function flatten(arr) {
		return arr.reduce(function (flat, toFlatten) {
			return flat.concat(Array.isArray(toFlatten) ? flatten(toFlatten) : toFlatten);
		}, []);
	}
}
Line
	= statements:(
    	statement:(Declaration/Expression/Term) _ Break*{
			if(declarationFunction){
				declarationFunction(statement);
			}
        	return statement
        } )*{
      			return statements;      
      		}
//Declaration section, which nearly is another parser.
Declaration
	= _ key:(Expression/GExpression/Term) _ ":" _ value:Thing _ ","* _{
    	let ret={}
        ret[key]=value;
        return ret
    }
LooseObject
	= "{" _ contents:(content:Declaration*{ return content }) _ "}"{
    	let ret={}
        for(let declarationN in contents){
        	for(let keyName in contents[declarationN]){
            	ret[keyName]=contents[declarationN][keyName];
            }
        }
    	return ret
    }
LooseArray
	= "[" _ contents:(content:Thing ","*{ return content })* _ "]"{
    	return contents
    }

TextEntity
	= "\"" [^"]* "\"" { return text(); }
    / _ [0-9A-Za-z.]+ { return text(); }
Thing
	= LooseObject
    / LooseArray
    / TextEntity

//Patching section
Expression
	= term:Term _ to:Connection* _ {
    	let prevTerm=term;
    	to.forEach((term)=>{
        	if(connectFunction){
            	connectFunction(prevTerm,term)
            }
        	//console.log(prevTerm,".connectTo(",term,")");
            prevTerm=term;
        });
    	return term
    }
Connection
	= _ op:Operator _ term:(Term/Connection)_ {
    	return term
    }
GExpression
	= term:Term _ operation:Group* _ {
    	return flatten([term,operation])
    }
Group
	= _ op:"," _ term:Expression _{
        return term
      }
Operator
	=	_ con:("-"*">") _ { return con.join("") }
    

Term
	= term:Reference{return term}
    / "(" _ term:Reference _ ")"{return term}
    / "(" _ term:Expression _ ")"{return term}
    / "(" _ term:GExpression _ ")"{return term}
Reference "object reference"
  	= _ [0-9A-Za-z.]+ { return text(); }
Break = [;,]+
_ "whitespace"
  	= [ \t\n]*
