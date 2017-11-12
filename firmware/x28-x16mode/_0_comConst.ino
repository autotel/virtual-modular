//these constants are shared between brain and this, and thus should be updated with the update app
#define SOFT_BAUDRATE 19200
#define EOMessage 3
#define unknown -1

//recieve headers
#define RH_null 0x0
#define RH_null_len 0x0
#define RH_hello 0x1
#define RH_hello_len 0x0
#define RH_ledMatrix 0x2
#define RH_ledMatrix_len 0x6
#define RH_screenA 0x3
#define RH_screenA_len -1
#define RH_screenB 0x4
#define RH_screenB_len -1
#define RH_setInteractionMode 0x5
#define RH_setInteractionMode_len 0x4
#define RH_currentStep 0x6
#define RH_currentStep_len 0x2
#define RH_comTester 0x7
#define RH_comTester_len 0x1
#define RH_version 0x40
#define RH_version_len 0x00
#define RH_test_lcdDirect 0x41
#define RH_test_lcdDirect_len 1


//transmit headers
#define TH_null 0x0
#define TH_null_len 0x0
#define TH_hello 0x1
#define TH_hello_len 0x0
#define TH_buttonMatrixPressed 0x2
#define TH_buttonMatrixPressed_len 0x4
#define TH_buttonMatrixReleased 0x3
#define TH_buttonMatrixReleased_len 0x4
#define TH_buttonMatrixHold 0x4
#define TH_buttonMatrixHold_len 0x4
#define TH_buttonMatrixVelocity 0x5
#define TH_buttonMatrixVelocity_len 0x4
#define TH_selectorButtonPressed 0x6
#define TH_selectorButtonPressed_len 0x2
#define TH_selectorButtonReleased 0x7
#define TH_selectorButtonReleased_len 0x2
#define TH_encoderScroll 0x8
#define TH_encoderScroll_len 0x2
#define TH_encoderPressed 0x9
#define TH_encoderPressed_len 0x1
#define TH_encoderReleased 0xa
#define TH_encoderReleased_len 0x1
#define TH_comTester 0xb
#define TH_comTester_len 0x1
#define TH_version 0x40

