#ifndef PATCHBUSH
#define PATCHBUSH
#define patchBaud 9600
#define state_initializing 0x00
#define state_listening 0x01
#define state_receiving 0x02
#define state_writing 0x03
#define comBusPin 15
#include "SendOnlySoftwareSerial.h"
// #include <SoftwareSerial.h>

// SoftwareSerial is same as Serial3, but with pins flipped
// SoftwareSerial SoftwareSerial (14, comBusPin); // RX, TX
SendOnlySoftwareSerial sSerial = SendOnlySoftwareSerial(15);
class PatchBus {
  private:
    //TODO: should be an array so that many modes can be listening incoming signals
    void (*CB_messageListener)(uint8_t *,uint8_t) = 0;
    uint8_t currentState=state_initializing;
  public:
    PatchBus() {
      for(int a=0; a<32; a++){
        reception[a]=0;
      }
    }
    uint8_t myOutputs [32];
    uint8_t reception [32];
    uint8_t receptionHeader = 0;
    long waitStarted=0;
    void setup(){
      writingMode();
      // listeningMode();
    }
    void listeningMode(){
      sSerial.end();
      currentState=state_listening;
      pinMode(comBusPin,INPUT);
      digitalWrite(comBusPin,LOW);
      Serial3.begin(patchBaud);
    }
    void writingMode(){
      // Serial3.end();
      currentState=state_writing;
      pinMode(comBusPin,OUTPUT);
      digitalWrite(comBusPin,LOW);
      sSerial=SendOnlySoftwareSerial(15);
      sSerial.begin(patchBaud);
    }
    void start(){}
    uint8_t test_count=0;
    void writeLoop(){
      //writingMode();
      test_count++;
      sSerial.write(test_count);
    }
    void loop(){
      switch(currentState){
        case state_writing:{
          writeLoop();
          break;
        }
        case state_listening:{
          listenLoop();
          break;
        }
        case state_receiving:{
          listenLoop();
          break;
        }
        default:{

        }
      }
    }
    void listenLoop() {
      uint8_t expectedLength = 4;
      // if(Serial3.available()){
      if(false){
        currentState=state_receiving;
        //started receiving a message
        //or receiving the body of a messsage
        if(receptionHeader<expectedLength){
          // reception[receptionHeader]=Serial3.read();
          receptionHeader++;
          waitStarted=millis();
        }else{
          //finished receiving a message
          waitStarted=0;
          receptionHeader=0;
          messageReceived(reception, expectedLength);
        }
      }
      //timeout operation
      if(waitStarted){
        if(millis()-waitStarted>100){
          //trigger timeout
          waitStarted=0;
          receptionHeader=0;
        }
      }
    };

    void addMessageListener(void (*fpa)(uint8_t *,uint8_t)){
        CB_messageListener = fpa;
    };

    void messageReceived(uint8_t * message,uint8_t len){
      if ( 0 != CB_messageListener ) {
        (*CB_messageListener)(message,len);
      }
    }
    void out(uint8_t * message,uint8_t len) {
      //enqueue message, send it next opportunity.
      //for now, just send
      for (uint8_t i = 0; i < 4; i++) {
        //will it blend??
        sSerial.write(*(message + i));
        Serial.write(*(message + i));
      }
    }
};
#endif
