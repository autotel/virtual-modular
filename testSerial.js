'use strict';
var SerialPort = require('serialport');

for (var pname of ["COM17","COM23","COM21"]){
  new(function(){
    var port = new SerialPort(pname,{ baudRate: 19200 });//
    var count=0;

    port.on('open', function() {
      // port.write(new Buffer([0xd]),console.log);
      var a=0;
      setInterval(function(){
        a++;
        port.write(new Buffer([a]),function(e){
          if(e){
            console.log(e)
          }else{
            console.log(`wr${a}`);
          }
        });
      },200);
      // port.on('data', function (data) {
      //   if(data[0]==2||data[0]==3){
      //     port.write(new Buffer([65,data[2],65,data[3]]), function(err) {
      //       if (err) {
      //         return console.log('Error on write: ', err.message);
      //       }
      //       console.log('out ',data[2],data[3]);
      //     });
      //   }
      // /**/console.log('in: ',data);
      // });
    });
  })();
}
