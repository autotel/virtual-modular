#include "Midi.h"
#include "_name_signals.h"
#include "x28_LedButtons.h"
#ifndef MONOSEQUENCERH
#define MONOSEQUENCERH
//TODO: separate .cpp and .h, capitalize filename
class MonoSequencer {

  private:
    int patMem [16][3];
    int playHead = 0;
    uint8_t microStepCount = 0;
    uint8_t microSteps = 12;
    Midi *midi;
    LedButtons *ledButtons;
  public:
    MonoSequencer() {
      for (uint16_t b = 0; b < 16; b++) {
        for (uint16_t a = 0; a < 3; a++) {
          patMem[b][a] = 0;
        }
      }

    }
    void setup(LedButtons *t_ledButtons, Midi *t_midi) {
      ledButtons = t_ledButtons;
      midi = t_midi;
    }

    void onButtonPressed(byte button, uint32_t pressedButtonsBitmap) {
      button -= 8;
      button %= 16;
      if (patMem[button][0] == 0) {
        patMem[button][0] = 0x90;
        patMem[button][1] = 0x40;
        patMem[button][2] = 80;
      } else {
        if (patMem[button][2] == 0x90) {
          patMem[button][2] = 127;
        } else {
          patMem[button][0] = 0;
        }
      }
    }
    void onButtonReleased(byte button) {
    }
    void onEncoderScrolled(int8_t delta) {
    }
    void onEncoderPressed() {
    }
    void onEncoderReleased() {
    }
    void loop() {
      for (uint16_t b = 0; b < 16; b++) {
        if (patMem[b][0] == 0) {
          ledButtons->setButtonColor(b + 8, 0, 0, 0);
        } else {
          if (patMem[b][2] >= MIDI_noteOn) {
            ledButtons->setButtonColor(b + 8, patMem[b][2], 0, 0);
          } else {
            ledButtons->setButtonColor(b + 8, patMem[b][2] / 2, 6, 6);
          }
        }
      }
      ledButtons->setButtonColor(playHead + 8, 100, 100, 100);
    }
    void microStep() {
      microStepCount++;
      if (microStepCount >= microSteps) {
        microStepCount = 0;
        step();
      }
    }

    void step() {
      playHead++;
      playHead %= 16;
      if (patMem[playHead][0] != 0) {
        midi->out(patMem[playHead][0], patMem[playHead][1], patMem[playHead][2]);
      }
    }
    void restart() {
      playHead = 0;
      microStepCount = 0;
    }

    void midiIn(uint8_t a, uint8_t b, uint8_t c) {
      switch (a) {
        case 250: restart();    break;
          //case 248: microStep();  break;

      }
    }
};

#endif;
