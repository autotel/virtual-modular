#include <LiquidCrystal.h>
#include "_name_signals.h"
//#include "MonoSequencer.h"
#include "ControllerMode.h"
#include "x28_LedButtons.h"
#include "Midi.h"

LedButtons ledButtons = LedButtons();
//MonoSequencer mode_0 = MonoSequencer();
ControllerMode mode_1 = ControllerMode();
Midi midi = Midi();

uint8_t engagedMode = 0;
uint8_t globalMicroStep = 0;
uint8_t tickLen = 12;

LiquidCrystal lcd(49, 48, 47, 46, 45, 44);

void setup() {
  lcd.begin(16,2);
  lcd.print("init");
  Serial.begin(19200);
  
  ledButtons.setup();
  ledButtons.setButtonCallbacks(onButtonPressed, onButtonReleased);

  midi.setup();
  midi.onMidiIn(midiInCallback);

  //mode_0.setup(& ledButtons, & midi);
  mode_1.setup(& ledButtons, & midi);

  
}

void onButtonPressed(byte button, uint32_t pressedButtonsBitmap) {
  
  if (engagedMode == 0) {
    //mode_0.onButtonPressed(button, pressedButtonsBitmap);
  } else {
    mode_1.onButtonPressed(button, pressedButtonsBitmap);
  }
}

void onButtonReleased(byte button) {
  if (engagedMode == 0) {
    //mode_0.onButtonReleased(button);
  } else {
    mode_1.onButtonReleased(button);
  }
}

uint8_t test_messageCounter = 0;
uint8_t test_lastHeader = 0;
void loop() {
  if (engagedMode == 0) {
    mode_1.checkMessages();
    if (mode_1.engagementRequested) {
      engagedMode = 1;
      lcd.setCursor(0, 0);
      lcd.print("controller mode");
    } else {
      //mode_0.loop();
    }
  } else if (engagedMode == 1) {

    lcd.setCursor(0, 0);
    lcd.print("controller mode");
    
    mode_1.loop();
  }

  if (Serial.available()) {
    lcd.setCursor(0, 0);
    lcd.print(String(Serial.read(), HEX));
  }
  lcd.setCursor(0, 1);
  lcd.print(String(engagedMode, HEX));
  ledButtons.loop();
  //midi.loop();
}

void microStep() {
  globalMicroStep++;
  if (globalMicroStep >= tickLen) {
    globalMicroStep = 0;
    //mode_0.step();
  }
}

void midiInCallback(uint8_t a, uint8_t b, uint8_t c) {
  test_messageCounter++;
  test_lastHeader = a;
 // mode_0.midiIn(a, b, c);
  switch (a) {
    case 250: globalMicroStep = 0; break;

    case 248: {
        microStep();
        break;
      }
  }
}



