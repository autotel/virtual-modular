panton={
  disabled:[10,7,11],
  selected:[255,255,255],
  connected:[190,0,0]
}
function interpol(x,x0,y0,x1,y1){
  return y0*(1-x)+y1*(x-0);
}
panton.mixColors=function(cola,colb,lerp=0.5){
  var retCol=[];
  if(lerp<=0) return cola;
  if(lerp>=1) return colb;
  for(let c=0; c<3; c++){
    // retCol[c]=interpol(lerp,0,cola[c],1,colb[c]);
    retCol[c]=Math.round(cola[c] + (colb[c] - cola[c]) * lerp);
  }
  return retCol;
}
module.exports=panton;
