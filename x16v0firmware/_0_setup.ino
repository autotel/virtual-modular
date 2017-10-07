//find midi communication at the bottom


#include <LiquidCrystal.h>
#include <TimerOne.h>
#include <SoftwareSerial.h>

/*encoder is conected to a muxb addr*/
/*may be able to reduce dynamic memory by using https://www.arduino.cc/en/Reference/PROGMEM progmem */

#define COMPENSATE_R 200
#define COMPENSATE_G 0
#define COMPENSATE_B 0
// seq_ence[frame][(active+time),(type+channel),(number),(velocity or value)]
//how much conductivity is needed for a button to be detected as pressed?
#define BUTTONTRESH 10
//analog inputs that are connected to the multiplexor commons

#define analogA A1
#define analogB A0

//pins that are connected to the encoder A and B
//pc4 & pc5
#define encoder0PinA  A4
#define encoder0PinB  A5
volatile unsigned int encoder0Pos = 0;

//serial is separated by pauses, sadly.
//perhaps I should define a better protocol than this somehow.
#define serialSeparationTime 200
long lastSerial=0;
//pins that are connected to the midi plugs as software serial
#define sIn 0
#define sOut 1
//SoftwareSerial Serial(sIn, sOut); // RX, TX

//text to print in screens
String screenA = "";
String screenB = "";
String lastScreenA = "";
String lastScreenB = "";
//flag that indicates that the screen should be redrawn when possible
bool screenChanged = true;

//the last button that has been pressed on the matrix buttons
byte lastMatrixButtonPressed = 0;
//buttons that were pressed on last evaluation;
unsigned int pressedMatrixButtonsBitmap = 0x0000;
byte pressedSelectorButtonsBitmap = 0x00;

LiquidCrystal lcd(8, 9, 10, 11, 12, 13);

//long lastchange;

unsigned int layers [] = {0xffff, 0xffff, 0xffff};


void setup() {
  //the perfect pulldown is 2.5K ohms
  //the analog port that will be connected to each mux A and B

  pinMode(analogA, OUTPUT);
  pinMode(analogB, OUTPUT);
  digitalWrite(analogA, HIGH);
  digitalWrite(analogB, LOW);
  //set all pins from 0 to 7 to output
  DDRD = 0xFF;

  /*Timer1.initialize(500);//200
  Timer1.attachInterrupt(timedLoop);*/

  //sequence[2][0] = 0x90;

//pendant: probably can be faster
  Serial.begin(SOFT_BAUDRATE);
  // Serial.write(TH_hello);

  //lcd screen initial write
  lcd.begin(16, 2);

  //encoder set up
  pinMode(encoder0PinA, INPUT);
  digitalWrite(encoder0PinA, HIGH);       // turn on pull-up resistor
  pinMode(encoder0PinB, INPUT);
  digitalWrite(encoder0PinB, HIGH);       // turn on pull-up resistor

  lcdPrintA("init");
  lcdPrintB("init");

}




char sign(char x) {
 return (x > 0) - (x < 0);
}
