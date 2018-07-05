//require all the guts
//programmatic:
// var normalizedPath = require("path").join(__dirname, "");

// require("fs").readdirSync(normalizedPath).forEach(function(file) {
//   if(file!="index.js"){
//     // console.log("req"+file);
//     module.exports[file.split(".")[0]]=require("./" + file);
//   }
// });
//transpilable:
module.exports={
  NoteLengthner:require('./NoteLengthner.js'),
  NoteLenManager:require('./NoteLenManager.js'),
  PatchMem:require('./PatchMem.js'),
  record:require('./record.js'),
}