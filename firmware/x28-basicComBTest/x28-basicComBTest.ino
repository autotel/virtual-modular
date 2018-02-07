#include <LiquidCrystal.h>
#include <SoftwareSerial.h>
#include "SendOnlySoftwareSerial.h"
#define writer false
#if writer
// SoftwareSerial com_out (14,15); // RX, TX
SendOnlySoftwareSerial    com_out = SendOnlySoftwareSerial(15);
#else
#endif

#define com_in Serial3

LiquidCrystal lcd(49, 48, 47, 46, 45, 44);

void setup() {
  Serial.begin(19200);
  lcd.begin(16,2);
  #if writer
    com_out.begin(9600);
    lcd.setCursor(0,0);
    lcd.print("writer");
  #else
    com_in.begin(9600);
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
      com_out.write(testCounter);
      sendTimer=millis();
      testCounter++;
    }
  #else
    while(com_in.available()){
      lcd.write(com_in.read());
      delay(10);
    }
  #endif
}


