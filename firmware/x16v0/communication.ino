#define serialInLength 32
unsigned char inBuff[serialInLength];

bool recordingBuffer = false;
int expectedLength = 0;
unsigned char currentHeader = 0;
int byteNumber = 0;


void checkMessages() {
  while (Serial.available() && (byteNumber < serialInLength)) {
    //delayMicroseconds(100);
    unsigned char data_a = Serial.read();

    if (!recordingBuffer) {
      //we are expecting a message header, so we check what header current byte is
      //if is successfull, we start gathering or recording a new data packet.

      //byte  is in our header list?
      switch (data_a) {
        case RH_null:
          // lcdPrintA("H_null");
          recordingBuffer = true;
          expectedLength = RH_null_len;
          break;
        case RH_hello:
          // lcdPrintA("H_hello");
          recordingBuffer = true;
          expectedLength = RH_hello_len;
          break;
        case RH_ledMatrix:
          // lcdPrintA("dMatrix");
          recordingBuffer = true;
          expectedLength = RH_ledMatrix_len;
          break;
        case RH_screenA:
          // lcdPrintA("screenA");
          recordingBuffer = true;
          expectedLength = RH_screenA_len;
          break;
        case RH_screenB:
          // lcdPrintA("screenB");
          recordingBuffer = true;
          expectedLength = RH_screenB_len;
          break;
        case RH_setInteractionMode:
          // lcdPrintA("ionMode");
          currentHeader = data_a;
          expectedLength = RH_setInteractionMode_len;
          break;
        case RH_currentStep:
          // lcdPrintA("entStep");
          recordingBuffer = true;
          expectedLength = RH_currentStep_len;
          break;
        case RH_comTester:
          // lcdPrintA("mTester");
          recordingBuffer = true;
          expectedLength = RH_comTester_len;
          break;
        case RH_version:
          recordingBuffer = true;
          expectedLength = RH_version_len;
          break;

      }
    }

    if (recordingBuffer) {
      if (expectedLength == unknown) {
        if (byteNumber == 0) {
          //get header and +1
          inBuff[byteNumber] = data_a;
          byteNumber++;
        } else if (byteNumber == 1) {
          //undetermined length so byte 2 must be length
          inBuff[byteNumber] = data_a;
          expectedLength = data_a + 1;
          byteNumber++;
        }

        // inBuff[byteNumber]=data_a;
        // byteNumber++;
        // if(data_a=='\0'){
        //   expectedLength=byteNumber;
        // }
      } else if (byteNumber < expectedLength) {
        //a new byte arrived and is added to the current packet
        inBuff[byteNumber] =  data_a;
        byteNumber++;
      } else {
        //a whole expected packet arrived
        inBuff[byteNumber] = data_a;
        recordingBuffer = false;
        messageReceived(inBuff, byteNumber);
        byteNumber = 0;
      }
    } else {
      //a byte arrived, but there is no packet gathering bytes
      // lcdPrintA("inv");
      lcdPrintB("i" + String(data_a, HEX) + "ex" + expectedLength + "len:" + byteNumber);
    }
    // byteNumber++;
  }

  // if (byteNumber)
  //   messageReceived(inBuff, byteNumber);

}

//available queue for outgoing messages
byte sendToBrainData [] = {0, 0, 0, 0, 0, 0, 0};

void sendToBrain(byte header, int len) {
  Serial.write(header);
  for (int a = 0; a < len; a++) {
    Serial.write(sendToBrainData[a]);
  }
  //this ensures that there is a healthy pause between messages
  Serial.write(TH_null);
}


//react and split messages
void messageReceived(unsigned char datarray [], int len) {

  int a = 0;
  unsigned char header = datarray[a];
  a++;
  switch (header) {
      while (a < len) {

      case RH_ledMatrix: {
          // lcdPrintA("rcv ledmatrix");
          //layers[0]=layers[1]=layers[2]=datarray[a];
          layers[2] = datarray[a + 0] | (datarray[a + 1] << 8);
          layers[0] = datarray[a + 2] | (datarray[a + 3] << 8);
          layers[1] = datarray[a + 4] | (datarray[a + 5] << 8);
          a += RH_ledMatrix_len;
          //lcdPrintB("B"+String(layers[0],HEX)+"C"+(char)layers[0]);
          break;
        }
      case RH_comTester: {
          lcdPrintA("com test");
          lcdPrintB(String(datarray[a], HEX));
          break;
        }
      case RH_screenA: {
          a++;//skip length byte
          String ns = "";
          for (int k = a; k < len; k++) {
            ns += String((char)datarray[k]);
          }
          lcdPrintA(ns);
          break;
        }
      case RH_screenB: {
          a++;//skip length byte
          String ns = "";
          for (int k = a; k < len; k++) {
            ns += String((char)datarray[k]);
          }
          lcdPrintB(ns);
          a += len;
          break;
        }
      case RH_version: {
          // lcdPrintA("rcv hello");
          sendToBrainData[0] = 6; //len
          sendToBrainData[1] = 'x';
          sendToBrainData[3] = '1';
          sendToBrainData[4] = '6';
          sendToBrainData[5] = 'v';
          sendToBrainData[6] = '0';
          sendToBrain(TH_version, 7);
          break;
        }
      default:
        a++;
      }
  }
}

