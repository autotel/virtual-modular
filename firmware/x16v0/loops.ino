
int loop128 = 0;
void loop() {
  if (loop128 % 2 == 1) {
    checkMessages();
  }

  if (loop128 % 2 == 0) {
    timedLoop();
  }

  loop128++;
  loop128 %= 128;
}


uint16_t buttonsPressure [] = {
  0, 0, 0, 0,
  0, 0, 0, 0,
  0, 0, 0, 0,
  0, 0, 0, 0
};
long buttonsTimers [] = {
  0, 0, 0, 0,
  0, 0, 0, 0,
  0, 0, 0, 0,
  0, 0, 0, 0
}; 
long buttonsDeltaTimers [] = {
  0, 0, 0, 0,
  0, 0, 0, 0,
  0, 0, 0, 0,
  0, 0, 0, 0
};
long deltaTime = 0;
long lastCheck = 0;
byte cp128 = 0;
byte cp64 = 0;
byte cp48 = 0;
byte cp49 = 0;
byte cp16 = 0;
void timedLoop() {
  long thisCheck = micros();
  deltaTime = thisCheck - lastCheck;
  //see lastCheck at the end of timedloop()
  //evaluate matrix buttons
  cp128 = cp128 % 128;
  cp64 = cp128 % 64;
  cp16 = cp64 % 16;
  byte cp32 = cp64 % 32;
  cp48 = cp48 % 48;
  cp49 = cp49 % 49;
  int evaluator;

  uint16_t buttonPressure = (uint16_t)(readMatrixButton(cp16));
  if (buttonsTimers[cp16] > 200) {
    evaluator = 0x1 << cp16;
    if (buttonPressure / 2 > BUTTONTRESH) {
      //if for debounce
      uint16_t velocity = (1000*(buttonPressure - buttonsPressure[cp16])) / buttonsDeltaTimers[cp16];
      buttonsTimers[cp16] = 0;
      //if last lap this button was not pressed, trigger on  button pressed
      if ((evaluator & pressedMatrixButtonsBitmap) == 0) {
        pressedMatrixButtonsBitmap |= evaluator;
        //matrixButtonVelocity(cp16, velocity);
        onMatrixButtonPressed(cp16);
      } else {
        onMatrixButtonHold(cp16, buttonPressure);
      }
    } else {
      if ((evaluator & pressedMatrixButtonsBitmap) != 0) {
        pressedMatrixButtonsBitmap &= ~(0x1 << cp16);
        onMatrixButtonReleased(cp16);
      }
    }
  }
  //for debouncing and measuring of volt. gradient on time
  buttonsPressure[cp16] =  (buttonsPressure[cp16] + buttonPressure) / 2;
  buttonsTimers[cp16] += deltaTime;
  buttonsDeltaTimers[cp16] = deltaTime;

  updatePixel(cp49);

  //evaluate Selector buttons (the tact buttons on top of the matrix)
  //less frequently than matrix, because these are not performance buttons
  if (cp49 == 0) {
    //cp64/16 will be 0,1,2,3,4 alernatingly each time cp16 is 0
    byte cb_5 = cp64 / 12;
    //see previous use of this var for more reference
    evaluator = 0x1 << cb_5;
    if (cb_5 == 4) cb_5 = 8; //encoder buttn
    if (digitalReadMuxB(cb_5 + 4)) {
      //if last lap this button was not pressed, trigger on  button pressed
      if ((evaluator & pressedSelectorButtonsBitmap) == 0) {
        pressedSelectorButtonsBitmap |= evaluator;
        if (cb_5 < 4) {
          onSelectorButtonPressed(cb_5);
        } else {
          onEncoderButtonPressed();
        }
      } else {
        if (cb_5 < 4) {
          onSelectorButtonHold(cb_5);
        } else {
          onEncoderButtonPressed();
        }
      }
    } else {
      //if in last lap this button was pressed but in this lap is not
      if ((evaluator & pressedSelectorButtonsBitmap) != 0) {
        pressedSelectorButtonsBitmap &= ~(evaluator);
        if (cb_5 < 4) {
          onSelectorButtonReleased(cb_5);
        } else {
          onEncoderButtonPressed();
        }
      }
    }
    // if(cb_5==0)
    // doEncoderButton();
  }
  doEncoder();
  if (cp128 == 2) {
    draw();
  }
  cp128++;
  cp48++;
  cp49++;

  lastCheck = thisCheck;
}



void draw() {
  if (screenChanged) {
    screenChanged = false;
    if (lastScreenA != screenA) {
      if (screenA.length() > 16)
        screenA = screenA.substring(0, 16);
      lastScreenA = screenA;
      lcd.setCursor(0, 0);
      lcd.print(screenA);

      for (byte strl = 16 - screenA.length(); strl > 0; strl--) {
        lcd.write(' ');
      }
    }
    if (lastScreenB != screenB) {
      if (screenB.length() > 16)
        screenB = screenB.substring(0, 16);

      lastScreenB = screenB;
      lcd.setCursor(0, 1);
      lcd.print(screenB);

      for (byte strl = 16 - screenB.length(); strl > 0; strl--) {
        lcd.write(' ');
      }
    }
  }
}
