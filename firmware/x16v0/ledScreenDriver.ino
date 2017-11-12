//update one pixel on one of the color channels behind the mux. Be aware that redPixel function exists

void updatePixel(byte currentPixel) {
  currentPixel += 0xf;
  //nibble A is connected to the mux address for the anodes / btn inputs
  byte nibbleA = 0xF;
  //nibble B is connected to the mux for the cathodes / btn outputs
  byte nibbleB = 0xF;
  byte currentLayer = currentPixel / 16;
  if ((layers[currentLayer-1] >> (currentPixel % 16)) & 0x1) {

    //(currentPixel>>2)&12 is the same than doing floor(currentPixel/16)*4. try it  in codechef
    nibbleA &= (currentPixel % 4) + (currentPixel >> 2 & 12); //[0-15]=0,[16-31]=4,[32-47]=8,[48-63]=12
    nibbleB &= (currentPixel / 4) % 4; //~0x10 << ((currentPixel / 4) % 4); //0,0,0,0,1,1,1,1,2,2,2,2,3,3,3,3, will happen 4 times within 64 loop

    nibbleB += 8;
    //ground & power the led. strangely still works without these lines

    digitalWrite(analogA, HIGH);
    digitalWrite(analogB, LOW);

    char DMASK=~0x3;

    // char encoderMask=(0x3<<4);

    char ADDRMAP=(nibbleB << 4) | (nibbleA);
    //test irresponsible write (not masking)
    PORTD = ADDRMAP;

    //turn A2 & A3 to outputs
    #define CSHIFT 2
    char CMASK=0x3<<CSHIFT;
    DDRC|=CMASK;
    PORTC &= ~CMASK;
    PORTC |= (ADDRMAP<<CSHIFT)&CMASK;
    switch (currentLayer) {
#if COMPENSATE_R > 0
      case 3:
        delayMicroseconds( COMPENSATE_R);
        break;
#endif
#if COMPENSATE_G > 0
      case 1:
        delayMicroseconds( COMPENSATE_G);
        break;
#endif
#if COMPENSATE_B > 0
      case 2:
        delayMicroseconds( COMPENSATE_B);
        break;
#endif
    }

  }
}
