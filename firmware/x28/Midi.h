#include "_name_signals.h"
#ifndef MIDIH
#define MIDIH
class Midi {
  private:
    uint8_t waitingMidi = 0;
    uint8_t expectedMessageLength = 0;
    void (*CB_midiIn)(uint8_t, uint8_t, uint8_t) = 0;
    void midiInCallback(uint8_t a , uint8_t b , uint8_t c) {
      if ( 0 != CB_midiIn ) {
        (*CB_midiIn)(a, b, c);
      }
    }
    uint8_t getMessageExpectedLength(uint8_t header) {
      uint8_t fheader = header >> 4;
      switch (fheader) {
        case 0b1000: return 3; //noteoff
        case 0b1001: return 3; //noteon
        case 0b1010: return 3; //polipressure
        case 0b1011: return 3; //cchange
        case 0b1100: return 2; //programchange
        case 0b1101: return 2; //channelpressure
        case 0b1110: return 3; //pitch bend
        case 0b1111: { //system
            switch (header) {
              case 0b11110001: return 2; //midi time code
              case 0b11110010: return 3; //song position
              case 0b11110011: return 2; //song select
              case 0b11111000: return 1; //clock
              case 0b11111010: return 1; //start
              case 0b11111011: return 1; //continue
              case 0b11111100: return 1; //stop
              case 0b11111110: return 1; //keepalive
              case 0b11111111: return 1; //reset device
              default: return 1;
            }
          }
        default:
          return 1;
      }
    }
  public:
    Midi() {
    }
    uint8_t lostBytes = 0;
    uint8_t lastLostByte = 0;
    void setup() {
      Serial1.begin(31250);
    }
    void onMidiIn( void (*fpa)(uint8_t, uint8_t, uint8_t)) {
      CB_midiIn = fpa;
    }
    void loop() {
      //this reception algorhithm doesn't work well yet.|
      while (Serial1.available()) {
        uint8_t inbuf [] = {0,0,0};
        if (expectedMessageLength == 0) {
          expectedMessageLength = getMessageExpectedLength(Serial1.peek());
        }
        if (Serial1.available() >= expectedMessageLength) {
          for(uint8_t a=0; a<expectedMessageLength; a++){
            inbuf[a]=Serial1.read();
          }
          in(inbuf[0], inbuf[1], inbuf[2]);
          expectedMessageLength=0;
        } else {
          //timeout between bytes
          if (waitingMidi > 2) {
            while (Serial1.available() > 0) {
              uint8_t t = Serial1.read();

              in(t, 0, 0);
              if (t != 0xfe) {
                lostBytes++;
                lastLostByte = t;
              }
            }
            waitingMidi = 0;
            expectedMessageLength=0;
          }
          waitingMidi++;
          break;
        }

      }
    }

    void out(uint8_t a, uint8_t b, uint8_t c) {
      Serial1.write(a);
      Serial1.write(b);
      Serial1.write(c);
    }
    void in(uint8_t a, uint8_t b, uint8_t c) {
      midiInCallback(a, b, c);
    }

};
#endif
