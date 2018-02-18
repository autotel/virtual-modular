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
        delay(((t + 70) / ((t / 44) + 1)) - 47);
      }

      for (uint8_t a = 0; a < 33; a++) {
        lcdBuf[a] = ' ';
      }
      DDRB &= 0x01101111;

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

    uint8_t otherButtonsLastPressed = 0;
    void doOtherButtons() {
      /*
        side & encoder buttons:
        encoder:
          PH7(MU XAX4)---[\_]---|>---(--[470ohm]--GND )----(MUXBX0)PK0
        side button 0&1:
          PH7(MUXAX4)---[\_]---|>---(--[470ohm]--GND )----(MUXBX1)PK1
          PH7(MUXAX4)---[\_]---|>---(--[470ohm]--GND )----(MUXBX2)PK2
      */
      //set MUXBX0 low MUXAX4 to high;
      for (uint8_t a = 0; a < 3; a++) {
        //set the current pinK to input
        DDRK &= ~(1 << a);
        PORTK|=1<<a;

        //send high to the "other buttons" col, low to all other cols
        PORTH = 1<<7;

        if (PINK & (1 << a)) {
          //here: buttton detected pressed
          if ((otherButtonsLastPressed & (1 << a)) == 0) {
            //and was not pressed the last time
            otherButtonsLastPressed |= 1 << a;
            if (a == 0) {
              encoderPressedCallback();
            } else {
              bottomButtonPressedCallback(a - 1);
            }
          }
        } else {
          if ((otherButtonsLastPressed & (1 << a)) != 0) {
            //and was pressed the last time
            if (a == 0) {
              encoderReleasedCallback();
            } else {
              bottomButtonReleasedCallback(a - 1);
            }
          }
          otherButtonsLastPressed &= ~(1 << a);
        }
      }
    }

    // unsigned int encoder0Pos = 0;
    char sign(char x) {
      return (x > 0) - (x < 0);
    }

    int8_t enc_last = 0;
    int8_t enc_last_debounced = 0;
    uint8_t enc_current_debounced = 0;
    uint8_t justChanged = 0;
    int16_t stateUpTime = 0;

    void doEncoder() {


      //DDRB&=0x01101111 (done on startup)
      //ENCA = PB4
      //ENCC = PB7

      //read encoder input,
      // the pins in this board are separate, so put together both digits (to get number range from 0 to 3)
      PORTB = 0b10010000;
      //  PORTB = 0xFF;
      uint8_t enc_read = (PINB >> 3) & 0b10; //didn't shift 3 because we want it to fall as second digit
      enc_read |= (PINB >> 7) & 0b1;

      if(enc_current_debounced != enc_read){
        if (enc_last == enc_read) {
          //here: the detected change has been persisting
          //if (stateUpTime >= 1) {
            //here: the detected change persisted for longer than 600
            enc_current_debounced = enc_read;
            justChanged = 1;
          //}
          //stateUpTime ++;
        } else {
          //here: the change that was detected on the last check didn't persist until the current check
          //stateUpTime = 0;
        }
      }

      //here: encoder is remaining in the same position
      if (justChanged) {
        //here: encoder just changed one 'frame', which has been debounced
        //encread turns around as follows: <- 0,1,3,2 ->
        //we want one send per tick, which happens a whole lap around enc_
        //in other words, one send per each four encoder events

        if (enc_current_debounced == 3) {
          if (enc_last_debounced == 1) {
            encoderRotatedCallback(+1);
          } else if (enc_last_debounced == 2) {
            encoderRotatedCallback(-1);
          }
        }
        justChanged = 0;
        stateUpTime = 0;

        enc_last_debounced = enc_current_debounced;
      }
      enc_last = enc_read;

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
        //delayMicroseconds(100);

        uint32_t an = PIY & test;



        //tButton is the pressed button, but vertically flipped.
        uint16_t tButton = buttonsRemap[currentButton];

        //we checked the row, now we want to use the test to compare with the pixel number.
        //I am recycling the variable
        test = 1UL << tButton;
        //check button is pressed, but in inverted logic
        if (an) {
          //button is pressed, and not the last time
          if (!(test & pressedButtonsBitmap)) {

            pressedButtonsBitmap = pressedButtonsBitmap | test;
            CB_buttonPressed(tButton, pressedButtonsBitmap);

          }

        } else {
          //button is depressed, and was pressed last time
          if (test & pressedButtonsBitmap) {

            pressedButtonsBitmap = pressedButtonsBitmap & (~test);
            CB_buttonReleased(tButton);
          }
        }

      }

    }
    uint8_t MUXBX [4] = {A10,A11,A12,A13};
    //[last pressure read, read time]
    long matrixButtonStatus [16][2];
    uint8_t currentButton = 0;
    void setup_readMatrixButtons_velocity(){
      pinMode(MUXBX[0],INPUT);
      pinMode(MUXBX[1],INPUT);
      pinMode(MUXBX[2],INPUT);
      pinMode(MUXBX[3],INPUT);
      for(uint8_t a=0; a<16; a++){
        for(uint8_t b=0; b<2; b++){
          matrixButtonStatus[a][b]=0;
        }
      }
    }
    uint16_t readMatrixButtons_velocity(){
      long currentTime=millis();
      //PH3-6(MUXAX0-3)---[\_]---|>---(--[470ohm]--GND )----(MUXBX2-5)PK2-5
      // for (uint8_t currentButton = 0; currentButton < 16; currentButton++) {
      uint8_t col=currentButton%4;
      uint8_t row=(currentButton/4)%4;
      PORTH |= 1 << (col+3);

      uint16_t read=analogRead(MUXBX[row]);
      //noise treshold
      if(read>50){
        if(matrixButtonStatus[currentButton][0]){
          //here: the button was pressed on the last check, therefore we can measure velocity
          uint16_t deltaT=currentTime-matrixButtonStatus[currentButton][1];
          if(read>matrixButtonStatus[currentButton][0]){
            uint16_t deltaP=read-matrixButtonStatus[currentButton][0];
            uint16_t velo=(deltaP*100)/deltaT;
            Serial.println();
            Serial.print(currentButton);
            Serial.print(',');
            Serial.print(velo);
          }
          matrixButtonStatus[currentButton][0]=0;
          matrixButtonStatus[currentButton][1]=0;
        }else{
          matrixButtonStatus[currentButton][0]=read;
          matrixButtonStatus[currentButton][1]=currentTime;
        }
      }else{
        matrixButtonStatus[currentButton][0]=0;
      }
      currentButton++;
      currentButton%=16;
      // }
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
          lcd->setCursor(c - 16, 1);
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

      button=buttonsRemap[button];

      if (a | b | c > 0) {
        //c |= 80;
        leds[button] = CRGB(a, b, c);//CHSV
      } else {
        leds[button] = CRGB::Black;
      }
    }
    void setButtonColorHSV(uint16_t button, uint8_t a, uint8_t b, uint8_t c ) {

      button=buttonsRemap[button];
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
    uint8_t buttonsRemap[28]={0,1,2,3,4,5,6,7,20,21,22,23,16,17,18,19,12,13,14,15,8,9,10,11,24,25,26,27};
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
