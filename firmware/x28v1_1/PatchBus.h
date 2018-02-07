#ifndef PATCHBUSH
#define PATCHBUSH
#define patchBaud 9600
#define state_initializing 0x00
#define state_listening 0x01
#define state_receiving 0x02
#define state_writing 0x03
#define comBusPin 15
#define serialDebug true
#include "SendOnlySoftwareSerial.h"
// #include <SoftwareSerial.h>

// SoftwareSerial is same as Serial3, but with pins flipped
// SoftwareSerial SoftwareSerial (14, comBusPin); // RX, TX
SendOnlySoftwareSerial com_out = SendOnlySoftwareSerial(15);
#define com_in Serial3

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
      // writingMode();
      listeningMode();
    }
    void listeningMode(){
      com_out.end();
      currentState=state_listening;
      pinMode(comBusPin,INPUT);
      digitalWrite(comBusPin,LOW);
      com_in.begin(patchBaud);
    }
    void writingMode(){
      com_in.end();
      currentState=state_writing;
      pinMode(comBusPin,OUTPUT);
      digitalWrite(comBusPin,LOW);
      com_out=SendOnlySoftwareSerial(15);
      com_out.begin(patchBaud);
    }
    void start(){}
    uint8_t test_count=0;
    void writeLoop(){
      //writingMode();
      test_count++;
      com_out.write(test_count);
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
      if(com_in.available()){
      // if(false){
        currentState=state_receiving;
        //started receiving a message
        //or receiving the body of a messsage
        if(receptionHeader<expectedLength){
          reception[receptionHeader]=com_in.read();
          #if serialDebug
          Serial.println(receptionHeader);
          #endif;
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
        if(millis()-waitStarted>10000){
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
      #if serialDebug
      Serial.print("\nRCV:");
      for(int a=0; a<len; a++){
        Serial.print(message[a]);
      }
      #endif
      if ( 0 != CB_messageListener ) {
        (*CB_messageListener)(message,len);
      }
    }
    void out(uint8_t * message,uint8_t len) {
      #if serialDebug
      Serial.print("\nSEND>>");
      #endif
      //enqueue message, send it next opportunity.
      //for now, just send
      writingMode();//will not go here
      for (uint8_t i = 0; i < 4; i++) {//will not go here
        //will it blend??
        com_out.write(*(message + i));//will not go here
        #if serialDebug
        Serial.print(*(message + i));
        #endif

      }//will not go here
      listeningMode();//will not go here
    }
};
#endif
