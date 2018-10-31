#ifndef NAMESIGNALSH
#define NAMESIGNALSH

#define MIDI_noteOn 0x90
#define MIDI_noteOff 0x80

#define EH_NULL 0x00
#define EH_CLOCKTICKHEADER 0xF
#define EH_TRIGGERONHEADER 0x9
#define EH_TRIGGEROFFHEADER 0x8
#define EH_TWEAKHEADER 0xC
#define EH_CLOCKABSOLUTEHEADER 0xA

//computer interface related names
//jsInterface{
#define SOFTBAUDRATE 19200
#define EOMessage 3
#define unknown -1

//recieve headers
#define RH_null_head 0x0
#define RH_null_len 0x0
#define RH_hello_head 0x1
#define RH_hello_len 0x0
#define RH_setMonoMaps_head 0x32
#define RH_setMonoMaps_len 0x12 //( red monomap 1, red monomap 2, red monomap 3, red monomap 4<<4 | intensity ... )
//adds to the current red a monomap
#define RH_setColorMonoMapsToColorFrom_head 0x33
// colR,colG,colB,from,monomaps
#define RH_setColorMonoMapsToColorFrom_len -1

#define RH_addColorMonoMapsToColorFrom_head 0x34
// colR,colG,colB,from,monomaps
#define RH_addColorMonoMapsToColorFrom_len -1

#define RH_setMatrixMonoMap_head 0x35
#define RH_setMatrixMonoMap_len 6 //like the x16 version
#define RH_setSelectorMonoMap_head 0x36
#define RH_setSelectorMonoMap_len 6 //like the x16 version

/* additional colors */
#define RH_defineColourA_head 0x87
#define RH_defineColourA_len 3
#define COLOURA_index 0
#define RH_defineColourB_head 0x88
#define RH_defineColourB_len 3
#define COLOURB_index 1
#define RH_defineColourC_head 0x89
#define RH_defineColourC_len 3
#define COLOURC_index 2
#define RH_defineColourD_head 0x8a
#define RH_defineColourD_len 3
#define COLOURD_index 3
#define RH_defineColourE_head 0x8b
#define RH_defineColourE_len 3
#define COLOURE_index 4
#define RH_defineColourF_head 0x8c
#define RH_defineColourF_len 3
#define COLOURF_index 5

#define RH_setMatrixMonoMapColourA_head 0x8d
#define RH_setMatrixMonoMapColourA_len 2
#define RH_setSelectorMonoMapColourA_head 0x8e
#define RH_setSelectorMonoMapColourA_len 2

#define RH_setMatrixMonoMapColourB_head 0x8f
#define RH_setMatrixMonoMapColourB_len 2
#define RH_setSelectorMonoMapColourB_head 0x90
#define RH_setSelectorMonoMapColourB_len 2

#define RH_setMatrixMonoMapColourC_head 0x91
#define RH_setMatrixMonoMapColourC_len 2
#define RH_setSelectorMonoMapColourC_head 0x92
#define RH_setSelectorMonoMapColourC_len 2

#define RH_setMatrixMonoMapColourD_head 0x93
#define RH_setMatrixMonoMapColourD_len 2
#define RH_setSelectorMonoMapColourD_head 0x94
#define RH_setSelectorMonoMapColourD_len 2

#define RH_setMatrixMonoMapColourE_head 0x95
#define RH_setMatrixMonoMapColourE_len 2
#define RH_setSelectorMonoMapColourE_head 0x96
#define RH_setSelectorMonoMapColourE_len 2

#define RH_setMatrixMonoMapColourF_head 0x97
#define RH_setMatrixMonoMapColourF_len 2
#define RH_setSelectorMonoMapColourF_head 0x98
#define RH_setSelectorMonoMapColourF_len 2

//sets the color of individual leds with a greater color depth
#define RH_setLedN_head 0x49
#define RH_setLedN_len -1 //(led n, r, g, b, [led n+1 r, led n+1 g, led n+1 b, ...])
#define RH_screenA_head 0x4a
#define RH_screenA_len -1
#define RH_screenB_head 0x4b
#define RH_screenB_len -1
#define RH_comTester_head 0x4c
#define RH_comTester_len 0x1

#define RH_engageControllerMode_head 0xf
#define RH_engageControllerMode_len 0x0
#define RH_disengageControllerMode_head 0x10
#define RH_disengageControllerMode_len 0x0

#define RH_version_head 0x40
#define RH_version_len 0x00

//transmit headers
#define TH_null_head 0x0
#define TH_null_len 0x0
#define TH_hello_head 0x1
#define TH_hello_len 0x0
#define TH_matrixButtonPressed_head 0x2
#define TH_matrixButtonPressed_len 0x1
#define TH_matrixButtonReleased_head 0x3
#define TH_matrixButtonReleased_len 0x1
#define TH_matrixButtonHold_head 0x4
#define TH_matrixButtonHold_len 0x4
#define TH_matrixButtonVelocity_head 0x5
#define TH_matrixButtonVelocity_len 0x2
#define TH_selectorButtonPressed_head 0x6
#define TH_selectorButtonPressed_len 0x1
#define TH_selectorButtonReleased_head 0x7
#define TH_selectorButtonReleased_len 0x1
#define TH_bottomButtonPressed_head 0x08
#define TH_bottomButtonPressed_len 0x01
#define TH_bottomButtonReleased_head 0x09
#define TH_bottomButtonReleased_len 0x01
#define TH_encoderScrolled_head 0xa
#define TH_encoderScrolled_len 0x1
#define TH_encoderPressed_head 0xb
#define TH_encoderPressed_len 0x0
#define TH_encoderReleased_head 0xc
#define TH_encoderReleased_len 0x0
#define TH_comTester_head 0xd
#define TH_comTester_len 0x1
#define TH_version_head 0x40
#define TH_version_len 0x00

#endif;
//}
