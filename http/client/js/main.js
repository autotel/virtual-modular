/******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};
/******/
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/
/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId]) {
/******/ 			return installedModules[moduleId].exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			i: moduleId,
/******/ 			l: false,
/******/ 			exports: {}
/******/ 		};
/******/
/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);
/******/
/******/ 		// Flag the module as loaded
/******/ 		module.l = true;
/******/
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/
/******/
/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;
/******/
/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;
/******/
/******/ 	// define getter function for harmony exports
/******/ 	__webpack_require__.d = function(exports, name, getter) {
/******/ 		if(!__webpack_require__.o(exports, name)) {
/******/ 			Object.defineProperty(exports, name, {
/******/ 				configurable: false,
/******/ 				enumerable: true,
/******/ 				get: getter
/******/ 			});
/******/ 		}
/******/ 	};
/******/
/******/ 	// getDefaultExport function for compatibility with non-harmony modules
/******/ 	__webpack_require__.n = function(module) {
/******/ 		var getter = module && module.__esModule ?
/******/ 			function getDefault() { return module['default']; } :
/******/ 			function getModuleExports() { return module; };
/******/ 		__webpack_require__.d(getter, 'a', getter);
/******/ 		return getter;
/******/ 	};
/******/
/******/ 	// Object.prototype.hasOwnProperty.call
/******/ 	__webpack_require__.o = function(object, property) { return Object.prototype.hasOwnProperty.call(object, property); };
/******/
/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "";
/******/
/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(__webpack_require__.s = 0);
/******/ })
/************************************************************************/
/******/ ([
/* 0 */
/*!**********************!*\
  !*** ./src/index.js ***!
  \**********************/
/*! no static exports found */
/*! all exports used */
/***/ (function(module, exports, __webpack_require__) {

"use strict";
eval("\r\n//environment.js\r\nvar Observable=__webpack_require__(/*! onhandlers */ 3);\r\nvar environment=new(function(){\r\n  var modules=this.modules=new Set();\r\n  this.plugins={};\r\n  var self=this;\r\n  this.use=function(Proto){\r\n    console.log(\"using\",Proto.name);\r\n    this.plugins[Proto.name]=new Proto(self);\r\n  }\r\n  this.addModule=function(properties){\r\n    modules.add(properties)\r\n  }\r\n  this.connect=function(properties){\r\n    properties.origin.connectTo(properties.destination);\r\n  }\r\n  return this;\r\n})();\r\n\r\n//index.js\r\nenvironment.use(__webpack_require__(/*! ./socketMan.js */ 1));//# sourceURL=[module]\n//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiMC5qcyIsInNvdXJjZXMiOlsid2VicGFjazovLy8uL3NyYy9pbmRleC5qcz85NTUyIl0sInNvdXJjZXNDb250ZW50IjpbIid1c2Ugc3RyaWN0J1xyXG4vL2Vudmlyb25tZW50LmpzXHJcbnZhciBPYnNlcnZhYmxlPXJlcXVpcmUoJ29uaGFuZGxlcnMnKTtcclxudmFyIGVudmlyb25tZW50PW5ldyhmdW5jdGlvbigpe1xyXG4gIHZhciBtb2R1bGVzPXRoaXMubW9kdWxlcz1uZXcgU2V0KCk7XHJcbiAgdGhpcy5wbHVnaW5zPXt9O1xyXG4gIHZhciBzZWxmPXRoaXM7XHJcbiAgdGhpcy51c2U9ZnVuY3Rpb24oUHJvdG8pe1xyXG4gICAgY29uc29sZS5sb2coXCJ1c2luZ1wiLFByb3RvLm5hbWUpO1xyXG4gICAgdGhpcy5wbHVnaW5zW1Byb3RvLm5hbWVdPW5ldyBQcm90byhzZWxmKTtcclxuICB9XHJcbiAgdGhpcy5hZGRNb2R1bGU9ZnVuY3Rpb24ocHJvcGVydGllcyl7XHJcbiAgICBtb2R1bGVzLmFkZChwcm9wZXJ0aWVzKVxyXG4gIH1cclxuICB0aGlzLmNvbm5lY3Q9ZnVuY3Rpb24ocHJvcGVydGllcyl7XHJcbiAgICBwcm9wZXJ0aWVzLm9yaWdpbi5jb25uZWN0VG8ocHJvcGVydGllcy5kZXN0aW5hdGlvbik7XHJcbiAgfVxyXG4gIHJldHVybiB0aGlzO1xyXG59KSgpO1xyXG5cclxuLy9pbmRleC5qc1xyXG5lbnZpcm9ubWVudC51c2UocmVxdWlyZSgnLi9zb2NrZXRNYW4uanMnKSk7XG5cblxuLy8vLy8vLy8vLy8vLy8vLy8vXG4vLyBXRUJQQUNLIEZPT1RFUlxuLy8gLi9zcmMvaW5kZXguanNcbi8vIG1vZHVsZSBpZCA9IDBcbi8vIG1vZHVsZSBjaHVua3MgPSAwIl0sIm1hcHBpbmdzIjoiQUFBQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSIsInNvdXJjZVJvb3QiOiIifQ==\n//# sourceURL=webpack-internal:///0\n");

/***/ }),
/* 1 */
/*!**************************!*\
  !*** ./src/socketMan.js ***!
  \**************************/
/*! no static exports found */
/*! all exports used */
/***/ (function(module, exports, __webpack_require__) {

"use strict";
eval("\r\nvar Observable=__webpack_require__(/*! onhandlers */ 3);\r\nvar messageCompressor=new (__webpack_require__(/*! ../../shared/MessageCompressor.js */ 2));\r\nvar compress=messageCompressor.compress;\r\nvar decompress=messageCompressor.decompress;\r\nvar globalBindFunction;\r\nvar uniqueArray=[];\r\n\r\nvar SocketMan=function(environment){\r\n  Observable.call(this);\r\n  var self=this;\r\n  var socket = io();\r\n  socket.on('message',function(msg){\r\n    msg=decompress(msg);\r\n    if(msg.type){\r\n      self.handle(msg.type,msg);\r\n      if(messageCallbacks[msg.type]){\r\n        messageCallbacks[msg.type](msg);\r\n      }else{\r\n        console.log(\"-no procedure for\",msg.type);\r\n      }\r\n    }else{\r\n      console.log('received malformed message',msg);\r\n    }\r\n  });\r\n  socket.on('emit test',console.log);\r\n  this.testMessage=function(text){\r\n    socket.send('test',text);\r\n  }\r\n\r\n  var messageCallbacks={\r\n    '+ module':function(msg){\r\n      console.log(\"NEW MODULE\",msg);\r\n      environment.addModule(msg);\r\n    },\r\n    '+ connection':function(msg){\r\n      console.log(\"CONNECT MODULE\",msg);\r\n      environment.connect(msg);\r\n    }\r\n  }\r\n\r\n  return this;\r\n};\r\n\r\n\r\nmodule.exports=SocketMan//# sourceURL=[module]\n//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiMS5qcyIsInNvdXJjZXMiOlsid2VicGFjazovLy8uL3NyYy9zb2NrZXRNYW4uanM/NGMwZiJdLCJzb3VyY2VzQ29udGVudCI6WyIndXNlIHN0cmljdCc7XHJcbnZhciBPYnNlcnZhYmxlPXJlcXVpcmUoJ29uaGFuZGxlcnMnKTtcclxudmFyIG1lc3NhZ2VDb21wcmVzc29yPW5ldyAocmVxdWlyZSgnLi4vLi4vc2hhcmVkL01lc3NhZ2VDb21wcmVzc29yLmpzJykpO1xyXG52YXIgY29tcHJlc3M9bWVzc2FnZUNvbXByZXNzb3IuY29tcHJlc3M7XHJcbnZhciBkZWNvbXByZXNzPW1lc3NhZ2VDb21wcmVzc29yLmRlY29tcHJlc3M7XHJcbnZhciBnbG9iYWxCaW5kRnVuY3Rpb247XHJcbnZhciB1bmlxdWVBcnJheT1bXTtcclxuXHJcbnZhciBTb2NrZXRNYW49ZnVuY3Rpb24oZW52aXJvbm1lbnQpe1xyXG4gIE9ic2VydmFibGUuY2FsbCh0aGlzKTtcclxuICB2YXIgc2VsZj10aGlzO1xyXG4gIHZhciBzb2NrZXQgPSBpbygpO1xyXG4gIHNvY2tldC5vbignbWVzc2FnZScsZnVuY3Rpb24obXNnKXtcclxuICAgIG1zZz1kZWNvbXByZXNzKG1zZyk7XHJcbiAgICBpZihtc2cudHlwZSl7XHJcbiAgICAgIHNlbGYuaGFuZGxlKG1zZy50eXBlLG1zZyk7XHJcbiAgICAgIGlmKG1lc3NhZ2VDYWxsYmFja3NbbXNnLnR5cGVdKXtcclxuICAgICAgICBtZXNzYWdlQ2FsbGJhY2tzW21zZy50eXBlXShtc2cpO1xyXG4gICAgICB9ZWxzZXtcclxuICAgICAgICBjb25zb2xlLmxvZyhcIi1ubyBwcm9jZWR1cmUgZm9yXCIsbXNnLnR5cGUpO1xyXG4gICAgICB9XHJcbiAgICB9ZWxzZXtcclxuICAgICAgY29uc29sZS5sb2coJ3JlY2VpdmVkIG1hbGZvcm1lZCBtZXNzYWdlJyxtc2cpO1xyXG4gICAgfVxyXG4gIH0pO1xyXG4gIHNvY2tldC5vbignZW1pdCB0ZXN0Jyxjb25zb2xlLmxvZyk7XHJcbiAgdGhpcy50ZXN0TWVzc2FnZT1mdW5jdGlvbih0ZXh0KXtcclxuICAgIHNvY2tldC5zZW5kKCd0ZXN0Jyx0ZXh0KTtcclxuICB9XHJcblxyXG4gIHZhciBtZXNzYWdlQ2FsbGJhY2tzPXtcclxuICAgICcrIG1vZHVsZSc6ZnVuY3Rpb24obXNnKXtcclxuICAgICAgY29uc29sZS5sb2coXCJORVcgTU9EVUxFXCIsbXNnKTtcclxuICAgICAgZW52aXJvbm1lbnQuYWRkTW9kdWxlKG1zZyk7XHJcbiAgICB9LFxyXG4gICAgJysgY29ubmVjdGlvbic6ZnVuY3Rpb24obXNnKXtcclxuICAgICAgY29uc29sZS5sb2coXCJDT05ORUNUIE1PRFVMRVwiLG1zZyk7XHJcbiAgICAgIGVudmlyb25tZW50LmNvbm5lY3QobXNnKTtcclxuICAgIH1cclxuICB9XHJcblxyXG4gIHJldHVybiB0aGlzO1xyXG59O1xyXG5cclxuXHJcbm1vZHVsZS5leHBvcnRzPVNvY2tldE1hblxuXG5cbi8vLy8vLy8vLy8vLy8vLy8vL1xuLy8gV0VCUEFDSyBGT09URVJcbi8vIC4vc3JjL3NvY2tldE1hbi5qc1xuLy8gbW9kdWxlIGlkID0gMVxuLy8gbW9kdWxlIGNodW5rcyA9IDAiXSwibWFwcGluZ3MiOiJBQUFBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBIiwic291cmNlUm9vdCI6IiJ9\n//# sourceURL=webpack-internal:///1\n");

/***/ }),
/* 2 */
/*!**************************************!*\
  !*** ../shared/MessageCompressor.js ***!
  \**************************************/
/*! no static exports found */
/*! all exports used */
/***/ (function(module, exports, __webpack_require__) {

"use strict";
eval("\r\nvar Observable=__webpack_require__(/*! onhandlers */ 3);\r\n\r\nvar dataMap=[\r\n  {\r\n    header:'+ module',\r\n    attributes:['unique','name','features'],\r\n  },{\r\n    header:'- module',\r\n    attributes:['unique','name','features'],\r\n  },{\r\n    header:'select module',\r\n    attributes:['origin'],\r\n  },{\r\n    header:'deselect module',\r\n    attributes:['origin'],\r\n  },{\r\n    header:'focus module',\r\n    attributes:['origin'],\r\n  },{\r\n    header:'defocus module',\r\n    attributes:['origin'],\r\n  },{\r\n    header:'> message',\r\n    attributes:['origin','destination','val'],\r\n  },{\r\n    header:'+ connection',\r\n    attributes:['origin','destination'],\r\n  },{\r\n    header:'- connection',\r\n    attributes:['origin','destination'],\r\n  }\r\n]\r\n\r\nvar headerToDataMap={};\r\n\r\nfor(var a in dataMap){\r\n  headerToDataMap[dataMap[a].header] = a;\r\n}\r\n\r\nvar MessageCompressor=function(socket){\r\n  var self=this;\r\n  Observable.call(this);\r\n\r\n  this.compress=function(readableMessage){\r\n    console.log(\"COMP\");\r\n    var header=readableMessage.type;\r\n    var headerNumber=headerToDataMap[header];\r\n    var map=dataMap[headerNumber];\r\n    var ret=[parseInt(headerNumber)];\r\n    if(!dataMap){\r\n      console.error(\"data structure of the message is\",map,readableMessage);\r\n    }\r\n    if(map.attributes){\r\n      for(var a of map.attributes){\r\n        ret.push(readableMessage[a]);\r\n      }\r\n    }\r\n    console.log(readableMessage,\"=\",ret);\r\n    return ret;\r\n  }\r\n  this.decompress=function(compressedMessage){\r\n    compressedMessage=Array.from(compressedMessage);\r\n    console.log(\"DECOMP\",compressedMessage);\r\n    var ret={}\r\n    var headerNumber=compressedMessage.shift();\r\n    var map=dataMap[headerNumber];\r\n    var header=map.header;\r\n    ret.type=header;\r\n    for(var a in map.attributes){\r\n      ret[map.attributes[a]]=compressedMessage[a];\r\n    }\r\n    return ret;\r\n  }\r\n\r\n}\r\nmodule.exports = MessageCompressor;//# sourceURL=[module]\n//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiMi5qcyIsInNvdXJjZXMiOlsid2VicGFjazovLy8uLi9zaGFyZWQvTWVzc2FnZUNvbXByZXNzb3IuanM/ZWQ2MCJdLCJzb3VyY2VzQ29udGVudCI6WyIndXNlIHN0cmljdCc7XHJcbnZhciBPYnNlcnZhYmxlPXJlcXVpcmUoJ29uaGFuZGxlcnMnKTtcclxuXHJcbnZhciBkYXRhTWFwPVtcclxuICB7XHJcbiAgICBoZWFkZXI6JysgbW9kdWxlJyxcclxuICAgIGF0dHJpYnV0ZXM6Wyd1bmlxdWUnLCduYW1lJywnZmVhdHVyZXMnXSxcclxuICB9LHtcclxuICAgIGhlYWRlcjonLSBtb2R1bGUnLFxyXG4gICAgYXR0cmlidXRlczpbJ3VuaXF1ZScsJ25hbWUnLCdmZWF0dXJlcyddLFxyXG4gIH0se1xyXG4gICAgaGVhZGVyOidzZWxlY3QgbW9kdWxlJyxcclxuICAgIGF0dHJpYnV0ZXM6WydvcmlnaW4nXSxcclxuICB9LHtcclxuICAgIGhlYWRlcjonZGVzZWxlY3QgbW9kdWxlJyxcclxuICAgIGF0dHJpYnV0ZXM6WydvcmlnaW4nXSxcclxuICB9LHtcclxuICAgIGhlYWRlcjonZm9jdXMgbW9kdWxlJyxcclxuICAgIGF0dHJpYnV0ZXM6WydvcmlnaW4nXSxcclxuICB9LHtcclxuICAgIGhlYWRlcjonZGVmb2N1cyBtb2R1bGUnLFxyXG4gICAgYXR0cmlidXRlczpbJ29yaWdpbiddLFxyXG4gIH0se1xyXG4gICAgaGVhZGVyOic+IG1lc3NhZ2UnLFxyXG4gICAgYXR0cmlidXRlczpbJ29yaWdpbicsJ2Rlc3RpbmF0aW9uJywndmFsJ10sXHJcbiAgfSx7XHJcbiAgICBoZWFkZXI6JysgY29ubmVjdGlvbicsXHJcbiAgICBhdHRyaWJ1dGVzOlsnb3JpZ2luJywnZGVzdGluYXRpb24nXSxcclxuICB9LHtcclxuICAgIGhlYWRlcjonLSBjb25uZWN0aW9uJyxcclxuICAgIGF0dHJpYnV0ZXM6WydvcmlnaW4nLCdkZXN0aW5hdGlvbiddLFxyXG4gIH1cclxuXVxyXG5cclxudmFyIGhlYWRlclRvRGF0YU1hcD17fTtcclxuXHJcbmZvcih2YXIgYSBpbiBkYXRhTWFwKXtcclxuICBoZWFkZXJUb0RhdGFNYXBbZGF0YU1hcFthXS5oZWFkZXJdID0gYTtcclxufVxyXG5cclxudmFyIE1lc3NhZ2VDb21wcmVzc29yPWZ1bmN0aW9uKHNvY2tldCl7XHJcbiAgdmFyIHNlbGY9dGhpcztcclxuICBPYnNlcnZhYmxlLmNhbGwodGhpcyk7XHJcblxyXG4gIHRoaXMuY29tcHJlc3M9ZnVuY3Rpb24ocmVhZGFibGVNZXNzYWdlKXtcclxuICAgIGNvbnNvbGUubG9nKFwiQ09NUFwiKTtcclxuICAgIHZhciBoZWFkZXI9cmVhZGFibGVNZXNzYWdlLnR5cGU7XHJcbiAgICB2YXIgaGVhZGVyTnVtYmVyPWhlYWRlclRvRGF0YU1hcFtoZWFkZXJdO1xyXG4gICAgdmFyIG1hcD1kYXRhTWFwW2hlYWRlck51bWJlcl07XHJcbiAgICB2YXIgcmV0PVtwYXJzZUludChoZWFkZXJOdW1iZXIpXTtcclxuICAgIGlmKCFkYXRhTWFwKXtcclxuICAgICAgY29uc29sZS5lcnJvcihcImRhdGEgc3RydWN0dXJlIG9mIHRoZSBtZXNzYWdlIGlzXCIsbWFwLHJlYWRhYmxlTWVzc2FnZSk7XHJcbiAgICB9XHJcbiAgICBpZihtYXAuYXR0cmlidXRlcyl7XHJcbiAgICAgIGZvcih2YXIgYSBvZiBtYXAuYXR0cmlidXRlcyl7XHJcbiAgICAgICAgcmV0LnB1c2gocmVhZGFibGVNZXNzYWdlW2FdKTtcclxuICAgICAgfVxyXG4gICAgfVxyXG4gICAgY29uc29sZS5sb2cocmVhZGFibGVNZXNzYWdlLFwiPVwiLHJldCk7XHJcbiAgICByZXR1cm4gcmV0O1xyXG4gIH1cclxuICB0aGlzLmRlY29tcHJlc3M9ZnVuY3Rpb24oY29tcHJlc3NlZE1lc3NhZ2Upe1xyXG4gICAgY29tcHJlc3NlZE1lc3NhZ2U9QXJyYXkuZnJvbShjb21wcmVzc2VkTWVzc2FnZSk7XHJcbiAgICBjb25zb2xlLmxvZyhcIkRFQ09NUFwiLGNvbXByZXNzZWRNZXNzYWdlKTtcclxuICAgIHZhciByZXQ9e31cclxuICAgIHZhciBoZWFkZXJOdW1iZXI9Y29tcHJlc3NlZE1lc3NhZ2Uuc2hpZnQoKTtcclxuICAgIHZhciBtYXA9ZGF0YU1hcFtoZWFkZXJOdW1iZXJdO1xyXG4gICAgdmFyIGhlYWRlcj1tYXAuaGVhZGVyO1xyXG4gICAgcmV0LnR5cGU9aGVhZGVyO1xyXG4gICAgZm9yKHZhciBhIGluIG1hcC5hdHRyaWJ1dGVzKXtcclxuICAgICAgcmV0W21hcC5hdHRyaWJ1dGVzW2FdXT1jb21wcmVzc2VkTWVzc2FnZVthXTtcclxuICAgIH1cclxuICAgIHJldHVybiByZXQ7XHJcbiAgfVxyXG5cclxufVxyXG5tb2R1bGUuZXhwb3J0cyA9IE1lc3NhZ2VDb21wcmVzc29yO1xuXG5cbi8vLy8vLy8vLy8vLy8vLy8vL1xuLy8gV0VCUEFDSyBGT09URVJcbi8vIC4uL3NoYXJlZC9NZXNzYWdlQ29tcHJlc3Nvci5qc1xuLy8gbW9kdWxlIGlkID0gMlxuLy8gbW9kdWxlIGNodW5rcyA9IDAiXSwibWFwcGluZ3MiOiJBQUFBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EiLCJzb3VyY2VSb290IjoiIn0=\n//# sourceURL=webpack-internal:///2\n");

/***/ }),
/* 3 */
/*!**************************************************************************************!*\
  !*** C:/Users/joaquin/repositories/js-virtualModular2/node_modules/onhandlers/on.js ***!
  \**************************************************************************************/
/*! no static exports found */
/*! all exports used */
/***/ (function(module, exports) {

eval("/*\r\nyou make the onHandlers.call(this) in the object that needs to have handlers.\r\nthen you can create a function callback for that object using object.on(\"handlerName.optionalName\",callbackFunction(){});\r\nthe object can run the handle callbacks by using this.handle(\"handlerName\",parametersToFeed);\r\n*/\r\nmodule.exports=function() {\r\n  var eventVerbose=false;\r\n  if (!this.ons) {\r\n    this.ons = [];\r\n  }\r\n  this.on = function(name, callback) {\r\n    var name = name.split(\".\");\r\n    if (typeof callback === 'function') {\r\n      if (name.length == 0) {\r\n        throw (\"sorry, you gave an invalid event name\");\r\n      } else if (name.length > 0) {\r\n        if (!this.ons[name[0]]) this.ons[name[0]] = [];\r\n        this.ons[name[0]].push([false, callback]);\r\n      }\r\n      // console.log(this.ons);\r\n    } else {\r\n      throw (\"error at mouse.on, provided callback that is not a function\");\r\n    }\r\n  }\r\n  this.off = function(name) {\r\n    var name = name.split(\".\");\r\n    if (name.length > 1) {\r\n      if (!this.ons[name[0]]) this.ons[name[0]] = [];\r\n      // console.log(\"prev\",this.ons[name[0]]);\r\n      this.ons[name[0]].splice(this.ons[name[0]].indexOf(name[1]), 1);\r\n      // console.log(\"then\",this.ons[name[0]]);\r\n    } else {\r\n      throw (\"sorry, you gave an invalid event name\" + name);\r\n    }\r\n  }\r\n  this.handle = function(fname, params) {\r\n    if(eventVerbose) console.log(\"Event \"+fname+\":\",{caller:this,params:params});\r\n    if (this.ons[fname]) {\r\n      for (var n in this.ons[fname]) {\r\n        // console.log(this.ons[fname][n][1]);\r\n        this.ons[fname][n][1](params);\r\n      }\r\n    }\r\n    if (this.ons['*']) {\r\n      for (var n in this.ons['*']) {\r\n        this.ons['*'][n][1]({name:fname,original:params});\r\n      }\r\n    }\r\n  }\r\n};//# sourceURL=[module]\n//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiMy5qcyIsInNvdXJjZXMiOlsid2VicGFjazovLy9DOi9Vc2Vycy9qb2FxdWluL3JlcG9zaXRvcmllcy9qcy12aXJ0dWFsTW9kdWxhcjIvbm9kZV9tb2R1bGVzL29uaGFuZGxlcnMvb24uanM/NjQ5YiJdLCJzb3VyY2VzQ29udGVudCI6WyIvKlxyXG55b3UgbWFrZSB0aGUgb25IYW5kbGVycy5jYWxsKHRoaXMpIGluIHRoZSBvYmplY3QgdGhhdCBuZWVkcyB0byBoYXZlIGhhbmRsZXJzLlxyXG50aGVuIHlvdSBjYW4gY3JlYXRlIGEgZnVuY3Rpb24gY2FsbGJhY2sgZm9yIHRoYXQgb2JqZWN0IHVzaW5nIG9iamVjdC5vbihcImhhbmRsZXJOYW1lLm9wdGlvbmFsTmFtZVwiLGNhbGxiYWNrRnVuY3Rpb24oKXt9KTtcclxudGhlIG9iamVjdCBjYW4gcnVuIHRoZSBoYW5kbGUgY2FsbGJhY2tzIGJ5IHVzaW5nIHRoaXMuaGFuZGxlKFwiaGFuZGxlck5hbWVcIixwYXJhbWV0ZXJzVG9GZWVkKTtcclxuKi9cclxubW9kdWxlLmV4cG9ydHM9ZnVuY3Rpb24oKSB7XHJcbiAgdmFyIGV2ZW50VmVyYm9zZT1mYWxzZTtcclxuICBpZiAoIXRoaXMub25zKSB7XHJcbiAgICB0aGlzLm9ucyA9IFtdO1xyXG4gIH1cclxuICB0aGlzLm9uID0gZnVuY3Rpb24obmFtZSwgY2FsbGJhY2spIHtcclxuICAgIHZhciBuYW1lID0gbmFtZS5zcGxpdChcIi5cIik7XHJcbiAgICBpZiAodHlwZW9mIGNhbGxiYWNrID09PSAnZnVuY3Rpb24nKSB7XHJcbiAgICAgIGlmIChuYW1lLmxlbmd0aCA9PSAwKSB7XHJcbiAgICAgICAgdGhyb3cgKFwic29ycnksIHlvdSBnYXZlIGFuIGludmFsaWQgZXZlbnQgbmFtZVwiKTtcclxuICAgICAgfSBlbHNlIGlmIChuYW1lLmxlbmd0aCA+IDApIHtcclxuICAgICAgICBpZiAoIXRoaXMub25zW25hbWVbMF1dKSB0aGlzLm9uc1tuYW1lWzBdXSA9IFtdO1xyXG4gICAgICAgIHRoaXMub25zW25hbWVbMF1dLnB1c2goW2ZhbHNlLCBjYWxsYmFja10pO1xyXG4gICAgICB9XHJcbiAgICAgIC8vIGNvbnNvbGUubG9nKHRoaXMub25zKTtcclxuICAgIH0gZWxzZSB7XHJcbiAgICAgIHRocm93IChcImVycm9yIGF0IG1vdXNlLm9uLCBwcm92aWRlZCBjYWxsYmFjayB0aGF0IGlzIG5vdCBhIGZ1bmN0aW9uXCIpO1xyXG4gICAgfVxyXG4gIH1cclxuICB0aGlzLm9mZiA9IGZ1bmN0aW9uKG5hbWUpIHtcclxuICAgIHZhciBuYW1lID0gbmFtZS5zcGxpdChcIi5cIik7XHJcbiAgICBpZiAobmFtZS5sZW5ndGggPiAxKSB7XHJcbiAgICAgIGlmICghdGhpcy5vbnNbbmFtZVswXV0pIHRoaXMub25zW25hbWVbMF1dID0gW107XHJcbiAgICAgIC8vIGNvbnNvbGUubG9nKFwicHJldlwiLHRoaXMub25zW25hbWVbMF1dKTtcclxuICAgICAgdGhpcy5vbnNbbmFtZVswXV0uc3BsaWNlKHRoaXMub25zW25hbWVbMF1dLmluZGV4T2YobmFtZVsxXSksIDEpO1xyXG4gICAgICAvLyBjb25zb2xlLmxvZyhcInRoZW5cIix0aGlzLm9uc1tuYW1lWzBdXSk7XHJcbiAgICB9IGVsc2Uge1xyXG4gICAgICB0aHJvdyAoXCJzb3JyeSwgeW91IGdhdmUgYW4gaW52YWxpZCBldmVudCBuYW1lXCIgKyBuYW1lKTtcclxuICAgIH1cclxuICB9XHJcbiAgdGhpcy5oYW5kbGUgPSBmdW5jdGlvbihmbmFtZSwgcGFyYW1zKSB7XHJcbiAgICBpZihldmVudFZlcmJvc2UpIGNvbnNvbGUubG9nKFwiRXZlbnQgXCIrZm5hbWUrXCI6XCIse2NhbGxlcjp0aGlzLHBhcmFtczpwYXJhbXN9KTtcclxuICAgIGlmICh0aGlzLm9uc1tmbmFtZV0pIHtcclxuICAgICAgZm9yICh2YXIgbiBpbiB0aGlzLm9uc1tmbmFtZV0pIHtcclxuICAgICAgICAvLyBjb25zb2xlLmxvZyh0aGlzLm9uc1tmbmFtZV1bbl1bMV0pO1xyXG4gICAgICAgIHRoaXMub25zW2ZuYW1lXVtuXVsxXShwYXJhbXMpO1xyXG4gICAgICB9XHJcbiAgICB9XHJcbiAgICBpZiAodGhpcy5vbnNbJyonXSkge1xyXG4gICAgICBmb3IgKHZhciBuIGluIHRoaXMub25zWycqJ10pIHtcclxuICAgICAgICB0aGlzLm9uc1snKiddW25dWzFdKHtuYW1lOmZuYW1lLG9yaWdpbmFsOnBhcmFtc30pO1xyXG4gICAgICB9XHJcbiAgICB9XHJcbiAgfVxyXG59O1xuXG5cbi8vLy8vLy8vLy8vLy8vLy8vL1xuLy8gV0VCUEFDSyBGT09URVJcbi8vIEM6L1VzZXJzL2pvYXF1aW4vcmVwb3NpdG9yaWVzL2pzLXZpcnR1YWxNb2R1bGFyMi9ub2RlX21vZHVsZXMvb25oYW5kbGVycy9vbi5qc1xuLy8gbW9kdWxlIGlkID0gM1xuLy8gbW9kdWxlIGNodW5rcyA9IDAiXSwibWFwcGluZ3MiOiJBQUFBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EiLCJzb3VyY2VSb290IjoiIn0=\n//# sourceURL=webpack-internal:///3\n");

/***/ })
/******/ ]);