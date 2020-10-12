/*! For license information please see 16.js.LICENSE.txt */
(window.webpackJsonpLIB=window.webpackJsonpLIB||[]).push([[16],{442:function(e,t,o){var r,n=function(){var e=String.fromCharCode,t="ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=",o="ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+-$",r={};function n(e,t){if(!r[e]){r[e]={};for(var o=0;o<e.length;o++)r[e][e.charAt(o)]=o}return r[e][t]}var s={compressToBase64:function(e){if(null==e)return"";var o=s._compress(e,6,(function(e){return t.charAt(e)}));switch(o.length%4){default:case 0:return o;case 1:return o+"===";case 2:return o+"==";case 3:return o+"="}},decompressFromBase64:function(e){return null==e?"":""==e?null:s._decompress(e.length,32,(function(o){return n(t,e.charAt(o))}))},compressToUTF16:function(t){return null==t?"":s._compress(t,15,(function(t){return e(t+32)}))+" "},decompressFromUTF16:function(e){return null==e?"":""==e?null:s._decompress(e.length,16384,(function(t){return e.charCodeAt(t)-32}))},compressToUint8Array:function(e){for(var t=s.compress(e),o=new Uint8Array(2*t.length),r=0,n=t.length;r<n;r++){var i=t.charCodeAt(r);o[2*r]=i>>>8,o[2*r+1]=i%256}return o},decompressFromUint8Array:function(t){if(null==t)return s.decompress(t);for(var o=new Array(t.length/2),r=0,n=o.length;r<n;r++)o[r]=256*t[2*r]+t[2*r+1];var i=[];return o.forEach((function(t){i.push(e(t))})),s.decompress(i.join(""))},compressToEncodedURIComponent:function(e){return null==e?"":s._compress(e,6,(function(e){return o.charAt(e)}))},decompressFromEncodedURIComponent:function(e){return null==e?"":""==e?null:(e=e.replace(/ /g,"+"),s._decompress(e.length,32,(function(t){return n(o,e.charAt(t))})))},compress:function(t){return s._compress(t,16,(function(t){return e(t)}))},_compress:function(e,t,o){if(null==e)return"";var r,n,s,i={},c={},a="",l="",p="",u=2,d=3,h=2,f=[],v=0,m=0;for(s=0;s<e.length;s+=1)if(a=e.charAt(s),Object.prototype.hasOwnProperty.call(i,a)||(i[a]=d++,c[a]=!0),l=p+a,Object.prototype.hasOwnProperty.call(i,l))p=l;else{if(Object.prototype.hasOwnProperty.call(c,p)){if(p.charCodeAt(0)<256){for(r=0;r<h;r++)v<<=1,m==t-1?(m=0,f.push(o(v)),v=0):m++;for(n=p.charCodeAt(0),r=0;r<8;r++)v=v<<1|1&n,m==t-1?(m=0,f.push(o(v)),v=0):m++,n>>=1}else{for(n=1,r=0;r<h;r++)v=v<<1|n,m==t-1?(m=0,f.push(o(v)),v=0):m++,n=0;for(n=p.charCodeAt(0),r=0;r<16;r++)v=v<<1|1&n,m==t-1?(m=0,f.push(o(v)),v=0):m++,n>>=1}0==--u&&(u=Math.pow(2,h),h++),delete c[p]}else for(n=i[p],r=0;r<h;r++)v=v<<1|1&n,m==t-1?(m=0,f.push(o(v)),v=0):m++,n>>=1;0==--u&&(u=Math.pow(2,h),h++),i[l]=d++,p=String(a)}if(""!==p){if(Object.prototype.hasOwnProperty.call(c,p)){if(p.charCodeAt(0)<256){for(r=0;r<h;r++)v<<=1,m==t-1?(m=0,f.push(o(v)),v=0):m++;for(n=p.charCodeAt(0),r=0;r<8;r++)v=v<<1|1&n,m==t-1?(m=0,f.push(o(v)),v=0):m++,n>>=1}else{for(n=1,r=0;r<h;r++)v=v<<1|n,m==t-1?(m=0,f.push(o(v)),v=0):m++,n=0;for(n=p.charCodeAt(0),r=0;r<16;r++)v=v<<1|1&n,m==t-1?(m=0,f.push(o(v)),v=0):m++,n>>=1}0==--u&&(u=Math.pow(2,h),h++),delete c[p]}else for(n=i[p],r=0;r<h;r++)v=v<<1|1&n,m==t-1?(m=0,f.push(o(v)),v=0):m++,n>>=1;0==--u&&(u=Math.pow(2,h),h++)}for(n=2,r=0;r<h;r++)v=v<<1|1&n,m==t-1?(m=0,f.push(o(v)),v=0):m++,n>>=1;for(;;){if(v<<=1,m==t-1){f.push(o(v));break}m++}return f.join("")},decompress:function(e){return null==e?"":""==e?null:s._decompress(e.length,32768,(function(t){return e.charCodeAt(t)}))},_decompress:function(t,o,r){var n,s,i,c,a,l,p,u=[],d=4,h=4,f=3,v="",m=[],b={val:r(0),position:o,index:1};for(n=0;n<3;n+=1)u[n]=n;for(i=0,a=Math.pow(2,2),l=1;l!=a;)c=b.val&b.position,b.position>>=1,0==b.position&&(b.position=o,b.val=r(b.index++)),i|=(c>0?1:0)*l,l<<=1;switch(i){case 0:for(i=0,a=Math.pow(2,8),l=1;l!=a;)c=b.val&b.position,b.position>>=1,0==b.position&&(b.position=o,b.val=r(b.index++)),i|=(c>0?1:0)*l,l<<=1;p=e(i);break;case 1:for(i=0,a=Math.pow(2,16),l=1;l!=a;)c=b.val&b.position,b.position>>=1,0==b.position&&(b.position=o,b.val=r(b.index++)),i|=(c>0?1:0)*l,l<<=1;p=e(i);break;case 2:return""}for(u[3]=p,s=p,m.push(p);;){if(b.index>t)return"";for(i=0,a=Math.pow(2,f),l=1;l!=a;)c=b.val&b.position,b.position>>=1,0==b.position&&(b.position=o,b.val=r(b.index++)),i|=(c>0?1:0)*l,l<<=1;switch(p=i){case 0:for(i=0,a=Math.pow(2,8),l=1;l!=a;)c=b.val&b.position,b.position>>=1,0==b.position&&(b.position=o,b.val=r(b.index++)),i|=(c>0?1:0)*l,l<<=1;u[h++]=e(i),p=h-1,d--;break;case 1:for(i=0,a=Math.pow(2,16),l=1;l!=a;)c=b.val&b.position,b.position>>=1,0==b.position&&(b.position=o,b.val=r(b.index++)),i|=(c>0?1:0)*l,l<<=1;u[h++]=e(i),p=h-1,d--;break;case 2:return m.join("")}if(0==d&&(d=Math.pow(2,f),f++),u[p])v=u[p];else{if(p!==h)return null;v=s+s.charAt(0)}m.push(v),u[h++]=s+v.charAt(0),s=v,0==--d&&(d=Math.pow(2,f),f++)}}};return s}();void 0===(r=function(){return n}.call(t,o,t,e))||(e.exports=r)},460:function(e,t,o){"use strict";o.r(t);var r=o(95),n=o(172),s=o(158),i=o(165),c=o(103),a=o(202),l=o(38),p=o(96),u=o(136);const d=new WeakMap,h=Object(u.d)((...e)=>t=>{let o=d.get(t);void 0===o&&(o={lastRenderedIndex:2147483647,values:[]},d.set(t,o));const r=o.values;let n=r.length;o.values=e;for(let s=0;s<e.length&&!(s>o.lastRenderedIndex);s++){const i=e[s];if(Object(p.f)(i)||"function"!=typeof i.then){t.setValue(i),o.lastRenderedIndex=s;break}s<n&&i===r[s]||(o.lastRenderedIndex=2147483647,n=0,Promise.resolve(i).then(e=>{const r=o.values.indexOf(i);r>-1&&r<o.lastRenderedIndex&&(o.lastRenderedIndex=r,t.setValue(e),t.commit())}))}});var f=o(62),v=o(442),m=o.n(v),b=o(201),g=r.b`:host{
    display: flex;
    justify-content: center;
    align-items: center;
}

#form{
    position: absolute;
    top: 2em;
    right: 0;
    background-color: var(--color-background-primary);
    padding: 0.5em;
    border: 1px solid var(--color-border);
    border-radius: 0.5em;
    box-shadow: 5px 5px 3px 0px var(--color-shadow);
    width: 25em;
    /*display: none;*/
}

li{
    position: relative;
}

#description{
    box-sizing: border-box;
    width: 100%;
    min-height: 20em;
    resize: none;
}

#characterCounter{
    position: absolute;
    bottom: 0.5em;
    right: 0.75em;
    color: #f22;
}

textarea.error{
    background: #fdd;
}
textarea.ok{
    background: #dfd;
}

#form label{
    min-width: 20em;
    max-width: 20em;
}

button#yes{
    width: 4em;
}`;function w(e,t){if(!Object.prototype.hasOwnProperty.call(e,t))throw new TypeError("attempted to use private field on non-instance");return e}var y=0;function x(e){return"__private_"+y+++"_"+e}async function k(e){return e=m.a.compressToBase64(e),fetch("https://api.subset42.com?token=eAg4FPusH8uyvzEFzF9DByA5Gh89Fz",{method:"post",body:e}).then(e=>e.json())}function j(){return JSON.parse(localStorage.getItem("unsent-bug-reports")||"{}")}function A(e){localStorage.setItem("unsent-bug-reports",JSON.stringify(e))}class O extends a.a{static get styles(){return[b.a,g]}constructor(){super(),Object.defineProperty(this,T,{writable:!0,value:void 0}),Object.defineProperty(this,C,{writable:!0,value:void 0}),Object.defineProperty(this,R,{writable:!0,value:20}),Object.defineProperty(this,I,{writable:!0,value:10}),setTimeout(async()=>{const e=j();for(const[t,o]of Object.entries(e)){const r=m.a.decompressFromUTF16(o);if(r){const o=await k(r);!0===(null==o?void 0:o.success)&&(console.log("report sent"),delete e[t])}}A(e)},1e3)}render(){let e=null;return n.a.activeProject&&(e=r.c`
                <li>
                    <div>
                        <label for="project" title="This should be used when reporting code-specific errors.">Include project files</label>
                        <input type="checkbox" id="project">
                    </div>
                </li>
            `),s.a.reportOpen?r.c`
            <button class="error" @click=${this.onClick}>Report Bug</button>
            <form id="form" autocomplete="off" action="javascript:void(0);">
                <header>
                    <h1>Report Bug</h1>
                </header>
                ${h(w(this,T)[T].promise,r.c`
                    <p>The current state of the application will be added to the report. Make sure to report from wherever the problem occurred.</p>
                    <ul>
                        <li>
                            <textarea id="description" class="error" placeholder="Description" @input=${this.onDescriptionChange}></textarea>
                            <div id="characterCounter">0/${w(this,R)[R]}</div>
                        </li>
                        ${e}
                    </ul>
                    <footer>
                        <button id="no" class="error" type="button" @click=${this.onAbort}>Cancel</button>
                        <button id="yes" class="ok" type="button" @click=${this.onSubmit}>Report</button>
                    </footer>
                `)}
            </form>
        `:r.c`
                <button @click=${this.onClick}>Report Bug</button>
            `}updated(){var e,t;const o=null===(e=this.shadowRoot)||void 0===e?void 0:e.getElementById("description"),r=null===(t=this.shadowRoot)||void 0===t?void 0:t.getElementById("yes");if(o&&o.focus(),r){let e=w(this,I)[I];r.disabled=!0,r.classList.remove("ok"),function t(){e>1?(e--,r.innerText=`${e}`,setTimeout(t,1e3)):(r.disabled=!1,r.innerText="Report",r.classList.add("ok"))}()}}close(){s.a.closeReport()}onDescriptionChange(e){var t;const o=null===(t=this.shadowRoot)||void 0===t?void 0:t.getElementById("characterCounter"),r=e.target;r.textLength<w(this,R)[R]?(o.innerText=`${r.textLength}/${w(this,R)[R]}`,r.classList.add("error"),r.classList.remove("ok")):(o.innerText="",r.classList.add("ok"),r.classList.remove("error"))}onAbort(){this.close()}async onSubmit(){var e,t,o;const a=null===(e=this.shadowRoot)||void 0===e?void 0:e.getElementById("description"),p=null===(t=this.shadowRoot)||void 0===t?void 0:t.getElementById("project"),u=a.value;if(a.textLength<w(this,R)[R])return void a.focus();const d=Object(l.g)(n.a),v=Object(l.g)(s.a),b=Object(l.g)(i.a);let g=[];var y;(null==p?void 0:p.checked)&&(null===(o=n.a.activeProject)||void 0===o?void 0:o.id)&&(g.push(...await c.a.getProjectFiles(0)),g.push(...await c.a.getProjectFiles(null===(y=n.a.activeProject)||void 0===y?void 0:y.id)));const x=JSON.stringify({description:u,appStore:v,projectStore:d,settingsStore:b,files:g});w(this,C)[C]=new f.a,k(x).then(e=>{!0===(null==e?void 0:e.success)?w(this,C)[C].resolve(r.c`
                <p>The report was successfully sent.</p>
                <p>Thanks for helping to improve this project!</p>
                <footer>
                    <button id="yes" class="ok" type="button" @click=${this.close}>Close</button>
                </footer>
            `):(crypto.subtle.digest("SHA-256",(new TextEncoder).encode(x)).then(e=>{const t=(new TextDecoder).decode(e),o=j();o[t]=m.a.compressToUTF16(x),A(o)}),w(this,C)[C].resolve(r.c`
                    <p>There was an error, the report will be stored and sent at a later time.</p>
                    <p>Thanks for helping to improve this project!</p>
                    <footer>
                        <button id="yes" class="warning" type="button" @click=${this.close}>Close</button>
                    </footer>
                `))}),w(this,T)[T].resolve(r.c`
            ${h(w(this,C)[C].promise,r.c`
                <p>sending...</p>
            `)}
        `)}onClick(){s.a.reportOpen?this.onAbort():(w(this,T)[T]=new f.a,s.a.openReport())}}var T=x("sent"),C=x("result"),R=x("minDescLength"),I=x("countdownTimer");window.customElements.define("c4f-bug-tracker",O)}}]);