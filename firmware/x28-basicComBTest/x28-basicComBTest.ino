#include <LiquidCrystal.h>
#include <SoftwareSerial.h>
#include "SendOnlySoftwareSerial.h"
#define writer true
#if writer
// SoftwareSerial sSerial (14,15); // RX, TX
SendOnlySoftwareSerial    sSerial = SendOnlySoftwareSerial(15);

#else
#endif
LiquidCrystal lcd(49, 48, 47, 46, 45, 44);

void setup() {
  Serial.begin(19200);
  lcd.begin(16,2);
  #if writer
    sSerial.begin(9600);
    lcd.setCursor(0,0);
    lcd.print("writer");
  #else
    Serial3.begin(9600);
    lcd.print("reader");
  #endif
}
long sendTimer=0;
uint8_t testCounter=0;
void loop() {
  lcd.setCursor(0,1);
  #if writer
    if(millis()-sendTimer>300){
      lcd.print(String(testCounter,HEX));
      sSerial.write(testCounter);
      sendTimer=millis();
      testCounter++;
    }
  #else
    while(Serial3.available()){
      lcd.write(Serial3.read());
      delay(10);
    }
  #endif
}


