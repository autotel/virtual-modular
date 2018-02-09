var RASPISERIAL=true;



if(RASPISERIAL){
  console.log("using raspi serial");

  const raspi = require('raspi');
  const RaspiSerial = require('./raspi-serial-clone.js').Serial;


  // raspi.init(() => {
  //   var serial = new Serial();
  //   Serial.list=function(args){
  //     console.log("DUMMY SERIAL");
  //     return new Promise(function(arguments){
  //       console.log(JSON.stringify(arguments));
  //     });
  //   }
  //
  //   serial.open(() => {
  //     serial.write('Hello from raspi-serial');
  //     serial.on('data', (data) => {
  //       process.stdout.write(data);
  //     });
  //   });
  // });



  module.exports=RaspiSerial;

}else{
  var SerialPort=require('serialport');
  module.exports=SerialPort;
}