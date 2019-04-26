
{
console.log("START");
function flatten(arr) {
  return arr.reduce(function (flat, toFlatten) {
    return flat.concat(Array.isArray(toFlatten) ? flatten(toFlatten) : toFlatten);
  }, []);
}
}
Line
	= statements:(
    	statement:(Declaration/Expression/Term) _ Break*{
        	return statement
        } )*{
      	return statements;      
      }
//Declaration section, which nearly is another parser.
Declaration
	= key:(Expression/GExpression/Term)_ ":" _ value:Thing _ ","* _{
    	let ret={}
        ret[key]=value;
        return ret
    }
LooseObject
	= "{" _ contents:(content:Declaration*{ return content }) _ "}"{
    	return contents
    }
LooseArray
	= "[" _ contents:(content:Thing ","*{ return content })* _ "]"{
    	return contents
    }

TextEntity
	= _ [0-9A-Za-z.]+ { return text(); }
Thing
	= LooseObject
    / LooseArray
    / Term

//Patching section
Expression
	= term:Term _ to:Connection* _ {
    	let prevTerm=term;
    	to.forEach((term)=>{
        	console.log(prevTerm,".connectTo(",term,")");
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
