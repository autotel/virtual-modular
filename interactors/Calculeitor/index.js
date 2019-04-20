/*Calculeitor interactor entry point */
module.exports=function(environment){
    environment.hardwares.whenAvailable("calculeitors",function(calculeitors){
        console.log("calculeitors became available");
        calculeitors.on('+hardware',function(event){
            if(event.type=="x28v2"){
                console.log("new calculeitor connected");
                controller.lookForCharacters();
                controller.engageControllerMode().then(console.log).catch(console.error);

                setTimeout(function(){
                   controller.definePresetColor("red",[0xC8,0x1B,0x1B]);
                   controller.definePresetColor("red_dim",[0x4E,0x03,0x03]);
                   controller.definePresetColor("orange",[0xFF,0xA7,0x0D]);
                   controller.definePresetColor("orange_dim",[0x57,0x39,0x04]);
                   controller.definePresetColor("yellow",[0xD2,0xF1,0x0B]);
                   controller.definePresetColor("yellow_dim",[0x6A,0x71,0x05]);
                   controller.definePresetColor("cyan",[0x13,0xF0,0xDA]);
                   controller.definePresetColor("cyan_dim",[0x06,0x52,0x4A]);
                   controller.definePresetColor("blue",[0x11,0x57,0xFF]);
                   controller.definePresetColor("blue_dim",[0x05,0x18,0x46]);
                   controller.definePresetColor("gray",[0xA2,0x9E,0xBA]);
                   controller.definePresetColor("gray_dim",[0x38,0x36,0x40]);
                   controller.definePresetColor("magenta",[0xFF,0x01,0x90]);
                   controller.definePresetColor("magenta_dim",[0x44,0x00,0x26]);
                   controller.definePresetColor("crimson",[0xA3,0x00,0x00]);
                   controller.definePresetColor("white",[0xC2,0xD6,0xF1]);

                    let c=0;
                    controller.paintPresetColor("red", 1<<(c++));
                    controller.paintPresetColor("red_dim", 1<<(c++));
                    controller.paintPresetColor("orange", 1<<(c++));
                    controller.paintPresetColor("orange_dim", 1<<(c++));
                    controller.paintPresetColor("yellow", 1<<(c++));
                    controller.paintPresetColor("yellow_dim", 1<<(c++));
                    controller.paintPresetColor("cyan", 1<<(c++));
                    controller.paintPresetColor("cyan_dim", 1<<(c++));
                    controller.paintPresetColor("blue", 1<<(c++));
                    controller.paintPresetColor("blue_dim", 1<<(c++));
                    controller.paintPresetColor("gray", 1<<(c++));
                    controller.paintPresetColor("gray_dim", 1<<(c++));
                    controller.paintPresetColor("magenta", 1<<(c++));
                    controller.paintPresetColor("magenta_dim", 1<<(c++));
                    controller.paintPresetColor("crimson", 1<<(c++));
                    controller.paintPresetColor("white", 1<<(c++));
                },200);

            }else{
                console.log("hardware not recognized as calculeitor",event.type);
            }
        });
    });
}