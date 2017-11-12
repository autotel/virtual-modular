uint32_t pressedMatrixButtonsBitmap = 0;
uint32_t pressedButtonsBitmap = 0;

//actions to take once any button is pressed
void onButtonPressed(byte button) {


  if (button < 8) {
    onSelectorButtonPressed(hflip(button));
    //hardware.setButtonColor(button, 127, 130, 200);
  } else if (button < 24) {
    onMatrixButtonPressed(hflip(23 - button));
  } else if (button < 28) {
    onSelectorButtonPressed(hflip(27 - button));
    //hardware.setButtonColor(button, 127, 130, 200);
  }
}

void onButtonReleased(byte button) {
  //postPressedButtonsBitmap&=~(1UL<<button);

  if (button < 8) {
    onSelectorButtonReleased(hflip(button));
    //hardware.setButtonColor(button, 127, 130, 200);
  } else if (button < 24) {
    onMatrixButtonReleased(hflip(23 - button));
  } else if (button < 28) {
    onSelectorButtonReleased(hflip(27 - button));
    //hardware.setButtonColor(button, 127, 130, 200);
  }
}

//actions to take while a button is held, taking the pressure into account
void onMatrixButtonHold(byte button, byte buttonPressure) {
  /* sendToBrainData[0] = button;
    sendToBrainData[1] = buttonPressure;
    sendToBrainData[2] = pressedMatrixButtonsBitmap;
    sendToBrain(TH_buttonMatrixHold, TH_buttonMatrixHold_len);*/
}
//actions to take while a button is pressed
void onMatrixButtonPressed(byte button) {
  pressedMatrixButtonsBitmap |= 1 << (button);
  sendToBrainData[0] = button;
  sendToBrainData[1] = 1;
  sendToBrainData[2] = (uint8_t)pressedMatrixButtonsBitmap & 0xff;
  sendToBrainData[3] = (uint8_t)(pressedMatrixButtonsBitmap >> 8) & 0xff;
  sendToBrain(TH_buttonMatrixPressed, TH_buttonMatrixPressed_len);
}
//actions to take once a button is released
void onMatrixButtonReleased(byte button) {
  pressedMatrixButtonsBitmap &= ~(1 << (button));
  sendToBrainData[0] = button;
  sendToBrainData[1] = 0;
  sendToBrainData[2] = (byte)pressedMatrixButtonsBitmap;
  sendToBrainData[3] = (byte)(pressedMatrixButtonsBitmap >> 8);
  sendToBrain(TH_buttonMatrixReleased, TH_buttonMatrixReleased_len);
}
void onEncoderScroll(int absolute, int delta) {
  sendToBrainData[0] = (char)absolute;
  sendToBrainData[1] = (char)delta;

  sendToBrain(TH_encoderScroll, TH_encoderScroll_len);
}

void onEncoderButtonPressed() {
  sendToBrainData[0] = 1; //should be empty
  sendToBrain(TH_encoderPressed, TH_encoderPressed_len);
}
void onEncoderButtonReleased() {
  sendToBrainData[0] = 0; //should be empty
  sendToBrain(TH_encoderReleased, TH_encoderReleased_len);
}

//
void onSelectorButtonPressed(byte button) {
  sendToBrainData[0] = button;
  sendToBrainData[1] = 1;
  sendToBrain(TH_selectorButtonPressed, TH_selectorButtonPressed_len);
}
//
void onSelectorButtonReleased(byte button) {
  sendToBrainData[0] = button;
  sendToBrainData[1] = 0;
  sendToBrain(TH_selectorButtonReleased, TH_selectorButtonReleased_len);
}
void onSelectorButtonHold(byte button) {}



