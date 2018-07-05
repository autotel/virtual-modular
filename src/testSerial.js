'use strict';
var SerialPort = require('serialport');

for (var pname of ["COM17","COM23","COM21"]){
  new(function(){
    var port = new SerialPort(pname,{ baudRate: 19200 });//
    var count=0;

    port.on('open', function() {
      // port.write(new Buffer([0xd]),console.log);
      // var a=0;
      // setInterval(function(){
      //   a++;
      //   port.write(new Buffer([a]),function(e){
      //     if(e){
      //       console.log(e)
      //     }else{
      //       console.log(`wr${a}`);
      //     }
      //   });
      // },200);
      setTimeout(function(){
        port.write([0xf]);
      },1200);
      port.on('data', function (data) {
        console.log('in: ',data);
      });
    });
  })();
}
