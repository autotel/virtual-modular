#ifndef PATCHBUSH
#define PATCHBUSH
#include "../slibs/TBN/TBN.h"
class PatchBus {
  private:
    //TODO: should be an array so that many modes can be listening incoming signals
    void (*CB_messageListener)(uint8_t *,uint8_t) = 0;
    void listeningMode(){}
    void writingMode(){

    }
  public:

    TBN network;
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
      Serial3.begin(31250);
      network.start();
      network.onData(onMessage);
    }
    void loop() {
      uint8_t expectedLength = 4;
      if(Serial3.available()){
        //started receiving a message
        //or receiving the body of a messsage
        if(receptionHeader<expectedLength){
          reception[receptionHeader]=Serial3.read();
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
    void out(uint8_t * message) {
      //enqueue message, send it next opportunity.
      //for now, just send
      for (uint8_t i = 0; i < 4; i++) {
        //will it blend??
        Serial3.write(*(message + i));
      }
    }
};
#endif
