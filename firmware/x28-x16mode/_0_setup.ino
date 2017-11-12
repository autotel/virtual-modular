
#include <LiquidCrystal.h>

//text to print in screens
String screenA;
String screenB;
String lastScreenA;
String lastScreenB;

boolean activeAnimation = true;

//flag that indicates that the screen should be redrawn when possible
bool screenChanged = true;

LiquidCrystal lcd(49, 48, 47, 46, 45, 44);

void setup() {
  screenA.reserve(16);
  screenB.reserve(16);
  lastScreenA.reserve(16);
  lastScreenB.reserve(16);
  //ugly setup encoder port
  DDRA = 0x00; //0x3<<6;
  PORTA = 0xFF;
  Serial1.begin(31250);
  Serial.begin(SOFT_BAUDRATE);
  Serial.write(0x01);
  //Serial1.begin(31250);
  lcd.begin(16, 2);
  /* byte smiley[8] = {
     B00011,
     B00101,
     B00101,
     B01001,
     B01111,
     B10001,
     B10001,
    };

    lcd.createChar(0, smiley);*/
  lcdPrintA("x28V0");
  lcdPrintB("Autotel");
  hardware_init();

}
long lastUpdate = 0;
long testTimer = 0;
//uint32_t ttest = 0;
void loop() {


  if (millis() - lastUpdate > 1000 / 20) {
    screenLoop();
    lastUpdate = millis();
    refreshLeds();
  }
  hardware_loop();
  if (activeAnimation) {
    animationFrame();
  }
  //ttest=0;
  //}
  //ttest++;

  
  while (Serial1.available()) {
    Serial.write(Serial1.read());
  }

  if (millis() - testTimer > 500) {
    testTimer = millis();
    Serial1.write(0x90);
    Serial1.write(45);
    Serial1.write(120);
  }
  checkMessages();

}


void lcdPrintA(String what) {
  screenChanged = true;
  screenA = what;
}

void lcdPrintB(String what) {
  screenChanged = true;
  screenB = what;
}

void screenLoop() {
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

