
#include "Midi.h"
#include "_name_signals.h"
#include "x28_LedButtons.h"
// #include <TBN.h>
#include "PatchBus.h"

#ifndef CONTROLLERMODEH
#define CONTROLLERMODEH
//TODO: separate .cpp and .h,
class ControllerMode {
  private:
    Midi *midi;
    LedButtons *hardware;
    // TBN *patchBus;
    PatchBus *patchBus;
#define serialInLength 32
    unsigned char inBuff[serialInLength];
    byte sendToBrainData [32];
    bool recordingBuffer = false;
    int expectedLength = 0;
    unsigned char currentHeader = 0;
    int byteNumber = 0;

    void sendToBrain(byte header, int len) {
      Serial.write(header);
      for (int a = 0; a < len; a++) {
        Serial.write(sendToBrainData[a]);
        sendToBrainData[a]=0;
      }
      //this ensures that there is a healthy pause between messages
      Serial.write(TH_null_head);
    }
  public:
    ControllerMode() {
      //Serial.begin(SOFTBAUDRATE);
      Serial.write(TH_hello_head);
    }
    void setup(LedButtons *t_hardware, Midi *t_midi, PatchBus *t_bus) {
      hardware = t_hardware;
      midi = t_midi;
      patchBus = patchBus;


    }

    void onEncoderScrolled(int8_t delta) {
      sendToBrainData[0] = delta;
      sendToBrain(TH_encoderScrolled_head, TH_encoderScrolled_len);
    }
    void onEncoderPressed() {
      sendToBrain(TH_encoderPressed_head, TH_encoderPressed_len);
    }
    void onEncoderReleased() {
      sendToBrain(TH_encoderReleased_head, TH_encoderReleased_len);
    }
    void onButtonPressed(byte button, uint32_t pressedButtonsBitmap) {
      if (button > 23) {
        onSelectorButtonPressed(button - 16);
      } else if (button > 7) {
        onMatrixButtonPressed(button - 8);
      } else {
        onSelectorButtonPressed(button);
      }
    }
    void onButtonReleased(byte button) {
      if (button > 23) {
        onSelectorButtonReleased(button - 16);
      } else if (button > 7) {
        onMatrixButtonReleased(button - 8);
      } else {
        onSelectorButtonReleased(button);
      }
    }

    void onBottomButtonPressed(uint8_t button) {
      sendToBrainData[0] = button;
      sendToBrain(TH_bottomButtonPressed_head, TH_bottomButtonPressed_len);
    }
    void onBottomButtonReleased(uint8_t button) {
      sendToBrainData[0] = button;
      sendToBrain(TH_bottomButtonReleased_head, TH_bottomButtonReleased_len);
    }

    void onMatrixButtonPressed(uint8_t button) {
      sendToBrainData[0] = button;
      sendToBrain(TH_matrixButtonPressed_head, TH_matrixButtonPressed_len);
    }
    void onSelectorButtonPressed(uint8_t button) {
      sendToBrainData[0] = button;
      sendToBrain(TH_selectorButtonPressed_head, TH_selectorButtonPressed_len);
    }


    void onMatrixButtonReleased(uint8_t button) {
      sendToBrainData[0] = button;
      sendToBrain(TH_matrixButtonReleased_head, TH_matrixButtonReleased_len);
    }
    void onSelectorButtonReleased(uint8_t button) {
      sendToBrainData[0] = button;
      sendToBrain(TH_selectorButtonReleased_head, TH_selectorButtonReleased_len);
    }

