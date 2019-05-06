
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
Body "statement"
	= statements:(
    	statement:(Declaration_root/Expression/Term/Comment) _ Break*{
			
        	return statement
        } )*{
      			return statements;      
      		}
	
Comment "comment"
	= _ "\\*".*"*\\" _
	/ _ "\/\/"[^\r\n]* [\n\r]
//Declaration section, which nearly is another parser.
//same as declaration, but if it's the first level, it needs to call the declaration callbacl
Declaration_root "declaration"
	= _ key:(Expression/GExpression/Term) _ ":" _ value:ValueDefinition _ ","* _{
    	let ret={}
        ret[key]=value;

		if(declarationFunction){
			declarationFunction(ret);
		}

        return ret
    }
Declaration "declaration"
	= _ key:(Expression/GExpression/Term) _ ":" _ value:ValueDefinition _ ","* _{
    	let ret={}
        ret[key]=value;
        return ret
    }
LooseObject "object value"
	= "{" _ contents:(content:Declaration*{ return content }) _ "}"{
    	let ret={}
        for(let declarationN in contents){
        	for(let keyName in contents[declarationN]){
            	ret[keyName]=contents[declarationN][keyName];
            }
        }
    	return ret
    }
LooseArray "array value"
	= "[" contents:( _ content:ValueDefinition  _ ","? _ { return content })* _ "]"{
    	return contents
    }

TextEntity "text entity"
	= "\"" text:[^"]* "\"" { return text.join(""); }
	/ "\'" text:[^']* "\'" { return text.join(""); }
    / [0-9A-Za-z._-]+ { return text(); }
ValueDefinition "value"
    = LooseArray
	/ LooseObject
    / TextEntity

//Patching section
Expression
	= term:Term _ to:Connection_r* _ {
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
Connection_r
	= _ op:Operator _ term:(Term/Connection_r)_ {
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

Term "Reference between parentheses"
	= term:Reference{return term}
	/ "(" _ term:Declaration_root _ ")"{return Object.keys(term)[0]}
    / "(" _ term:Reference _ ")"{return term}
    / "(" _ term:Expression _ ")"{return term}
    / "(" _ term:GExpression _ ")"{return term}
Reference "object reference"
  	= _ [0-9A-Za-z._]+ { return text(); }
	/ "\"" text:[^"]* "\"" { return text.join(""); }
	/ "\'" text:[^']* "\'" { return text.join(""); }
Break "break"= [;,]+
_ "whitespace"
  	= [ \t\n\r]*