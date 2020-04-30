const EventMessage = require("../../Polimod/datatypes/EventMessage");

let Router=require("./");
var Polimod=require('../../Polimod');
var Base=require('../Base');
const environment=new Polimod();

const testProperties={
    routerNum:0,
    bitmap:55,
}
const expectedProperties={
    routerNum:{
        value:0
    },
}

test("module can be constructed without errors",()=>{
    let testInstance=new Router({},environment);
});

test("module correctly applies passed properties",()=>{
    let testInstance=new Router(testProperties,environment);
    expect(testInstance.settings).toEqual(expectedProperties);
    expect(testInstance.routeBitmap.value).toEqual(55);
});

test("routes correctly according to properties",()=>{
    let testInstance=new Router(testProperties,environment);
    let testModules=[
        new Base({},environment),
        new Base({},environment),
    ];
    const promise1=new Promise((resolve,reject)=>{
        testModules[0].messageReceived=function(evt){
            console.log("received fine");
            resolve();
        }
        setTimeout(()=>reject("timeout waiting message"),500);
    });

    const promise2=new Promise((resolve,reject)=>{
        testModules[1].messageReceived=function(evt){
            reject("This module was not supposed to receive message");
        };
        setTimeout(resolve,500);
    });


    testInstance.addOutput(testModules[0]);
    testInstance.addOutput(testModules[1]);
    
    testInstance.messageReceived({
        eventMessage:new EventMessage({value:[0,0,0,0]})
    });

    testInstance.routeBitmap.value=0b1000010000100001;
    testInstance.settings.routerNum.value=1;

    return Promise.all([promise1,promise2]);
});