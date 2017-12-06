'use strict';
var SerialPort = require('serialport');
var baudRate = 19200;

function init() {
  //open Serial hardware interfaces
  var listPromise = SerialPort.list(function(err, ports) {
    if (err) {
      console.error(err);
    }
    ports.forEach(function(port) {
      try {
        console.log("PORT");
        console.log(port.comName);
        console.log(port.pnpId);
        console.log(port.manufacturer);
      } catch (e) {
        console.error(e);
      }
      portInteract(port);
    });
  });
  listPromise.catch(function(e) {
    console.log(e);
  });

}
var state=0;
function portInteract(port) {
  let newPort = new SerialPort(port.comName, {
    baudRate: baudRate
  });
  newPort.on('open', function() {
    var established = false;

    newPort.on('data', (data) => {
      console.log("INCOM",port.comName);
      var hiTimeout;
      var dataString=dataToString(data);
      if(state==0&&dataString.indexOf("x")!==-1){
        state=1;
      }
      console.log(dataString);
      if (state==0) {
        var hiTimeout=setTimeout(function(){
          newPort.write(new Buffer([0x40]), function(error) {
            if (error) {
              console.log("error sending init val", error);
            }
            console.log("s x40");
          });
        },500);

      } else if(state==1){
        setTimeout(function(){
          newPort.write(new Buffer([0xF]),console.error);
        },200);
        state++;
      } else {
        console.log(data);

      }
    });
  });
}
function dataToString(data){
  var string="";
  var finished=false;
  var started=true;
  for (var i = 0; i < data.length && !finished; i++) {
    if(started){
      string += String.fromCharCode(parseInt(data[i]));
    }else{
      string="";
      started = (data[i]==0x40);
    }
    if(data[i]==3){
      finished=true;
    }
  }
  return string;
}
init();