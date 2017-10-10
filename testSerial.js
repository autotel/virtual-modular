'use strict';
var SerialPort = require('serialport');

for (var pname of ["COM17","COM23"]){
  new(function(){
    var port = new SerialPort(pname,{ baudRate: 115200 });//
    var count=0;

    port.on('open', function() {
      port.write("Hello from usbserial", function(err) {
        if (err) {
          return console.log('Error on write: ', err.message);
        }
        /**/console.log('out');
      });

      var a=0;
      var i=false;
      port.on('data', function (data) {
        setTimeout(function(){
          if(!i){
            i=setInterval(function(){
              port.write(new Buffer([2,a, a*2,a*3, a*4,a*5,a*6, 3,7,a+1,a+2,a+3,a+4,a+5,a+6,a+7 ]), function(err) {
                if (err) {
                  return console.log('Error on write: ', err.message);
                }
                // console.log('out');
              });
              a++;
            },50);
          }
          /**/console.log('in: ',data);
        },500);
      });
    });
  })();
}
