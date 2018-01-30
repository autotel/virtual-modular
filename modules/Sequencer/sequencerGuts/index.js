//require all the guts
var normalizedPath = require("path").join(__dirname, "");
require("fs").readdirSync(normalizedPath).forEach(function(file) {
  if(file!="index.js"){
    // console.log("req"+file);
    module.exports[file.split(".")[0]]=require("./" + file);
  }
});