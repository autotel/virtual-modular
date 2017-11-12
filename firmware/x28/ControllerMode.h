
#include "Midi.h"
#include "_name_signals.h"
#include "x28_LedButtons.h"
#ifndef CONTROLLERMODEH
#define CONTROLLERMODEH
//TODO: separate .cpp and .h,
class ControllerMode {

  private:
    Midi *midi;
    LedButtons *ledButtons;
#define serialInLength 32
    unsigned char inBuff[serialInLength];
    byte sendToBrainData [10];

    bool recordingBuffer = false;
    int expectedLength = 0;
    unsigned char currentHeader = 0;
    int byteNumber = 0;

    void sendToBrain(byte header, int len) {
      Serial.write(header);
      for (int a = 0; a < len; a++) {
        Serial.write(sendToBrainData[a]);
      }
      //this ensures that there is a healthy pause between messages
      Serial.write(TH_null_head);
    }
  public:
    ControllerMode() {
      //Serial.begin(SOFTBAUDRATE);
      Serial.write(TH_hello_head);
    }
    void setup(LedButtons *t_ledButtons, Midi *t_midi) {
      ledButtons = t_ledButtons;
      midi = t_midi;
    }
    void onButtonPressed(byte button, uint32_t pressedButtonsBitmap) {
      sendToBrainData[0] = button;
      sendToBrainData[1] = 1;
      sendToBrain(TH_buttonMatrixPressed_head, TH_buttonMatrixPressed_len);
    }
    void onButtonReleased(byte button) {
      sendToBrainData[0] = button;
      sendToBrainData[1] = 0;
      sendToBrain(TH_buttonMatrixReleased_head, TH_buttonMatrixReleased_len);
    }
    void onEncoderScroll(int absolute, int delta) {
      sendToBrainData[0] = delta;
      sendToBrain(TH_encoderScroll_head, TH_encoderScroll_len);
    }
    void onEncoderButtonPressed() {
    }
    void loop() {
      checkMessages();
    }
    void microStep() {
    }

    void step() {
    }
    void restart() {
    }

    void midiIn(uint8_t a, uint8_t b, uint8_t c) {
    }

    bool engagementRequested = false;

    void messageReceived( int len) {
      int a = 0;
      unsigned char header = inBuff[a];
      a++;
      switch (header) {
          while (a < len) {
          case RH_engageControllerMode_head: {
              a += RH_engageControllerMode_len;
              engagementRequested = true;
              break;
            }
          case RH_version_head: {
              //lcdPrintA("connecting");
              sendToBrainData[0] = 6; //len
              sendToBrainData[1] = 'x';
              sendToBrainData[3] = '2';
              sendToBrainData[4] = '8';
              sendToBrainData[5] = 'v';
              sendToBrainData[6] = '1';
              sendToBrain(TH_version_head, 7);
              a++;
              break;
            }
          default:
            a++;
          }
      }
    };

    //this part of the program is computer generated.
    void checkMessages() {
      while (Serial.available() && (byteNumber < serialInLength)) {
        //delayMicroseconds(100);
        unsigned char data_a = Serial.read();
        if (!recordingBuffer) {
          //we are expecting a message header, so we check what header current byte is
          //if is successfull, we start gathering or recording a new data packet.
          //byte  is in our header list?
          switch (data_a) {
            case RH_null_head:
              recordingBuffer = true;
              expectedLength = RH_null_len;
              break;

            case RH_hello_head:
              recordingBuffer = true;
              expectedLength = RH_hello_len;
              break;

            case RH_setMonoMaps_head:
              recordingBuffer = true;
              expectedLength = RH_setMonoMaps_len;
              break;

            case RH_addRedMonomap_head:
              recordingBuffer = true;
              expectedLength = RH_addRedMonomap_len;
              break;

            case RH_addGreenMonomap_head:
              recordingBuffer = true;
              expectedLength = RH_addGreenMonomap_len;
              break;

            case RH_addBlueMonomap_head:
              recordingBuffer = true;
              expectedLength = RH_addBlueMonomap_len;
              break;

            case RH_setRedMonomap_head:
              recordingBuffer = true;
              expectedLength = RH_setRedMonomap_len;
              break;

            case RH_setGreenMonomap_head:
              recordingBuffer = true;
              expectedLength = RH_setGreenMonomap_len;
              break;

            case RH_setBlueMonomap_head:
              recordingBuffer = true;
              expectedLength = RH_setBlueMonomap_len;
              break;

            case RH_setLedN_head:
              recordingBuffer = true;
              expectedLength = RH_setLedN_len;
              break;

            case RH_screenA_head:
              recordingBuffer = true;
              expectedLength = RH_screenA_len;
              break;

            case RH_screenB_head:
              recordingBuffer = true;
              expectedLength = RH_screenB_len;
              break;

            case RH_comTester_head:
              recordingBuffer = true;
              expectedLength = RH_comTester_len;
              break;

            case RH_engageControllerMode_head:
              recordingBuffer = true;
              expectedLength = RH_engageControllerMode_len;
              break;

            case RH_version_head:
              recordingBuffer = true;
              expectedLength = RH_version_len;
              break;

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
            } else if (byteNumber < expectedLength) {
              //a new byte arrived and is added to the current packet
              inBuff[byteNumber] =  data_a;
              byteNumber++;
            } else {
              //a whole expected packet arrived
              inBuff[byteNumber] = data_a;
              recordingBuffer = false;
              messageReceived(byteNumber);
              byteNumber = 0;
            }
          } else {
            //a byte arrived, but there is no packet gathering bytes
            // lcdPrintA("inv");
            //lcdPrintB("i" + String(data_a, HEX) + "ex" + expectedLength + "len:" + byteNumber);
          }
        }
      }
    }
};
#endif;
