

//actions to take while a button is held, taking the pressure into account
void onMatrixButtonHold(byte button, byte buttonPressure) {
  sendToBrainData[0] = button; 
  sendToBrainData[1] = buttonPressure;
  sendToBrainData[2] = pressedMatrixButtonsBitmap;
  sendToBrain(TH_buttonMatrixHold, TH_buttonMatrixHold_len);
}
//actions to take while a button is pressed
void onMatrixButtonPressed(byte button) {
  sendToBrainData[0] = button;
  sendToBrainData[1] = 1;
  sendToBrainData[2] = (byte)pressedMatrixButtonsBitmap;
  sendToBrainData[3] = (byte)(pressedMatrixButtonsBitmap >> 8);

  //  lcdPrintA(String(button,HEX));
  // layers[0]=layers[1]=layers[2]=0x1<<button;
  //sendToBrain(TH_buttonMatrixVelocity,sendToBrainData,TH_buttonMatrixVelocity_len);

  sendToBrain(TH_buttonMatrixPressed, TH_buttonMatrixPressed_len);
}


//actions to take once a button is pressed

void onMatrixButtonPressed(byte button, int buttonPressure) {
  sendToBrainData[0] = button;
  sendToBrainData[1] = buttonPressure;
  sendToBrainData[2] = (byte)pressedMatrixButtonsBitmap;
  sendToBrainData[3] = (byte)(pressedMatrixButtonsBitmap >> 8);

  sendToBrain(TH_buttonMatrixPressed, TH_buttonMatrixPressed_len);
}
//actions to take once a button is released
void onMatrixButtonReleased(byte button) {
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



