//from https://stackoverflow.com/questions/27078285/simple-throttle-in-js
module.exports=function(callback, limit) {
    var wait = false;
    return function () {
      if (!wait) {
        callback.apply(null, arguments);
        wait = true;
        setTimeout(function () {
          wait = false;
        }, limit);
      }
    }
}