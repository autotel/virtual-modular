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
        case RH_test_lcdDirect:
          recordingBuffer = true;
          expectedLength = RH_test_lcdDirect_len;
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
      lcdPrintA("inv");
      lcdPrintB("i" + String(data_a, HEX) + "ex" + expectedLength + "len:" + byteNumber);
    }
    // byteNumber++;
    // if (byteNumber)
    //   messageReceived(inBuff, byteNumber);
    if (Serial.available() && (byteNumber >= serialInLength)) {
      delay(100);
      byteNumber = 0;

      lcdPrintA("SERIAL IN");
      lcdPrintB("OVERFLOW");

    }
  }


}

//available queue for outgoing messages
byte sendToBrainData [] = {0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0};

void sendToBrain(byte header, int len) {
  Serial.write(header);
  for (int a = 0; a < len; a++) {
    Serial.write(sendToBrainData[a]);
  }
  //this ensures that there is a healthy pause between messages
  Serial.write(TH_null);
}

//String ns="                ";
//react and split messages
void messageReceived(unsigned char datarray [], int len) {
  if (activeAnimation) {
    activeAnimation = false;
    setButtonColor(0, 70, 70, 70);
    setButtonColor(1, 70, 70, 70);
    setButtonColor(2, 70, 70, 70);
    setButtonColor(3, 127, 127, 10);
    setButtonColor(4, 0, 0, 0);
    setButtonColor(5, 0, 0, 0);
    setButtonColor(6, 0, 0, 0);
    setButtonColor(7, 0, 0, 0);
  }
  int a = 0;
  unsigned char header = datarray[a];
  uint16_t writeColorChannels [] = {0, 0, 0};
  a++;
  switch (header) {
      while (a < len) {

      case RH_ledMatrix: {
          writeColorChannels [1] = datarray[a + 0] | (datarray[a + 1] << 8);
          writeColorChannels [0] = datarray[a + 2] | (datarray[a + 3] << 8);
          writeColorChannels [2] = datarray[a + 4] | (datarray[a + 5] << 8);
          for (uint8_t pixel = 0; pixel < 16; pixel++) {
            uint8_t pxch[] = {0, 0, 0};
            uint8_t defCol [] = {127, 130, 200};
            for (uint8_t n = 0; n < 3; n++) {
              if ((writeColorChannels[n] >> pixel) & 1) {
                pxch[n] = defCol[n];
              }
            }
            setButtonColor(23 - hflip(pixel), pxch[0], pxch[1], pxch[2]);
          }
          a += RH_ledMatrix_len;
          /*lcdPrintB("B"+String(layers[0],HEX)+"C"+(char)layers[0]);*/
          break;
        }
      case RH_comTester: {
          lcdPrintA("com test");
          lcdPrintB(String(datarray[a], HEX));
          break;
        }
      case RH_screenA: {

          a++;//skip length byte
          screenA = "";
          for (int k = a; k < len; k++) {
            screenA += String((char)datarray[k]);
          }
          lcdPrintA(screenA);
          break;
        }
      case RH_screenB: {
          a++;//skip length byte
          screenB = "";
          for (int k = a; k < len; k++) {
            screenB += String((char)datarray[k]);
          }
          lcdPrintB(screenB);
          a += len;
          break;
        }
      case RH_version: {
          lcdPrintA("connecting");
          sendToBrainData[0] = 6; //len
          sendToBrainData[1] = 'x';
          sendToBrainData[3] = '1';
          sendToBrainData[4] = '6';
          sendToBrainData[5] = 'v';
          sendToBrainData[6] = '0';
          sendToBrain(TH_version, 7);
          a++;
          break;
        }
      case RH_test_lcdDirect: {
          uint8_t pmask = 0xff >> 2;
          DDRL = pmask;
          PORTL = datarray[a] & pmask;
          a++;
        }
      default:
        a++;
      }
  }
}

