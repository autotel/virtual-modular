#ifndef NAMESIGNALSH
#define NAMESIGNALSH

#define MIDI_noteOn 0x90
#define MIDI_noteOff 0x80

#endif;

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
#define RH_setMonoMaps_head 0x2
#define RH_setMonoMaps_len 0x6 //( red monomap 1, red monomap 2, red monomap 3, red monomap 4<<4 | intensity ... )
//adds to the current red a monomap
#define RH_addRedMonomap_head 0x3//(monomap 1, monomap 2, monomap 3, monomap 4<<4 | intensity)
#define RH_addRedMonomap_len 0x4
#define RH_addGreenMonomap_head 0x4//(monomap 1, monomap 2, monomap 3, monomap 4<<4 | intensity)
#define RH_addGreenMonomap_len 0x4
#define RH_addBlueMonomap_head 0x5//(monomap 1, monomap 2, monomap 3, monomap 4<<4 | intensity)
#define RH_addBlueMonomap_len 0x4
#define RH_setRedMonomap_head 0x6 //(monomap 1, monomap 2, monomap 3, monomap 4<<4 | intensity)
#define RH_setRedMonomap_len 0x4
#define RH_setGreenMonomap_head 0x7 //(monomap 1, monomap 2, monomap 3, monomap 4<<4 | intensity)
#define RH_setGreenMonomap_len 0x4
#define RH_setBlueMonomap_head 0x8 //(monomap 1, monomap 2, monomap 3, monomap 4<<4 | intensity)
#define RH_setBlueMonomap_len 0x4
//sets the color of individual leds with a greater color depth
#define RH_setLedN_head 0x9
#define RH_setLedN_len -1 //(led n, r, g, b, [led n+1 r, led n+1 g, led n+1 b, ...])
#define RH_screenA_head 0xa
#define RH_screenA_len -1
#define RH_screenB_head 0xb
#define RH_screenB_len -1
#define RH_comTester_head 0xc
#define RH_comTester_len 0x1

#define RH_version_head 0x40
#define RH_version_len 0x00

//transmit headers
#define TH_null_head 0x0
#define TH_null_len 0x0
#define TH_hello_head 0x1
#define TH_hello_len 0x0
#define TH_buttonMatrixPressed_head 0x2
#define TH_buttonMatrixPressed_len 0x1
#define TH_buttonMatrixReleased_head 0x3
#define TH_buttonMatrixReleased_len 0x1
#define TH_buttonMatrixHold_head 0x4
#define TH_buttonMatrixHold_len 0x4
#define TH_buttonMatrixVelocity_head 0x5
#define TH_buttonMatrixVelocity_len 0x2
#define TH_selectorButtonPressed_head 0x6
#define TH_selectorButtonPressed_len 0x1
#define TH_selectorButtonReleased_head 0x7
#define TH_selectorButtonReleased_len 0x1
#define TH_buttonBottomPressed_head 0x08
#define TH_buttonBottomPressed_len 0x01
#define TH_buttonBottomReleased_head 0x09
#define TH_buttonBottomReleased_len 0x01
#define TH_encoderScroll_head 0xa
#define TH_encoderScroll_len 0x1
#define TH_encoderPressed_head 0xb
#define TH_encoderPressed_len 0x0
#define TH_encoderReleased_head 0xc
#define TH_encoderReleased_len 0x0
#define TH_comTester_head 0xd
#define TH_comTester_len 0x1
#define TH_version_head 0x40
#define TH_version_len 0x00

#define RH_engageControllerMode_head 0xe
#define RH_engageControllerMode_len 0x0
#define RH_disengageControllerMode_head 0xf
#define RH_disengageControllerMode_len 0x0

//}

