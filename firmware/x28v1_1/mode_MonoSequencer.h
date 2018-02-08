#include "Midi.h"
#include "_name_signals.h"
#include "x28_LedButtons.h"
// #include <TBN.h>
#include "PatchBus.h"
#ifndef MONOSEQUENCERH
#define MONOSEQUENCERH
#define BTN_eventSelector 0
// #include "submode_eventEditor.h"
//TODO: separate .cpp and .h, capitalize filename
class MonoSequencer {
  private:
    uint8_t patMem [16][3];
    uint8_t microStepCount = 0;
    uint8_t microSteps = 12;
    Midi *midi;
    LedButtons *ledButtons;
    // EventEditor mainEventEditor=EventEditor();
    // TBN *patchBus;
    PatchBus *patchBus;
  public:
    uint8_t playHead = 0;
    MonoSequencer() {
      for (uint16_t b = 0; b < 16; b++) {
        for (uint16_t a = 0; a < 3; a++) {
          patMem[b][a] = 0;
        }
      }
    }
    void setup(LedButtons *t_ledButtons, Midi *t_midi, PatchBus *t_bus) {
      ledButtons = t_ledButtons;
      midi = t_midi;
      patchBus=t_bus;
    }
    void onBusMessageReceived(uint8_t * message,uint8_t len){
      // char mes [6]="mes__";
      // mes[3]=(*message)+48;
      // mes[4]=(*message)+48;
      // ledButtons->lcdPrintB(message,len);
      step(message[1]);
    }
    uint8_t test_count=0;
    void onButtonPressed(uint8_t button, uint32_t pressedButtonsBitmap) {
      if (button < 8) {
        uint8_t selectorButton = button;
        if (selectorButton == BTN_eventSelector) {
          // mainEventEditor.engage();
        }
      } else if (button < 24) {
        // if (mainEventEditor.engaged) {
          // mainEventEditor.selectCurrentIndex(button);
        // } else {
          uint8_t matrixButton = button - 8;
          //matrixButton %= 16;
          if (patMem[matrixButton][0] == 0) {
            //for now I matched internal headers with midi headers to make testing easier.
            //an internal message thus results in a valid midi message upon merging the headers
            // patMem[matrixButton][0] = (mainEventEditor.currentEvent[0] << 4) | mainEventEditor.currentEvent[1];
            // patMem[matrixButton][1] = mainEventEditor.currentEvent[2];
            // patMem[matrixButton][2] = mainEventEditor.currentEvent[3];
            patMem[matrixButton][0] = (EH_TRIGGERONHEADER<<4) | 1;
            patMem[matrixButton][1] = test_count;
            patMem[matrixButton][2] = 100;
            test_count++;
          } else {
            patMem[matrixButton][0] = 0;
          }
        // }
      } else {
        uint8_t bottomButton = button - 24;
      }
    }
    void onButtonReleased(byte button) {
      if (button < 8) {
        uint8_t selectorButton = button;
        if (selectorButton == BTN_eventSelector) {
          // mainEventEditor.disengage();
        }
      } else if (button < 24) {
        uint8_t matrixButton = button - 8;
      } else {
        uint8_t bottomButton = button - 24;
      }
    }
    void onEncoderScrolled(int8_t delta) {
      // mainEventEditor.scrollCurrentIndexValue(delta);
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
    void step(uint8_t n){
      playHead=n;
      playHead %= 16;

      if (patMem[playHead][0] != 0) {
        //should do patched outputs aswell...
        midi->out(patMem[playHead][0], patMem[playHead][1], patMem[playHead][2]);
        //and of course there should be a layer of abstraction concerning inter-module patching
        patchBus->out(patMem[playHead],4);
      }
    }
    void step() {
      step(playHead+1);
    }
    void output() {
      //output to each specified output. so far hardcoded, later dynamic

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
#endif