    void onButtonVelocity(uint8_t button, uint8_t velocity){
      sendToBrainData[0] = button;
      sendToBrainData[1] = velocity;
      sendToBrain(TH_matrixButtonVelocity_head, TH_matrixButtonVelocity_len);
    }
    //long testTimer = 0;
    void loop() {
      checkMessages();
      /*if (millis() - testTimer > 1000) {
        testTimer=millis();
        //hardware->lcdPrintA(String(testTimer));
        }*/
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
      inBuff[a]=0;
      a++;
#define nibbleMultiplyFactor 17
      switch (header) {
          while (a < len) {
          case RH_engageControllerMode_head: {
              a += RH_engageControllerMode_len;
              engagementRequested = true;
              break;
            }
          case RH_setMonoMaps_head: {
              //( red monomap 0, red monomap 1, red monomap 2, red monomap 3<<4 | intensity ... )
              //draw in bitmap the corresponding byte
              uint32_t writeColorChannels [] = {0, 0, 0};
              writeColorChannels [1] |= inBuff[a + 0]
                                        | (inBuff[a + 1] << 8)
                                        | (inBuff[a + 2] << 16)
                                        | (inBuff[a + 3] << 24);
              writeColorChannels [0] |= inBuff[a + 4]
                                        | (inBuff[a + 5] << 8)
                                        | (inBuff[a + 6] << 16)
                                        | (inBuff[a + 7] << 24);
              writeColorChannels [2] |= inBuff[a + 8]
                                        | (inBuff[a + 9] << 8)
                                        | (inBuff[a + 10] << 16)
                                        | (inBuff[a + 11] << 24);


              uint8_t intensities [] = {
                (inBuff[a + 3] | 0xf) * nibbleMultiplyFactor,
                (inBuff[a + 7] | 0xf) * nibbleMultiplyFactor,
                (inBuff[a + 11] | 0xf) * nibbleMultiplyFactor
              };

              for (uint8_t pixel = 0; pixel < 28; pixel++) {
                uint8_t pxch[] = {0, 0, 0};
                uint8_t defCol [] = {127, 130, 200};
                for (uint8_t n = 0; n < 3; n++) {
                  if ((writeColorChannels[n] >> pixel) & 1) {
                    pxch[n] = defCol[n];
                  }
                }
                hardware->setButtonColor(pixel, pxch[0]*intensities[0], pxch[1]*intensities[1], pxch[2]*intensities[2]);
              }
              a += RH_setMatrixMonoMap_len;

              break;
            }
          case RH_setSelectorMonoMap_head: {
              uint16_t writeColorChannels [] = {0, 0, 0};
              writeColorChannels [1] = inBuff[a + 0] | (inBuff[a + 1] << 8);
              writeColorChannels [0] = inBuff[a + 2] | (inBuff[a + 3] << 8);
              writeColorChannels [2] = inBuff[a + 4] | (inBuff[a + 5] << 8);
              for (uint8_t pixel = 0; pixel < 12; pixel++) {
                uint8_t pxch[] = {0, 0, 0};
                uint8_t defCol [] = {127, 130, 200};
                for (uint8_t n = 0; n < 3; n++) {
                  if ((writeColorChannels[n] >> pixel) & 1) {
                    pxch[n] = defCol[n];
                  }
                }
                if (pixel > 7) {
                  hardware->setButtonColor(pixel + 15, pxch[0], pxch[1], pxch[2]);
                } else {
                  hardware->setButtonColor(pixel, pxch[0], pxch[1], pxch[2]);
                }
              }
              a += RH_setSelectorMonoMap_len;
              break;
            }
          case RH_setMatrixMonoMap_head: {

              uint16_t writeColorChannels [] = {0, 0, 0};
              writeColorChannels [1] = inBuff[a + 0] | (inBuff[a + 1] << 8);
              writeColorChannels [0] = inBuff[a + 2] | (inBuff[a + 3] << 8);
              writeColorChannels [2] = inBuff[a + 4] | (inBuff[a + 5] << 8);
              for (uint8_t pixel = 0; pixel < 16; pixel++) {
                uint8_t pxch[] = {0, 0, 0};
                uint8_t defCol [] = {127, 130, 200};
                for (uint8_t n = 0; n < 3; n++) {
                  if ((writeColorChannels[n] >> pixel) & 1) {
                    pxch[n] = defCol[n];
                  }
                }
                hardware->setButtonColor(pixel + 8, pxch[0], pxch[1], pxch[2]);
              }
              a += RH_setMatrixMonoMap_len;



              break;
            }
            case RH_setColorMonoMapsToColorFrom_head: {
            // colR,colG,colB,from,monomaps
              a++;

              uint8_t colorValues [] = {inBuff[a+1], inBuff[a], inBuff[a+2]};

              uint8_t startPixel=inBuff[a+3];
              uint32_t writeColorChannels = 0;

              for (uint8_t bitnum=4; bitnum<(len-1); bitnum++){
                uint8_t mm=bitnum-4;
                writeColorChannels |= (uint32_t) inBuff[a + bitnum] << (mm * 8);//
              }
              uint8_t pixelsAmount=(len-3)*8;
              for (uint32_t readPixel = 0; readPixel < pixelsAmount; readPixel++) {
                uint8_t pxch =(writeColorChannels>>readPixel)& 1;
                hardware->setButtonColor(readPixel+startPixel,  pxch*colorValues[0],pxch*colorValues[1],pxch*colorValues[2]);
              }


              a += len;
              break;
          }
          case RH_addColorMonoMapsToColorFrom_head: {
            #define DEBUGTIME false
              #if DEBUGTIME
              unsigned long started=millis();
              #endif
            // colR,colG,colB,from,monomaps
              a++;
              uint8_t colorValues [] = {inBuff[a+1], inBuff[a], inBuff[a+2]};

              uint8_t startPixel=inBuff[a+3];
              uint32_t writeColorChannels = 0;

              for (uint8_t bitnum=4; bitnum<(len-1); bitnum++){
                uint8_t mm=bitnum-4;
                writeColorChannels |= (uint32_t) inBuff[a + bitnum] << (mm * 8);//
              }
              uint8_t pixelsAmount=(len-3)*8;
              for (uint32_t readPixel = 0; readPixel < pixelsAmount; readPixel++) {
                if((writeColorChannels>>readPixel)& 1){
                  hardware->setButtonColor(readPixel+startPixel,  colorValues[0],colorValues[1],colorValues[2]);
                }
              }
              a += len;
              #if DEBUGTIME
              unsigned long oplen=millis()-started;
              char screenTxt [14] = "------------";
              sprintf(screenTxt, "%lu", oplen);
              hardware->lcdPrintA((char&)screenTxt, 13);
              #endif
              break;
          }
          case RH_screenA_head: {
              a++;
              hardware->lcdPrintA((char&)inBuff[a], len);
              a += len;
              break;
            }
          case RH_screenB_head: {
              a++;
              hardware->lcdPrintB((char&)inBuff[a], len);
              a += len;
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
            inBuff[a]=0;
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

    case RH_setColorMonoMapsToColorFrom_head:
      recordingBuffer = true;
      expectedLength = RH_setColorMonoMapsToColorFrom_len;
      break;

    case RH_addColorMonoMapsToColorFrom_head:
      recordingBuffer = true;
      expectedLength = RH_addColorMonoMapsToColorFrom_len;
      break;

    case RH_setMatrixMonoMap_head:
      recordingBuffer = true;
      expectedLength = RH_setMatrixMonoMap_len;
      break;

    case RH_setSelectorMonoMap_head:
      recordingBuffer = true;
      expectedLength = RH_setSelectorMonoMap_len;
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

    case RH_disengageControllerMode_head:
      recordingBuffer = true;
      expectedLength = RH_disengageControllerMode_len;
      break;

    case RH_version_head:
      recordingBuffer = true;
      expectedLength = RH_version_len;
      break;

       }   }
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
            messageReceived( byteNumber);
            byteNumber = 0;
          }
        } else {
          //a byte arrived, but there is no packet gathering bytes
          // lcdPrintA("inv");
          //lcdPrintB("i" + String(data_a, HEX) + "ex" + expectedLength + "len:" + byteNumber);
        }
      }
    }
    //----cg. END---

};
#endif;
