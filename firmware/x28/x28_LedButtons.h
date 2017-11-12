//TODO: separate .cpp and .h
#include "FastLED.h"
#include "_name_signals.h"
#define REFRESHRATE 20
#ifndef HARDWAREH
#define HARDWAREH
//useful about callback functions https://stackoverflow.com/questions/14427917/call-function-in-main-program-from-a-library-in-arduino
//hardware controlling functions for physical modular rev 1 board
class LedButtons {
  public:
    LedButtons() {
    };
#define NUM_LEDS 28
#define NUM_BUTTONS 28
#define DATA_PIN 43
    CRGB leds[NUM_LEDS];


    char lcdStr[33];
    void setup() {
      delay(1000);

      FastLED.addLeds<WS2811, DATA_PIN, RGB>(leds, NUM_LEDS);
      LEDS.setBrightness(110);
      for (uint16_t a = 0; a < NUM_LEDS; a++) {
        if (a == 3) {
          leds[a] = CRGB::Orange;
        } else if (a < 8) {
          leds[a] = CRGB::Indigo;
        } else if (a < 24) {
          leds[a] = CRGB::Gray;
        } else {
          leds[a] = CRGB::Indigo;
        }
      }

      for (uint8_t a = 0; a < 33; a++) {
        lcdStr[a] = 0;
      }
    }
    void loop() {
      readMatrixButtons();
      if (millis() - lastLedsUpdate > 1000 / REFRESHRATE) {
        refreshLeds();
        lastLedsUpdate = millis();
      }

    }
    int readMatrixButtons() {
      uint16_t i, j, currentButton;
      //POX = pin out register n., PIN= pin in register n.
      //H, columns
#define POX PORTH //bits 3-7, digital
#define PIX PINH
#define PORTXMASK 0b00000111
      DDRH = 0xFF;
      //K, rows
#define POY PORTK //bits 0-6, analog
#define PIY PINK
      //#define YREGMASK 0b00111111
      DDRK = 0x00;
      POY = 0xFF;
      // int inpinbase = 8;

      for (currentButton = 0; currentButton < NUM_LEDS; currentButton++) {
        uint16_t col = currentButton % 4;
        uint16_t row = currentButton / 4;

        POX &= PORTXMASK;

        //not 1<< because starts in PH3
        POX = ~(0b1000 << col);
        //set test to a mask according to the row we want to check
        uint32_t test = 1UL << row;
        //TODO: there should be a juggling of the scan with the rest of the code ranther than a delay.
        //delay is to avoid leaks of voltage due to capacitances?
        delayMicroseconds(100);

        uint32_t an = PIY & test;

        //we checked the row, now we want to use the test to compare with the pixel number.
        //I am recycling the variable
        test = 1UL << currentButton;
        //check button is pressed, but in inverted logic
        if (!an) {
          //button is pressed, and not the last time
          if (!(test & pressedButtonsBitmap)) {

            pressedButtonsBitmap = pressedButtonsBitmap | test;
            CB_buttonPressed(currentButton, pressedButtonsBitmap);
          }

        } else {
          //button is depressed, and was pressed last time
          if (test & pressedButtonsBitmap) {

            pressedButtonsBitmap = pressedButtonsBitmap & (~test);
            CB_buttonReleased(currentButton);
          }
        }

      }

    }
    void refreshLeds() {
      //uint16_t a;
      /*for (a = 0; a < strip.numPixels(); a++) {
        strip.setPixelColor(a, strip.Color(ledColors[a], ledColors[a], ledColors[a])); //Wheel((i*1+j)
        }*/
      FastLED.show();
    }

    void setButtonCallbacks( void (*fpa)(byte, uint32_t), void (*fpb)(byte) ) {
      CB_buttonPressed = fpa;
      CB_buttonReleased = fpb;
    }
    void setButtonColor(uint16_t button, uint8_t a, uint8_t b, uint8_t c ) {
      if (a | b | c > 0) {
        //c |= 80;
        leds[button] = CRGB(a, b, c);//CHSV
      } else {
        leds[button] = CRGB::Black;
      }
    }
    void setButtonColorHSV(uint16_t button, uint8_t a, uint8_t b, uint8_t c ) {
      if ( c > 0) {
        //c |= 80;
        leds[button] = CHSV(a, b, c);//CHSV
      } else {
        leds[button] = CRGB::Black;
      }
    }
  private:
    long lastLedsUpdate = 0;
    uint8_t lcdChange = 0;
    void (*CB_buttonPressed)(byte, uint32_t) = 0;
    void (*CB_buttonReleased)(byte) = 0;
    uint32_t pressedButtonsBitmap = 0;
    void buttonPressedCallback(byte button, uint32_t bitmap) {
      if ( 0 != CB_buttonPressed ) {
        (*CB_buttonPressed)(button, bitmap);
      }
      else {
        for (uint16_t a = 0; a < NUM_LEDS; a++) {
          leds[button] = CRGB(a, a, a);
          // strip.setPixelColor(a, Wheel(a * 12)); //Wheel((i*1+j)
        }
      }
    }
    void buttonReleasedCallback(byte button) {
      if ( 0 != CB_buttonReleased ) {
        (*CB_buttonReleased)(button);
      }
      else {
      }
    }
};

#endif
