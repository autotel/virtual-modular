//x28_LedButtons version for iteration 2
//TODO: separate .cpp and .h
#include <LiquidCrystal.h>
#include "FastLED.h"
#include "_name_signals.h"
#define REFRESHRATE 20
#ifndef HARDWAREH
#define HARDWAREH


//useful about callback functions https://stackoverflow.com/questions/14427917/call-function-in-main-program-from-a-library-in-arduino
//hardware controlling functions for physical modular rev 1 board
class LedButtons {
  public:
    LiquidCrystal* lcd;
    LedButtons() { };
#define NUM_LEDS 28
#define NUM_BUTTONS 28
#define DATA_PIN 43
    CRGB leds[NUM_LEDS];


    char lcdBuf[33];
    void setup(LiquidCrystal* _lcd) {
      lcd = _lcd;
      lcd->begin(16, 2);
      lcd->clear();
      FastLED.addLeds<WS2811, DATA_PIN, RGB>(leds, NUM_LEDS);

      //security led fadein
      for (uint32_t t = 0; t < 0xff; t += 4) {
        LEDS.setBrightness(t / 4);
        for (uint16_t a = 0; a < 28; a++) {
          setButtonColor(
            a,
            floor(sin(t / (4 ) + 0.15) * 127) + 127,
            floor(sin(t / (3 ) + 0.25) * 127) + 127,
            floor(sin(t / (2 ) + 0.75) * 127) + 127
          );
        }
        FastLED.show();
        //https://www.desmos.com/calculator/zmpnfwcguf
        delay(((t+70)/((t/44)+1))-47);
      }

      for (uint8_t a = 0; a < 33; a++) {
        lcdBuf[a] = ' ';
      }
      //encoder pins setup
      DDRA = 0x00; //0x3<<6
      PORTA |= 3 << 6;
      //lcd->print("hello, world!");
    }
    void loop() {
      readMatrixButtons();
      doOtherButtons();

      if (millis() - lastLedsUpdate > 1000 / REFRESHRATE) {
        refreshLeds();
        lastLedsUpdate = millis();
        refreshLcd();
      }
    }

    uint8_t otherButtonsLastPressed=0;
    void doOtherButtons(){
        /*
        side buttons:
        mxx4				  mxy1,2
        PH7 -[\_]-<|--	PK1,2
        muxa4         muxbx1,2

        encoder:
        PH7--[\_]--<|--PK0

      */
      //set MUXBX0 low MUXAX4 to high;
      for(uint8_t a=0; a<3; a++){
        DDRK &= 1<<a;/// ~(1<<a);
        ///  DDRH |= 1 << 7;
        PORTK |= 1 << a;
        /// PORTH &= ~(1 << 7);
        if ((PINK & (1<<a)) == 0){
          //buttton detected pressed
          if((otherButtonsLastPressed&(1<<a))==0){
            //and was not pressed the last time
            otherButtonsLastPressed|=1<<a;
            if(a==0){
              encoderPressedCallback();
            }else{
              bottomButtonPressedCallback(a-1);
            }
          }
        } else {
          if((otherButtonsLastPressed&(1<<a))!=0){
            //and was pressed the last time
            if(a==0){
              encoderReleasedCallback();
            }else{
              bottomButtonReleasedCallback(a-1);
            }
          }
          otherButtonsLastPressed&=~(1<<a);
        }
      }
    }
    // uint16_t lastEncoderPressTimer = 0;
    // uint16_t debounceTime = 250;
    // void doEncoderButton() {
    //   //set MUXBX0 low MUXAX4 to high;
    //   PORTK &= ~(0x1 << 0);
    //   PORTH |= 0x1 << 7;
    //   if ((PINH >> 7) & 1) {
    //     if (lastEncoderPressTimer >= debounceTime) {
    //       encoderPressedCallback();
    //       lastEncoderPressTimer = 0;
    //     }
    //   } else {
    //     if (lastEncoderPressTimer <= debounceTime) {
    //       lastEncoderPressTimer++;
    //     }
    //   }
    // }
#define divideEncoderRotation 4
    const uint8_t grayToBinary = 0b10110100;
    int8_t enc_last = 0;
    int8_t enc_sub = 0;
    unsigned int encoder0Pos = 0;
    char sign(char x) {
      return (x > 0) - (x < 0);
    }

