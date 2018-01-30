#ifndef EVENTEDITORH
#define EVENTEDITORH

class EventEditor {
  private:
    LedButtons *hardware;
  public:
    uint8_t currentEvent [4] = {0x00, 0x00, 0x00, 0x00};
    uint8_t currentIndex = 0;
    bool engaged = false;
    EventEditor(uint8_t & initialEvent) {
      for (uint8_t i = 0; i < 4; i++) {
        currentEvent[i] = *(&initialEvent + i);
      }
    }
    EventEditor() {
    }
    void setup(LedButtons *t_hardware) {
      hardware = t_hardware;
    }
    void engage() {
      engaged = true;
      updateLeds();
    }
    void disengage() {}
    void scrollCurrentIndexValue(int8_t delta) {
      currentEvent[currentIndex] += delta;
      if (currentIndex == 0) currentEvent[currentIndex] %= 16;
      valueChangedFunction();
    }
    void scrollCurrentIndexValue(uint8_t absolute) {
      if (currentIndex == 0) absolute %= 16;
      currentEvent[currentIndex] = absolute;
      valueChangedFunction();
    }
    void valueChangedFunction() {
      updateScreen();
    }
    void selectCurrentIndex(uint8_t index) {
      currentIndex = index;
      updateLeds();
    }
    void updateLeds() {
      hardware->setButtonColor(BTN_eventSelector, 255, 255, 255);
      for (uint8_t pixel = 0; pixel < 16; pixel++) {
        if (pixel == currentIndex + 8) {
          hardware->setButtonColor(pixel + 8, 255, 255, 255);
        } else if (pixel < 4) {
          hardware->setButtonColor(pixel + 8, 255, 255, 0);
        } else {
          hardware->setButtonColor(pixel + 8, 0, 0, 0);
        }
      }
    }
    void updateScreen() {
      char screenTxt [14] = "0x--:--,--,--";
      for (uint8_t i = 0; i < 4; i++) {
        uint8_t letter = (i * 3) + 2;
        char  numberCache [3] = "--";
        sprintf(numberCache, "%x", currentEvent[i]);
        strncpy(screenTxt, numberCache, 2);
      }
      switch (currentEvent[0]) {
        case EH_CLOCKTICKHEADER: {
            //char * strncpy ( char * destination, const char * source, size_t num );
            strncpy (screenTxt, "Tick", 4 );
            break;
          }
        case EH_TRIGGERONHEADER: {
            strncpy (screenTxt, "On:  ", 4 );
            break;
          }
        case EH_TRIGGEROFFHEADER: {
            strncpy (screenTxt, "Off: ", 4 );
            break;
          }
        case EH_CLOCKABSOLUTEHEADER: {
            strncpy (screenTxt, "Jump:", 4 );
            break;
          }
        case EH_RECORDINGHEADER: {
            strncpy (screenTxt, "!Rec:", 4 );
            break;
          }
        default: {
            strncpy (screenTxt, "Tick", 4 );
          }
      }
      hardware->lcdPrintA((char&)screenTxt, 13);
    }
};
#endif
