var t="object"==typeof global&&global&&global.Object===Object&&global,e="object"==typeof self&&self&&self.Object===Object&&self,n=t||e||Function("return this")(),o=n.Symbol,r=Object.prototype,s=r.hasOwnProperty,i=r.toString,a=o?o.toStringTag:void 0;var u=Object.prototype.toString;var l="[object Null]",c="[object Undefined]",f=o?o.toStringTag:void 0;function p(t){return null==t?void 0===t?c:l:f&&f in Object(t)?function(t){var e=s.call(t,a),n=t[a];try{t[a]=void 0;var o=!0}catch(t){}var r=i.call(t);return o&&(e?t[a]=n:delete t[a]),r}(t):function(t){return u.call(t)}(t)}var m="[object Symbol]";var g=/\s/;var d=/^\s+/;function v(t){return t?t.slice(0,function(t){for(var e=t.length;e--&&g.test(t.charAt(e)););return e}(t)+1).replace(d,""):t}function h(t){var e=typeof t;return null!=t&&("object"==e||"function"==e)}var w=NaN,y=/^[-+]0x[0-9a-f]+$/i,b=/^0b[01]+$/i,M=/^0o[0-7]+$/i,k=parseInt;function j(t){if("number"==typeof t)return t;if(function(t){return"symbol"==typeof t||function(t){return null!=t&&"object"==typeof t}(t)&&p(t)==m}(t))return w;if(h(t)){var e="function"==typeof t.valueOf?t.valueOf():t;t=h(e)?e+"":e}if("string"!=typeof t)return 0===t?t:+t;t=v(t);var n=b.test(t);return n||M.test(t)?k(t.slice(2),n?2:8):y.test(t)?w:+t}var T=function(){return n.Date.now()},O="Expected a function",E=Math.max,x=Math.min;function W(t,e,n){var o,r,s,i,a,u,l=0,c=!1,f=!1,p=!0;if("function"!=typeof t)throw new TypeError(O);function m(e){var n=o,s=r;return o=r=void 0,l=e,i=t.apply(s,n)}function g(t){var n=t-u;return void 0===u||n>=e||n<0||f&&t-l>=s}function d(){var t=T();if(g(t))return v(t);a=setTimeout(d,function(t){var n=e-(t-u);return f?x(n,s-(t-l)):n}(t))}function v(t){return a=void 0,p&&o?m(t):(o=r=void 0,i)}function w(){var t=T(),n=g(t);if(o=arguments,r=this,u=t,n){if(void 0===a)return function(t){return l=t,a=setTimeout(d,e),c?m(t):i}(u);if(f)return clearTimeout(a),a=setTimeout(d,e),m(u)}return void 0===a&&(a=setTimeout(d,e)),i}return e=j(e)||0,h(n)&&(c=!!n.leading,s=(f="maxWait"in n)?E(j(n.maxWait)||0,e):s,p="trailing"in n?!!n.trailing:p),w.cancel=function(){void 0!==a&&clearTimeout(a),l=0,o=u=r=a=void 0},w.flush=function(){return void 0===a?i:v(T())},w}class P{#t=null;#e=null;#n={log:t=>{window.__port?.postMessage(t.data)},store:t=>{(async function(t,e=null,n=self,o=[]){return new Promise(((r,s)=>{let i;e&&(i=setTimeout((()=>{s(Error(`message timeout: ${t}`))}),e));const a=new MessageChannel;a.port1.onmessage=t=>{clearTimeout(i),r(t.data)},n.postMessage(t,[a.port2,...o])}))})(t.data,1e3,window.__port).then((()=>{t.ports[0].postMessage(!0)}))}};#o={onmousedown:!1,onmouseup:!1,onmousemove:!1};constructor(t){this.#o={...this.#o,...t}}async start(t){return new Promise(((e,n)=>{const o=document.createElement("canvas");t.innerHTML="",t.appendChild(o),o.width=t.offsetWidth,o.height=t.offsetHeight;const r=o.transferControlToOffscreen();this.#o.onmousedown&&(o.onmousedown=t=>this.#r(t,o,"onmousedown")),this.#o.onmouseup&&(o.onmouseup=t=>this.#r(t,o,"onmouseup")),this.#o.onmousemove&&(o.onmousemove=function(t,e,n){var o=!0,r=!0;if("function"!=typeof t)throw new TypeError("Expected a function");return h(n)&&(o="leading"in n?!!n.leading:o,r="trailing"in n?!!n.trailing:r),W(t,e,{leading:o,maxWait:e,trailing:r})}((t=>this.#r(t,o,"onmousemove")),100)),this.#t&&this.#t.terminate();const s=new MessageChannel;this.#t=new Worker("/simulator/scenario-worker.js",{type:"module"}),s.port1.onmessage=t=>{"ready"===t.data.type&&(this.#e=t.ports[0],t.ports[0].onmessage=t=>{const e=t.data.type;this.#n[e]&&this.#n[e](t)},e())},this.#t.postMessage({type:"setup",canvas:r},[s.port2,r]),window.__port?.postMessage({type:"log",logs:[]})}))}async call(t,e,...n){return new Promise(((o,r)=>{const s=new MessageChannel;s.port1.onmessage=t=>{o(t.data)},this.#e?.postMessage({type:"call",file:t,functionName:e,args:n},[s.port2])}))}terminate(){this.#t?.terminate(),this.#t=null}#r(t,e,n){var o=e.getBoundingClientRect(),r=t.clientX-o.left,s=t.clientY-o.top;this.#e?.postMessage({type:n,x:r,y:s,width:o.width,height:o.height,button:t.button,altKey:t.altKey,ctrlKey:t.ctrlKey,timeStamp:t.timeStamp})}}export{P as ScenarioWorker};
