
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



byte cp128 = 0;
byte cp64 = 0;
byte cp48 = 0;
byte cp49 = 0;
byte cp16 = 0;
void timedLoop() {
  //evaluate matrix buttons
  cp128 = cp128 % 128;
  cp64 = cp128 % 64;
  cp16 = cp64 % 16;
  byte cp32 = cp64 % 32;
  cp48 = cp48 % 48;
  cp49 = cp49 % 49;
  byte buttonPressure = (byte)(readMatrixButton(cp16) / 2);
  int evaluator = 0x1 << cp16;
  if (buttonPressure > BUTTONTRESH) {
    //if last lap this button was not pressed, trigger on  button pressed
    if ((evaluator & pressedMatrixButtonsBitmap) == 0) {
      pressedMatrixButtonsBitmap |= evaluator;
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
  updatePixel(cp49);

  //evaluate Selector buttons (the tact buttons on top of the matrix)
  //less frequently than matrix, because these are not performance buttons
  if (cp49 == 0) {
    //cp64/16 will be 0,1,2,3,4 alernatingly each time cp16 is 0
    byte cb_5 = cp64 / 12;
    //see previous use of this var for more reference
    evaluator = 0x1 << cb_5;
    if(cb_5==4) cb_5=8;//encoder buttn
    if (digitalReadMuxB(cb_5 + 4)) {
      //if last lap this button was not pressed, trigger on  button pressed
      if ((evaluator & pressedSelectorButtonsBitmap) == 0) {
        pressedSelectorButtonsBitmap |= evaluator;
        if(cb_5<4){
          onSelectorButtonPressed(cb_5);
        }else{
          onEncoderButtonPressed();
        }
      } else {
        if(cb_5<4){
          onSelectorButtonHold(cb_5);
        }else{
          onEncoderButtonPressed();
        }
      }
    } else {
      //if in last lap this button was pressed but in this lap is not
      if ((evaluator & pressedSelectorButtonsBitmap) != 0) {
        pressedSelectorButtonsBitmap &= ~(evaluator);
        if(cb_5<4){
          onSelectorButtonReleased(cb_5);
        }else{
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
