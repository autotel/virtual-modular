var fs = require('fs');
var file = fs.readFileSync('_name_signals.h', "utf8");

var lines=file.split('\n');

var casePattern="\n\
case {RHEAD}:\n\
  recordingBuffer = true;\n\
  expectedLength = {RLEN};\n\
  break;\n\
  ";
var outString="//this part of the program is computer generated. \n\
void checkMessages() {\n\
  while (Serial.available() && (byteNumber < serialInLength)) {\n\
    //delayMicroseconds(100);\n\
    unsigned char data_a = Serial.read();\n\
    if (!recordingBuffer) {\n\
      //we are expecting a message header, so we check what header current byte is\n\
      //if is successfull, we start gathering or recording a new data packet.\n\
      //byte  is in our header list?\n\
      switch (data_a) {";
var stringEnd="\n      }\n\
    if (recordingBuffer) {\n\
      if (expectedLength == unknown) {\n\
        if (byteNumber == 0) {\n\
          //get header and +1\n\
          inBuff[byteNumber] = data_a;\n\
          byteNumber++;\n\
        } else if (byteNumber == 1) {\n\
          //undetermined length so byte 2 must be length\n\
          inBuff[byteNumber] = data_a;\n\
          expectedLength = data_a + 1;\n\
          byteNumber++;\n\
        }\n\
      } else if (byteNumber < expectedLength) {\n\
        //a new byte arrived and is added to the current packet\n\
        inBuff[byteNumber] =  data_a;\n\
        byteNumber++;\n\
      } else {\n\
        //a whole expected packet arrived\n\
        inBuff[byteNumber] = data_a;\n\
        recordingBuffer = false;\n\
        messageReceived( byteNumber);\n\
        byteNumber = 0;\n\
      }\n\
    } else {\n\
      //a byte arrived, but there is no packet gathering bytes\n\
      // lcdPrintA(\"inv\");\n\
      //lcdPrintB(\"i\" + String(data_a, HEX) + \"ex\" + expectedLength + \"len:\" + byteNumber);\n\
    }\n\
  }\n\
}";
var cache={};
var comConsts={};
for(var line of lines){
  var words=line.split(/ +/g);
  // console.log(words);
  if(words[0]=="#define"){
    cache[words[1]]=words[2];
  }
}
for(var name in cache){
  if(cache[name]){
    var subWords=name.split('_');
    if(subWords[0]=="RH")
    if(subWords[2]=="head"){
      var addString=casePattern;
      addString=addString.replace('{RHEAD}',name);
      addString=addString.replace('{RLEN}',"RH_"+subWords[1]+"_len");
      outString+=addString;
    }
  }
}

outString+=stringEnd;
fs.writeFile("./generated/checkMessagesFn.txt", outString, function(err) {
    if(err) {
        return console.log(err);
    }
    console.log("The file was saved!");
});
console.log(comConsts);
