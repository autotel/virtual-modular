module.exports=function(array){
    var htmlStr="";
    for(var itm in array){
        if(itm){
            htmlStr += '<img src="./res/btn_s_'+array[itm]+'.png">';
        }else{
            htmlStr+='<img src="./res/btn_s_false.png">';
        }
    }
    return htmlStr;
}