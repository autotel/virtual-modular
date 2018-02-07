#include <LiquidCrystal.h>
//TODO remove all use of String
#include <TimerOne.h>
#include "_name_signals.h"
#include "mode_MonoSequencer.h"
#include "mode_Controller.h"
#include "x28_LedButtons.h"
#include "Midi.h"
#include "PatchBus.h"
// #include <TBN.h>
// TBN patchBus;
PatchBus patchBus;
LedButtons hardware = LedButtons();
MonoSequencer sequencerMode = MonoSequencer();
ControllerMode controllerMode = ControllerMode();
Midi midi = Midi();

uint8_t engagedMode = 0;
uint8_t globalMicroStep = 0;
uint8_t tickLen = 12;

LiquidCrystal lcd(49, 48, 47, 46, 45, 44);

void setup() {
  //lcd.begin(16, 2);
  //lcd.print("init");
  Serial.begin(19200);

  hardware.setup(&lcd);
  hardware.setButtonCallbacks(onButtonPressed, onButtonReleased);
  hardware.setEncoderCallbacks(onEncoderScrolled, onEncoderPressed, onEncoderReleased);
  hardware.setBottomButtonsCallbacks(onBottomButtonPressed,onBottomButtonReleased);
  midi.setup();
  midi.onMidiIn(midiInCallback);

  controllerMode.setup(& hardware, & midi, & patchBus);
  sequencerMode.setup(& hardware, & midi, & patchBus);
  patchBus.setup();
  patchBus.addMessageListener(onBusMessageReceived);
  patchBus.start();
  // patchBus.onData(onBusMessageReceived);
  patchBus.addMessageListener(onBusMessageReceived);
  // patchBus.debug_onTip(test_onTip);

  Timer1.initialize(800);
  Timer1.attachInterrupt(onInterrupt);


  char tstr[] = "Calculeitor";
  hardware.lcdPrintA((char&) tstr[0]);

}
void test_onTip() {
  if (engagedMode == 0) {
    char pr[4] = "TIP";
    hardware.lcdPrintA((char&)pr, 3);
  }
}

void onBottomButtonPressed(uint8_t button){
  if(engagedMode==1){
    controllerMode.onBottomButtonPressed(button);
  }
}
void onBottomButtonReleased(uint8_t button){
  if(engagedMode==1){
    controllerMode.onBottomButtonReleased(button);
  }
}

void onButtonPressed(byte button, uint32_t pressedButtonsBitmap) {
  if (engagedMode == 0) {
    sequencerMode.onButtonPressed(button, pressedButtonsBitmap);
  } else {
    controllerMode.onButtonPressed(button, pressedButtonsBitmap);
  }
}

void onButtonReleased(byte button) {
  if (engagedMode == 0) {
    sequencerMode.onButtonReleased(button);
  } else {
    controllerMode.onButtonReleased(button);
  }
}

void onEncoderScrolled(int8_t delta) {
  if (engagedMode == 0) {
    sequencerMode.onEncoderScrolled(delta);
  } else {
    controllerMode.onEncoderScrolled(delta);
  }
}
void onEncoderPressed() {
  if (engagedMode == 0) {
    sequencerMode.onEncoderPressed();
   // lcd.print("EncPr");
  } else {
    controllerMode.onEncoderPressed();
  }
}
void onEncoderReleased() {
  if (engagedMode == 0) {
    sequencerMode.onEncoderReleased();
  } else {
    controllerMode.onEncoderReleased();
  }
}
void onBusMessageReceived(uint8_t * data, uint8_t len) {
  sequencerMode.step();
  char pr[9] = "RCV ____";
  for(int a = 0; a<len; a++){
    if(data[a]>9){
      pr[a+4] = data[a]+65;
    }else{
      pr[a+4] = data[a]+48;
    }
  }
  hardware.lcdPrintA((char&)pr, 8);
  // hardware.lcdPrintB((char&)data, len);
  // sequencerMode.onBusMessageReceived(data, len);
}

uint8_t test_messageCounter = 0;
uint8_t test_lastHeader = 0;
void loop() {
  if (engagedMode == 0) {
    controllerMode.checkMessages();
    if (controllerMode.engagementRequested) {
      engagedMode = 1;
      char str[] = "controller mode";
      hardware.lcdPrintB((char&) str[0]);


      lcd.setCursor(0, 1);
      lcd.write(patchBus.test_count);

    } else {
      sequencerMode.loop();
    }
  } else if (engagedMode == 1) {
    controllerMode.loop();
  }
  hardware.loop();
  patchBus.loop();

  midi.loop();
}

void microStep() {
  globalMicroStep++;
  if (globalMicroStep >= tickLen) {
    globalMicroStep = 0;
    sequencerMode.step();
  }
}

void midiInCallback(uint8_t a, uint8_t b, uint8_t c) {
  test_messageCounter++;
  test_lastHeader = a;
  sequencerMode.midiIn(a, b, c);
  switch (a) {
    case 250: globalMicroStep = 0; break;

    case 248: {
        microStep();
        break;
      }
  }
}

#define divideEncoderRotation 4
const uint8_t grayToBinary = 0b10110100;
int8_t enc_last = 0;
int8_t enc_sub = 0;
unsigned int encoder0Pos = 0;
char sign(char x) {
  return (x > 0) - (x < 0);
}
//todo: encoder readout should be part of the library
void onInterrupt() {
  hardware.doEncoder();
}




