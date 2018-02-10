#include "Midi.h"
#include "_name_signals.h"
#include "x28_LedButtons.h"
// #include <TBN.h>
#include "PatchBus.h"
#ifndef MONOSEQUENCERH
#define MONOSEQUENCERH
#define BTN_eventSelector 0

#define MEM_HEAD 0
#define MEM_NUM 1
#define MEM_TIMBR 2
#define MEM_PROP 3
#define MEM_LEN 4
// #include "submode_eventEditor.h"

struct EventMessage {
  uint8_t head = EH_TRIGGERONHEADER;
  uint8_t num = 0;
  uint8_t timbr = 0;
  uint8_t prop = 100;
};

//TODO: separate .cpp and .h, capitalize filename
class MonoSequencer {
  private:
    struct EventMessage currentEvent;
    uint8_t patMem [16][MEM_LEN];
    uint8_t microStepCount = 0;
    uint8_t microSteps = 6;
    Midi *midi;
    LedButtons *ledButtons;
    // EventEditor mainEventEditor=EventEditor();
    // TBN *patchBus;
    PatchBus *patchBus;
  public:
    uint8_t playHead = 0;
    MonoSequencer() {
      for (uint16_t b = 0; b < 16; b++) {
        for (uint16_t a = 0; a < MEM_LEN; a++) {
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
      char mes [6]="mes__";
      mes[3]=(*message)+48;
      ledButtons->lcdPrintB((char&)mes);
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
          if (patMem[matrixButton][MEM_HEAD] == EH_NULL) {
            patMem[matrixButton][MEM_HEAD] = currentEvent.head;
            patMem[matrixButton][MEM_NUM] = currentEvent.num;
            patMem[matrixButton][MEM_TIMBR] = currentEvent.timbr;
            patMem[matrixButton][MEM_PROP] = currentEvent.prop;

          } else {
            patMem[matrixButton][MEM_HEAD] = EH_NULL;
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
      currentEvent.num+=delta;
      char str[10];
      snprintf(str, 10, "Event: %d", currentEvent.num);
      ledButtons->lcdPrintB((char&)str,10);
    }
    void onEncoderPressed() {
    }
    void onEncoderReleased() {
    }
    void loop() {
      for (uint16_t b = 0; b < 16; b++) {
        if (patMem[b][MEM_HEAD] == 0) {
          ledButtons->setButtonColor(b + 8, 0, 0, 0);
        } else {
          ledButtons->setButtonColor(b + 8, patMem[b][2] / 2, 10, 60);

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

      if (patMem[playHead][MEM_HEAD] != EH_NULL) {
        //instead of sending midi output, it should send to a midi out module, which will do the mappings
        midi->out(MIDI_noteOn | patMem[playHead][MEM_TIMBR], patMem[playHead][MEM_NUM], patMem[playHead][MEM_PROP]);
        //and of course there should be a layer of abstraction concerning inter-module patching
        patchBus->out(patMem[playHead],4);
      }

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

