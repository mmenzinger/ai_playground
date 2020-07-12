var LIB=function(e){var t={};function n(r){if(t[r])return t[r].exports;var o=t[r]={i:r,l:!1,exports:{}};return e[r].call(o.exports,o,o.exports,n),o.l=!0,o.exports}return n.m=e,n.c=t,n.d=function(e,t,r){n.o(e,t)||Object.defineProperty(e,t,{enumerable:!0,get:r})},n.r=function(e){"undefined"!=typeof Symbol&&Symbol.toStringTag&&Object.defineProperty(e,Symbol.toStringTag,{value:"Module"}),Object.defineProperty(e,"__esModule",{value:!0})},n.t=function(e,t){if(1&t&&(e=n(e)),8&t)return e;if(4&t&&"object"==typeof e&&e&&e.__esModule)return e;var r=Object.create(null);if(n.r(r),Object.defineProperty(r,"default",{enumerable:!0,value:e}),2&t&&"string"!=typeof e)for(var o in e)n.d(r,o,function(t){return e[t]}.bind(null,o));return r},n.n=function(e){var t=e&&e.__esModule?function(){return e.default}:function(){return e};return n.d(t,"a",t),t},n.o=function(e,t){return Object.prototype.hasOwnProperty.call(e,t)},n.p="",n(n.s=67)}({21:function(e,t,n){"use strict";n.d(t,"d",(function(){return _})),n.d(t,"a",(function(){return s})),n.d(t,"e",(function(){return f})),n.d(t,"b",(function(){return d})),n.d(t,"c",(function(){return p})),n.d(t,"f",(function(){return g}));var r=n(39),o=n.n(r);function a(e,t){if(!Object.prototype.hasOwnProperty.call(e,t))throw new TypeError("attempted to use private field on non-instance");return e}var i=0;function c(e){return"__private_"+i+++"_"+e}async function _(e,t=null,n=self,r=[]){return new Promise((o,a)=>{let i;t&&(i=setTimeout(()=>{a(Error(`message timeout: ${e}`))},t));const c=new MessageChannel;c.port1.onmessage=e=>{clearTimeout(i),e.data&&e.data.result?o(e.data.result):o(void 0)},n.postMessage(e,[c.port2,...r])})}class s{constructor(){Object.defineProperty(this,u,{writable:!0,value:void 0}),Object.defineProperty(this,l,{writable:!0,value:void 0}),this.promise=void 0,this.resolved=!1,this.value=void 0,this.promise=new Promise((e,t)=>{a(this,u)[u]=e,a(this,l)[l]=t})}resolve(e){return this.resolved=!0,this.value=e,a(this,u)[u](e),e}reject(e){this.resolved=!0,a(this,l)[l](e)}}var u=c("resolve"),l=c("reject");function f(e){return o()(e,{replacer:function(e,t){return t instanceof Error?{type:"__ERROR__",message:t.message,stack:t.stack}:t instanceof Function?{type:"__FUNCTION__",name:t.name}:t instanceof Map?{type:"__MAP__",data:[...t]}:t instanceof Set?{type:"__SET__",data:[...t]}:t instanceof Date||"string"==typeof t&&/^\d{4}-[01]\d-[0-3]\dT[012]\d:[0-5]\d:[0-5]\d\.\d{3}Z$/.test(t)?{type:"__DATE__",timestamp:+new Date(t)}:t instanceof Uint8Array?{type:"__Uint8Array__",data:Array.from(t)}:void 0===t?"__UNDEFINED__":t===Number.POSITIVE_INFINITY?"__+INFINITY__":t===Number.NEGATIVE_INFINITY?"__-INFINITY__":Number.isNaN(t)?"__NAN__":t}})}function d(e){return function e(t,n){if(t instanceof Object)for(const[r,o]of Object.entries(t))t[r]=e(o,n);return n(t)}(JSON.parse(e,(function(e,t){if(t instanceof Object){if("__ERROR__"===t.type){const e=Error(t.message);return e.stack=t.stack,e}if("__FUNCTION__"===t.type){const n=self[t.name];return n instanceof Function?n:void console.warn(`Skipped ${e}: Only global functions can be deserialized!`)}if("__MAP__"===t.type)return new Map(t.data);if("__SET__"===t.type)return new Set(t.data);if("__DATE__"===t.type)return new Date(t.timestamp);if("__Uint8Array__"===t.type)return new Uint8Array(t.data)}return"__+INFINITY__"===t?Number.POSITIVE_INFINITY:"__-INFINITY__"===t?Number.NEGATIVE_INFINITY:"__NAN__"===t?NaN:t})),e=>{if("__UNDEFINED__"!==e)return e})}function p(e,t=window){const n=n=>{const r=e.getBoundingClientRect(),o={bubbles:n.bubbles,cancelable:n.cancelable,clientX:n.clientX+r.x,clientY:n.clientY+r.y,pageX:n.pageX+r.x,pageY:n.pageY+r.y,x:n.x+r.x,y:n.y+r.y,offsetX:n.offsetX+r.x,offsetY:n.offsetY+r.y};t.dispatchEvent(new MouseEvent(n.type,o))},r=e=>{t.dispatchEvent(new KeyboardEvent(e.type,e))},o=e.contentWindow;if(!o)throw new x("iframe has no contentWindow");o.onmousedown=n,o.onmousemove=n,o.onmouseup=n,o.onkeydown=r,o.onkeypress=r,o.onkeyup=r}function g(){throw new x("Something went terribly wrong. This should never be called!")}class x extends Error{}},24:function(e,t){e.exports=function(){throw new Error("define cannot be used indirect")}},37:function(e,t,n){"use strict";n.d(t,"a",(function(){return r}));n(21);let r,o;!function(e){e[e.LOG=0]="LOG",e[e.JSON_STORE=1]="JSON_STORE",e[e.CALL=2]="CALL",e[e.EVENT=3]="EVENT",e[e.HTML=4]="HTML",e[e.VIDEO=5]="VIDEO"}(r||(r={})),function(e){e[e.RUN=0]="RUN",e[e.TRAIN=1]="TRAIN"}(o||(o={}))},39:function(e,t,n){"use strict";var r=/("(?:[^\\"]|\\.)*")|[:,]/g;e.exports=function(e,t){var n,o,a;return t=t||{},n=JSON.stringify([1],void 0,void 0===t.indent?2:t.indent).slice(2,-3),o=""===n?1/0:void 0===t.maxLength?80:t.maxLength,a=t.replacer,function e(t,i,c){var _,s,u,l,f,d,p,g,x,h,w,v;if(t&&"function"==typeof t.toJSON&&(t=t.toJSON()),void 0===(w=JSON.stringify(t,a)))return w;if(p=o-i.length-c,w.length<=p&&(x=w.replace(r,(function(e,t){return t||e+" "}))).length<=p)return x;if(null!=a&&(t=JSON.parse(w),a=void 0),"object"==typeof t&&null!==t){if(g=i+n,u=[],s=0,Array.isArray(t))for(h="[",_="]",p=t.length;s<p;s++)u.push(e(t[s],g,s===p-1?0:1)||"null");else for(h="{",_="}",p=(d=Object.keys(t)).length;s<p;s++)l=d[s],f=JSON.stringify(l)+": ",void 0!==(v=e(t[l],g,f.length+(s===p-1?0:1)))&&u.push(f+v);if(u.length>0)return[h,n+u.join(",\n"+g),_].join("\n"+i)}return w}(e,"",0)}},41:function(e,t){e.exports=function(e){return e.webpackPolyfill||(e.deprecate=function(){},e.paths=[],e.children||(e.children=[]),Object.defineProperty(e,"loaded",{enumerable:!0,get:function(){return e.l}}),Object.defineProperty(e,"id",{enumerable:!0,get:function(){return e.i}}),e.webpackPolyfill=1),e}},42:function(e,t){(function(t){e.exports=t}).call(this,{})},67:function(module,__webpack_exports__,__webpack_require__){"use strict";__webpack_require__.r(__webpack_exports__),__webpack_require__.d(__webpack_exports__,"seedRandom",(function(){return seedRandom})),__webpack_require__.d(__webpack_exports__,"includeUrl",(function(){return includeUrl})),__webpack_require__.d(__webpack_exports__,"storeJson",(function(){return storeJson})),__webpack_require__.d(__webpack_exports__,"loadJson",(function(){return loadJson})),__webpack_require__.d(__webpack_exports__,"getFileContent",(function(){return getFileContent})),__webpack_require__.d(__webpack_exports__,"fixPath",(function(){return fixPath})),__webpack_require__.d(__webpack_exports__,"initLocalStorage",(function(){return initLocalStorage})),__webpack_require__.d(__webpack_exports__,"localStorage",(function(){return localStorage})),__webpack_require__.d(__webpack_exports__,"console",(function(){return console})),__webpack_require__.d(__webpack_exports__,"getCanvas",(function(){return getCanvas})),__webpack_require__.d(__webpack_exports__,"sleep",(function(){return sleep})),__webpack_require__.d(__webpack_exports__,"setMessages",(function(){return setMessages})),__webpack_require__.d(__webpack_exports__,"addMessage",(function(){return addMessage})),__webpack_require__.d(__webpack_exports__,"loadImages",(function(){return loadImages})),__webpack_require__.d(__webpack_exports__,"getImage",(function(){return getImage})),__webpack_require__.d(__webpack_exports__,"onVideoFrameUpdate",(function(){return onVideoFrameUpdate}));var _util__WEBPACK_IMPORTED_MODULE_0__=__webpack_require__(21),_worker_types__WEBPACK_IMPORTED_MODULE_1__=__webpack_require__(37),seedrandom__WEBPACK_IMPORTED_MODULE_2__=__webpack_require__(68),seedrandom__WEBPACK_IMPORTED_MODULE_2___default=__webpack_require__.n(seedrandom__WEBPACK_IMPORTED_MODULE_2__);function seedRandom(e){return seedrandom__WEBPACK_IMPORTED_MODULE_2___default()(e)}async function includeUrl(url,context={},parse=(e=>e)){const body=await fetch(url),content=parse(await body.text());function evalInContext(){eval(`${content}`)}return evalInContext.call(context),context}async function storeJson(e,t){const n=(e=fixPath(e,".json")).match(/\/?([^\/]+)\/([^\/]+$)/);if(n){const e=Object(_util__WEBPACK_IMPORTED_MODULE_0__.e)(t),r="global"===n[1]?0:void 0,o={type:_worker_types__WEBPACK_IMPORTED_MODULE_1__.a.JSON_STORE,projectId:r,fileName:n[2],json:e};await Object(_util__WEBPACK_IMPORTED_MODULE_0__.d)(o,1e3).catch(e=>{throw Error(`could not store file ${n[2]}`)})}}async function loadJson(e){e=fixPath(e,".json");const t=await getFileContent(e);return Object(_util__WEBPACK_IMPORTED_MODULE_0__.b)(t)}async function getFileContent(e){e=fixPath(e);const t=await fetch(e);if(200!==t.status)throw Error(`could not open file '${e}'`);return await t.text()}function fixPath(e,t=""){return/^\//.test(e)||(e="/"+e),/^\/(project|global)\//.test(e)||(e="/project"+e),e.endsWith(t)||(e+=t),e}let localStorageCache;async function initLocalStorage(){try{localStorageCache=new Map(await loadJson("localstorage"))}catch(e){localStorageCache=new Map}}function saveLocalStorage(){storeJson("localstorage",localStorageCache)}const localStorage={get length(){return localStorageCache.size},key:e=>e<0||e>=localStorageCache.size?null:Array.from(localStorageCache.keys())[e],setItem(e,t){localStorageCache.set(e,t),saveLocalStorage()},getItem:e=>localStorageCache.has(e)?localStorageCache.get(e):null,removeItem(e){localStorageCache.delete(e)&&saveLocalStorage()},clear(){localStorageCache.clear(),saveLocalStorage()}},console=__console;function getCanvas(){return self.__canvas}async function sleep(e){return new Promise((t,n)=>{setTimeout(t,e)})}async function setMessages(e){const t={type:_worker_types__WEBPACK_IMPORTED_MODULE_1__.a.HTML,action:"set",html:e};await Object(_util__WEBPACK_IMPORTED_MODULE_0__.d)(t)}async function addMessage(e){const t={type:_worker_types__WEBPACK_IMPORTED_MODULE_1__.a.HTML,action:"add",html:e};await Object(_util__WEBPACK_IMPORTED_MODULE_0__.d)(t)}let images=new Map;async function loadImages(e){const t=await Promise.all(e.map(async e=>{const t=e.match(/\/([^\/]+)\.(png|jpeg)$/);let n=e;return t&&t.length>1&&(n=t[1]),{name:n,bitmap:await createImageBitmap(await fetch(e).then(e=>e.blob()))}}));for(const e of t)images.set(e.name,e.bitmap)}function getImage(e){return images.get(e)}function onVideoFrameUpdate(e){self.__onVideoFrameUpdate=e}},68:function(e,t,n){var r=n(78),o=n(79),a=n(80),i=n(81),c=n(82),_=n(83),s=n(84);s.alea=r,s.xor128=o,s.xorwow=a,s.xorshift7=i,s.xor4096=c,s.tychei=_,e.exports=s},78:function(e,t,n){(function(e){var r;!function(e,o,a){function i(e){var t,n=this,r=(t=4022871197,function(e){e=String(e);for(var n=0;n<e.length;n++){var r=.02519603282416938*(t+=e.charCodeAt(n));r-=t=r>>>0,t=(r*=t)>>>0,t+=4294967296*(r-=t)}return 2.3283064365386963e-10*(t>>>0)});n.next=function(){var e=2091639*n.s0+2.3283064365386963e-10*n.c;return n.s0=n.s1,n.s1=n.s2,n.s2=e-(n.c=0|e)},n.c=1,n.s0=r(" "),n.s1=r(" "),n.s2=r(" "),n.s0-=r(e),n.s0<0&&(n.s0+=1),n.s1-=r(e),n.s1<0&&(n.s1+=1),n.s2-=r(e),n.s2<0&&(n.s2+=1),r=null}function c(e,t){return t.c=e.c,t.s0=e.s0,t.s1=e.s1,t.s2=e.s2,t}function _(e,t){var n=new i(e),r=t&&t.state,o=n.next;return o.int32=function(){return 4294967296*n.next()|0},o.double=function(){return o()+11102230246251565e-32*(2097152*o()|0)},o.quick=o,r&&("object"==typeof r&&c(r,n),o.state=function(){return c(n,{})}),o}o&&o.exports?o.exports=_:n(24)&&n(42)?void 0===(r=function(){return _}.call(t,n,t,o))||(o.exports=r):this.alea=_}(0,e,n(24))}).call(this,n(41)(e))},79:function(e,t,n){(function(e){var r;!function(e,o,a){function i(e){var t=this,n="";t.x=0,t.y=0,t.z=0,t.w=0,t.next=function(){var e=t.x^t.x<<11;return t.x=t.y,t.y=t.z,t.z=t.w,t.w^=t.w>>>19^e^e>>>8},e===(0|e)?t.x=e:n+=e;for(var r=0;r<n.length+64;r++)t.x^=0|n.charCodeAt(r),t.next()}function c(e,t){return t.x=e.x,t.y=e.y,t.z=e.z,t.w=e.w,t}function _(e,t){var n=new i(e),r=t&&t.state,o=function(){return(n.next()>>>0)/4294967296};return o.double=function(){do{var e=((n.next()>>>11)+(n.next()>>>0)/4294967296)/(1<<21)}while(0===e);return e},o.int32=n.next,o.quick=o,r&&("object"==typeof r&&c(r,n),o.state=function(){return c(n,{})}),o}o&&o.exports?o.exports=_:n(24)&&n(42)?void 0===(r=function(){return _}.call(t,n,t,o))||(o.exports=r):this.xor128=_}(0,e,n(24))}).call(this,n(41)(e))},80:function(e,t,n){(function(e){var r;!function(e,o,a){function i(e){var t=this,n="";t.next=function(){var e=t.x^t.x>>>2;return t.x=t.y,t.y=t.z,t.z=t.w,t.w=t.v,(t.d=t.d+362437|0)+(t.v=t.v^t.v<<4^e^e<<1)|0},t.x=0,t.y=0,t.z=0,t.w=0,t.v=0,e===(0|e)?t.x=e:n+=e;for(var r=0;r<n.length+64;r++)t.x^=0|n.charCodeAt(r),r==n.length&&(t.d=t.x<<10^t.x>>>4),t.next()}function c(e,t){return t.x=e.x,t.y=e.y,t.z=e.z,t.w=e.w,t.v=e.v,t.d=e.d,t}function _(e,t){var n=new i(e),r=t&&t.state,o=function(){return(n.next()>>>0)/4294967296};return o.double=function(){do{var e=((n.next()>>>11)+(n.next()>>>0)/4294967296)/(1<<21)}while(0===e);return e},o.int32=n.next,o.quick=o,r&&("object"==typeof r&&c(r,n),o.state=function(){return c(n,{})}),o}o&&o.exports?o.exports=_:n(24)&&n(42)?void 0===(r=function(){return _}.call(t,n,t,o))||(o.exports=r):this.xorwow=_}(0,e,n(24))}).call(this,n(41)(e))},81:function(e,t,n){(function(e){var r;!function(e,o,a){function i(e){var t=this;t.next=function(){var e,n,r=t.x,o=t.i;return e=r[o],n=(e^=e>>>7)^e<<24,n^=(e=r[o+1&7])^e>>>10,n^=(e=r[o+3&7])^e>>>3,n^=(e=r[o+4&7])^e<<7,e=r[o+7&7],n^=(e^=e<<13)^e<<9,r[o]=n,t.i=o+1&7,n},function(e,t){var n,r=[];if(t===(0|t))r[0]=t;else for(t=""+t,n=0;n<t.length;++n)r[7&n]=r[7&n]<<15^t.charCodeAt(n)+r[n+1&7]<<13;for(;r.length<8;)r.push(0);for(n=0;n<8&&0===r[n];++n);for(8==n?r[7]=-1:r[n],e.x=r,e.i=0,n=256;n>0;--n)e.next()}(t,e)}function c(e,t){return t.x=e.x.slice(),t.i=e.i,t}function _(e,t){null==e&&(e=+new Date);var n=new i(e),r=t&&t.state,o=function(){return(n.next()>>>0)/4294967296};return o.double=function(){do{var e=((n.next()>>>11)+(n.next()>>>0)/4294967296)/(1<<21)}while(0===e);return e},o.int32=n.next,o.quick=o,r&&(r.x&&c(r,n),o.state=function(){return c(n,{})}),o}o&&o.exports?o.exports=_:n(24)&&n(42)?void 0===(r=function(){return _}.call(t,n,t,o))||(o.exports=r):this.xorshift7=_}(0,e,n(24))}).call(this,n(41)(e))},82:function(e,t,n){(function(e){var r;!function(e,o,a){function i(e){var t=this;t.next=function(){var e,n,r=t.w,o=t.X,a=t.i;return t.w=r=r+1640531527|0,n=o[a+34&127],e=o[a=a+1&127],n^=n<<13,e^=e<<17,n^=n>>>15,e^=e>>>12,n=o[a]=n^e,t.i=a,n+(r^r>>>16)|0},function(e,t){var n,r,o,a,i,c=[],_=128;for(t===(0|t)?(r=t,t=null):(t+="\0",r=0,_=Math.max(_,t.length)),o=0,a=-32;a<_;++a)t&&(r^=t.charCodeAt((a+32)%t.length)),0===a&&(i=r),r^=r<<10,r^=r>>>15,r^=r<<4,r^=r>>>13,a>=0&&(i=i+1640531527|0,o=0==(n=c[127&a]^=r+i)?o+1:0);for(o>=128&&(c[127&(t&&t.length||0)]=-1),o=127,a=512;a>0;--a)r=c[o+34&127],n=c[o=o+1&127],r^=r<<13,n^=n<<17,r^=r>>>15,n^=n>>>12,c[o]=r^n;e.w=i,e.X=c,e.i=o}(t,e)}function c(e,t){return t.i=e.i,t.w=e.w,t.X=e.X.slice(),t}function _(e,t){null==e&&(e=+new Date);var n=new i(e),r=t&&t.state,o=function(){return(n.next()>>>0)/4294967296};return o.double=function(){do{var e=((n.next()>>>11)+(n.next()>>>0)/4294967296)/(1<<21)}while(0===e);return e},o.int32=n.next,o.quick=o,r&&(r.X&&c(r,n),o.state=function(){return c(n,{})}),o}o&&o.exports?o.exports=_:n(24)&&n(42)?void 0===(r=function(){return _}.call(t,n,t,o))||(o.exports=r):this.xor4096=_}(0,e,n(24))}).call(this,n(41)(e))},83:function(e,t,n){(function(e){var r;!function(e,o,a){function i(e){var t=this,n="";t.next=function(){var e=t.b,n=t.c,r=t.d,o=t.a;return e=e<<25^e>>>7^n,n=n-r|0,r=r<<24^r>>>8^o,o=o-e|0,t.b=e=e<<20^e>>>12^n,t.c=n=n-r|0,t.d=r<<16^n>>>16^o,t.a=o-e|0},t.a=0,t.b=0,t.c=-1640531527,t.d=1367130551,e===Math.floor(e)?(t.a=e/4294967296|0,t.b=0|e):n+=e;for(var r=0;r<n.length+20;r++)t.b^=0|n.charCodeAt(r),t.next()}function c(e,t){return t.a=e.a,t.b=e.b,t.c=e.c,t.d=e.d,t}function _(e,t){var n=new i(e),r=t&&t.state,o=function(){return(n.next()>>>0)/4294967296};return o.double=function(){do{var e=((n.next()>>>11)+(n.next()>>>0)/4294967296)/(1<<21)}while(0===e);return e},o.int32=n.next,o.quick=o,r&&("object"==typeof r&&c(r,n),o.state=function(){return c(n,{})}),o}o&&o.exports?o.exports=_:n(24)&&n(42)?void 0===(r=function(){return _}.call(t,n,t,o))||(o.exports=r):this.tychei=_}(0,e,n(24))}).call(this,n(41)(e))},84:function(e,t,n){var r;!function(o,a,i){var c,_=i.pow(256,6),s=i.pow(2,52),u=2*s;function l(e,t,n){var r=[],l=p(function e(t,n){var r,o=[],a=typeof t;if(n&&"object"==a)for(r in t)try{o.push(e(t[r],n-1))}catch(e){}return o.length?o:"string"==a?t:t+"\0"}((t=1==t?{entropy:!0}:t||{}).entropy?[e,g(a)]:null==e?function(){try{var e;return c&&(e=c.randomBytes)?e=e(256):(e=new Uint8Array(256),(o.crypto||o.msCrypto).getRandomValues(e)),g(e)}catch(e){var t=o.navigator,n=t&&t.plugins;return[+new Date,o,n,o.screen,g(a)]}}():e,3),r),x=new f(r),h=function(){for(var e=x.g(6),t=_,n=0;e<s;)e=256*(e+n),t*=256,n=x.g(1);for(;e>=u;)e/=2,t/=2,n>>>=1;return(e+n)/t};return h.int32=function(){return 0|x.g(4)},h.quick=function(){return x.g(4)/4294967296},h.double=h,p(g(x.S),a),(t.pass||n||function(e,t,n,r){return r&&(r.S&&d(r,x),e.state=function(){return d(x,{})}),n?(i.random=e,t):e})(h,l,"global"in t?t.global:this==i,t.state)}function f(e){var t,n=e.length,r=this,o=0,a=r.i=r.j=0,i=r.S=[];for(n||(e=[n++]);o<256;)i[o]=o++;for(o=0;o<256;o++)i[o]=i[a=255&a+e[o%n]+(t=i[o])],i[a]=t;(r.g=function(e){for(var t,n=0,o=r.i,a=r.j,i=r.S;e--;)t=i[o=255&o+1],n=256*n+i[255&(i[o]=i[a=255&a+t])+(i[a]=t)];return r.i=o,r.j=a,n})(256)}function d(e,t){return t.i=e.i,t.j=e.j,t.S=e.S.slice(),t}function p(e,t){for(var n,r=e+"",o=0;o<r.length;)t[255&o]=255&(n^=19*t[255&o])+r.charCodeAt(o++);return g(t)}function g(e){return String.fromCharCode.apply(0,e)}if(p(i.random(),a),e.exports){e.exports=l;try{c=n(85)}catch(e){}}else void 0===(r=function(){return l}.call(t,n,t,e))||(e.exports=r)}("undefined"!=typeof self?self:this,[],Math)},85:function(e,t){}});const _LIB$seedRandom=LIB.seedRandom,_LIB$includeUrl=LIB.includeUrl,_LIB$storeJson=LIB.storeJson,_LIB$loadJson=LIB.loadJson,_LIB$getFileContent=LIB.getFileContent,_LIB$fixPath=LIB.fixPath,_LIB$initLocalStorage=LIB.initLocalStorage,_LIB$localStorage=LIB.localStorage,_LIB$console=LIB.console,_LIB$getCanvas=LIB.getCanvas,_LIB$sleep=LIB.sleep,_LIB$setMessages=LIB.setMessages,_LIB$addMessage=LIB.addMessage,_LIB$loadImages=LIB.loadImages,_LIB$getImage=LIB.getImage,_LIB$onVideoFrameUpdate=LIB.onVideoFrameUpdate;export{_LIB$seedRandom as seedRandom,_LIB$includeUrl as includeUrl,_LIB$storeJson as storeJson,_LIB$loadJson as loadJson,_LIB$getFileContent as getFileContent,_LIB$fixPath as fixPath,_LIB$initLocalStorage as initLocalStorage,_LIB$localStorage as localStorage,_LIB$console as console,_LIB$getCanvas as getCanvas,_LIB$sleep as sleep,_LIB$setMessages as setMessages,_LIB$addMessage as addMessage,_LIB$loadImages as loadImages,_LIB$getImage as getImage,_LIB$onVideoFrameUpdate as onVideoFrameUpdate};