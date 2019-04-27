
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
    	statement:(Declaration/Expression/Term/Comment) _ Break*{
			if(declarationFunction){
				declarationFunction(statement);
			}
        	return statement
        } )*{
      			return statements;      
      		}
	
Comment "comment"
	= _ "\\*".*"*\\" _
	/ _ "\/\/"[^\r\n]* [\n\r]
//Declaration section, which nearly is another parser.
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
	= "\"" [^"]* "\"" { return text(); }
	/ "\'" [^']* "\'" { return text(); }
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
	/ "(" _ term:Declaration _ ")"{return Object.keys(term)[0]}
    / "(" _ term:Reference _ ")"{return term}
    / "(" _ term:Expression _ ")"{return term}
    / "(" _ term:GExpression _ ")"{return term}
Reference "object reference"
  	= _ [0-9A-Za-z._]+ { return text(); }
	/ "\"" [^"]* "\"" { return text(); }
	/ "\'" [^']* "\'" { return text(); }
Break "break"= [;,]+
_ "whitespace"
  	= [ \t\n\r]*