    void doEncoder() {
      //encread turns around as follows: <- 0,1,3,2 ->
      //upon conversion it will turn as: <- 0,1,2,3 ->
      int8_t enc_read = (grayToBinary >> ( ( (PINA >> 6) & 0x3) * 2 ) ) & 0x3;
      if (enc_read != enc_last) {
        int8_t enc_inc = enc_read - enc_last;

        if (enc_inc > 2) {
          enc_inc = -1;
        }
        if (enc_inc < -2) {
          enc_inc = +1;
        }

        enc_sub += enc_inc;
        if (abs(enc_sub) >= divideEncoderRotation) {
          encoder0Pos += sign(enc_sub);
          enc_sub = 0;
          encoderRotatedCallback(encoder0Pos);
        }
        enc_last = enc_read;
      }
    }
    int readMatrixButtons() {
      uint16_t i, j, currentButton;
      //POX = pin out register n., PIN= pin in register n.
      //H, columns
#define POX PORTH //bits 3-7, digital
#define PIX PINH
#define PORTXMASK 0b00000111
      DDRH |= 0xFF << 3;
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
        POX = 0b1000 << col;
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
        if (an) {
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
    void refreshLcd() {
      if (changedScreenA) {
        lcd->setCursor(0, 0);
        for (uint16_t c = 0; c < 16; c++) {
          if (lcdBuf[c] == 0)lcdBuf[c] = ' ';
          lcd->write(lcdBuf[c]);
          lcdBuf[c] = ' ';
        }
        changedScreenA = false;
      }
      if (changedScreenB) {
        for (uint16_t c = 16; c < 32; c++) {
          lcd->setCursor(c-16, 1);
          if (lcdBuf[c] == 0)lcdBuf[c] = ' ';
          lcd->write(lcdBuf[c]);
          lcdBuf[c] = ' ';
        }
        changedScreenB = false;
      }
    }


    void setButtonCallbacks( void (*fpa)(byte, uint32_t), void (*fpb)(byte) ) {
      CB_buttonPressed = fpa;
      CB_buttonReleased = fpb;
    }
    void setEncoderCallbacks(void (*fpa)(int8_t), void (*fpb)(), void (*fpc)()) {
      CB_encoderRotated = fpa;
      CB_encoderPressed = fpb;
      CB_encoderReleased = fpc;
    };
    void setBottomButtonsCallbacks(void (*fpa)(uint8_t), void (*fpb)(uint8_t)) {
      CB_botomButtonPressed = fpa;
      CB_botomButtonReleased = fpb;
    };
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
    void lcdPrintA(char & what) {
      char *p_what = & what;
      uint8_t keepGoing = 1;
      uint8_t a = 0;
      while (keepGoing) {
        if (*(p_what + a) == 0)keepGoing = 0;
        if (a > 15) keepGoing = 0;
        lcdBuf[a] = *(p_what + a);
        a++;
      }
      changedScreenA = true;
    }
    void lcdPrintA(char & what, uint8_t len) {
      char *p_what = & what;
      len = min(len, 16);
      uint8_t keepGoing = 1;
      uint8_t a = 0;
      while (keepGoing) {
        if (*(p_what + a) == 0)keepGoing = 0;
        if (a >= len) keepGoing = 0;
        lcdBuf[a] = *(p_what + a);
        a++;
      }
      changedScreenA = true;
    }
    void lcdPrintB(char & what) {
      char *p_what = & what;
      uint8_t keepGoing = 1;
      uint8_t a = 0;
      while (keepGoing) {
        if (*(p_what + a) == 0)keepGoing = 0;
        if (a > 15) keepGoing = 0;
        lcdBuf[a + 16] = *(p_what + a);
        a++;
      }
      changedScreenB = true;
    }
    void lcdPrintB(char & what, uint8_t len) {
      char *p_what = & what;
      len = min(len, 16);
      uint8_t keepGoing = 1;
      uint8_t a = 0;
      while (keepGoing) {
        if (*(p_what + a) == 0)keepGoing = 0;
        if (a >= len) keepGoing = 0;
        lcdBuf[a + 16] = *(p_what + a);
        a++;
      }
      changedScreenB = true;
    }

  private:
    bool changedScreenA = false;
    bool changedScreenB = true;
    long lastLedsUpdate = 0;
    uint8_t lcdChange = 0;
    void (*CB_buttonPressed)(byte, uint32_t) = 0;
    void (*CB_buttonReleased)(byte) = 0;
    void (*CB_encoderRotated)(int8_t) = 0;
    void (*CB_encoderPressed)() = 0;
    void (*CB_encoderReleased)() = 0;
    void (*CB_botomButtonPressed)(uint8_t) = 0;
    void (*CB_botomButtonReleased)(uint8_t) = 0;
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
    void encoderRotatedCallback(byte delta) {
      if ( 0 != CB_encoderRotated ) {
        (*CB_encoderRotated)(delta);
      }
      else {
      }
    }
    void bottomButtonPressedCallback(uint8_t button) {
      if ( 0 != CB_botomButtonPressed ) {
        (*CB_botomButtonPressed)(button);
      }
      else {
      }
    }
    void bottomButtonReleasedCallback(uint8_t button) {
      if ( 0 != CB_botomButtonReleased ) {
        (*CB_botomButtonReleased)(button);
      }
      else {
      }
    }
    void encoderPressedCallback() {
      if ( 0 != CB_encoderPressed ) {
        (*CB_encoderPressed)();
      }
      else {
      }
    }
    void encoderReleasedCallback() {
      if ( 0 != CB_encoderReleased ) {
        (*CB_encoderReleased)();
      }
      else {
      }
    }
};

#endif
