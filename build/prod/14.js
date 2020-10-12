(window.webpackJsonpLIB=window.webpackJsonpLIB||[]).push([[14,18],{112:function(e,t,o){"use strict";o.d(t,"a",(function(){return i}));o(62);let i,a;!function(e){e[e.LOG=0]="LOG",e[e.JSON_STORE=1]="JSON_STORE",e[e.CALL=2]="CALL",e[e.EVENT=3]="EVENT",e[e.HTML=4]="HTML",e[e.VIDEO=5]="VIDEO"}(i||(i={})),function(e){e[e.RUN=0]="RUN",e[e.TRAIN=1]="TRAIN"}(a||(a={}))},203:function(e,t,o){"use strict";let i;o.d(t,"a",(function(){return i})),function(e){e[e.LOG=0]="LOG",e[e.WARN=1]="WARN",e[e.ERROR=2]="ERROR"}(i||(i={}))},395:function(e,t,o){"use strict";o.r(t);var i=o(95),a=o(230),n=o(38),r=o(172),l=o(62),s=o(201),c=i.b`:host, #wrapper{
    height: 100%;

}
#wrapper{
    display: flex;
}
#handle{
    background: var(--color-border-secondary);
    cursor: grab;
    min-width: 4px;
    min-height: 4px;
}
#start, #end{
    flex: 1;
}`;function d(e,t){if(!Object.prototype.hasOwnProperty.call(e,t))throw new TypeError("attempted to use private field on non-instance");return e}var p=0;function m(e){return"__private_"+p+++"_"+e}class u extends i.a{constructor(...e){super(...e),Object.defineProperty(this,h,{writable:!0,value:void 0}),Object.defineProperty(this,v,{writable:!0,value:0}),this.direction="horizontal",this.minSize="10px",this.defaultRatio=.5,this.saveId=void 0}static get properties(){return{direction:{type:String},minSize:{type:String},defaultRatio:{type:Number},saveId:{type:String}}}static get styles(){return[s.a,c]}render(){return i.c`<div id="wrapper"><div id="start"><slot name="start"></slot></div><div id="handle"></div><div id="end"><slot name="end"></slot></div></div>`}firstUpdated(){var e,t,o,i;const a=null===(e=this.shadowRoot)||void 0===e?void 0:e.getElementById("wrapper"),n=null===(t=this.shadowRoot)||void 0===t?void 0:t.getElementById("handle"),r=null===(o=this.shadowRoot)||void 0===o?void 0:o.getElementById("start"),l=null===(i=this.shadowRoot)||void 0===i?void 0:i.getElementById("end"),s=e=>{if(r.style.flex=`${e}`,l.style.flex=`${1-e}`,this.saveId){const t=JSON.parse(localStorage.getItem("dynamic-split-state")||"{}");t[this.saveId]=e,localStorage.setItem("dynamic-split-state",JSON.stringify(t))}},c=e=>{const t=a.getBoundingClientRect();let o=(e.offsetX-t.x)/t.width;"vertical"===this.direction&&(o=(e.offsetY-t.y)/t.height),s(o)};if(r.style.minWidth=this.minSize,r.style.minHeight=this.minSize,l.style.minWidth=this.minSize,l.style.minHeight=this.minSize,"vertical"===this.direction?(a.style.flexDirection="column",n.style.height="4px"):n.style.width="4px",this.saveId){const e=JSON.parse(localStorage.getItem("dynamic-split-state")||"{}")[this.saveId]||this.defaultRatio;s(e)}else s(this.defaultRatio);n.onmousedown=e=>{d(this,h)[h]?(c(e),d(this,h)[h]=void 0):(d(this,h)[h]=n,d(this,v)[v]=performance.now())},window.addEventListener("mouseup",e=>{d(this,h)[h]&&(c(e),d(this,h)[h]=void 0)}),window.addEventListener("mousemove",e=>{if(d(this,h)[h]){const t=performance.now();t-d(this,v)[v]>20&&(d(this,v)[v]=t,c(e)),e.preventDefault()}})}}var h=m("drag"),v=m("throttle");window.customElements.define("dynamic-split",u);var f=i.b`:host{
    height: 100%;
}
#content{
    height: calc(100% - 1.5em);
}
ul{
    height: 1.5em;
    display: flex;
    box-sizing: border-box;
    background: var(--color-background-secondary);
    border-bottom: 1px solid var(--color-border);
}
a{
    padding: 0 0.5em;
    display: inline-flex;
    height: 100%;
    align-items: center;
}
a:hover{
    text-decoration: none;
    color: var(--color-text);
    font-weight: bold;
}
a.active{
    background: var(--color-border-secondary);
    /*border-bottom: 1px solid var(--color-border-secondary);
    border-top: 1px solid var(--color-border-secondary);*/
}
::slotted(*){
    display: none;
}`;function g(e,t){if(!Object.prototype.hasOwnProperty.call(e,t))throw new TypeError("attempted to use private field on non-instance");return e}var y=0;function b(e){return"__private_"+y+++"_"+e}class w extends i.a{constructor(...e){super(...e),Object.defineProperty(this,j,{writable:!0,value:null}),Object.defineProperty(this,E,{writable:!0,value:{}}),this.direction="horizontal",this.minSize="10px",this.defaultRatio="0.5",this.saveId=0}static get properties(){return{direction:{type:String},minSize:{type:String},defaultRatio:{type:Number},saveId:{type:String}}}static get styles(){return[s.a,f]}render(){return i.c`<header><ul></ul></header><div id="content"><slot></slot>`}firstUpdated(){var e,t;const o=null===(e=this.shadowRoot)||void 0===e?void 0:e.querySelector("slot"),i=null===(t=this.shadowRoot)||void 0===t?void 0:t.querySelector("ul"),a=o.assignedNodes().filter(e=>3!==e.nodeType);for(const e of a){const t=e.getAttribute("name")||"???",o=document.createElement("li"),a=document.createElement("a");a.innerHTML=t,o.appendChild(a),i.appendChild(o),g(this,E)[E][t]={node:e,a:a},a.onclick=e=>{this.select(t)}}this.select(a[0].getAttribute("name"))}select(e){e?(g(this,j)[j]&&(g(this,j)[j].a.classList.remove("active"),g(this,j)[j].node.style.display="none"),g(this,j)[j]=g(this,E)[E][e],g(this,j)[j].node.style.display="block",g(this,j)[j].a.classList.add("active")):g(this,j)[j]=null}}var j=b("selected"),E=b("elements");window.customElements.define("tab-group",w);var I=o(158),x=o(412),k=o(435),O=o(440),_=o(103),P=i.b`:host{
    display: flex;
    flex-direction: column;
    overflow-y:auto;
    overflow-x:hidden;
    height: 100%;
    background-color: #fff;
}

#filetree{
    height: 100%;
    border: 0;
}

img.icon{
    height: 1.1em;
    position: relative;
    top: 0.15em;
    padding-right: 0.5em;
}

ul.folders > li{
    padding: 0 0.25em 0.5em 0.25em;
}

ul.files > li{
    position: relative;
    padding: 0 0.5em;
}

li[active]{
    background-color: #ccc;
}

a{
    white-space: nowrap;
}

a.delete{
    position: absolute;
    right: 0;
    top: 0.1em;
    background-color: #fff;
}
li[active] a.delete{
    background-color: #ccc;
}`;function R(e,t){if(!Object.prototype.hasOwnProperty.call(e,t))throw new TypeError("attempted to use private field on non-instance");return e}var F=0;class B extends i.a{constructor(...e){super(...e),Object.defineProperty(this,N,{writable:!0,value:new l.a})}static get styles(){return[s.a,P]}render(){return i.c`<iframe id="filetree" src="jstree.html"></iframe>`}async onDelete(e){if(r.a.activeProject)try{await I.a.showModal(x.Modals.GENERIC,Object(k.b)(e));const t=await _.a.loadFileByName(r.a.activeProject.id,"index.js");await r.a.openFile(t.id),await r.a.deleteFile(e.id)}catch(e){e instanceof x.ModalAbort||console.error(e)}}onFile(e){r.a.activeProject&&(e.id?r.a.openFile(e.id):r.a.openVirtualFile(e))}onAddFile(){r.a.activeProject&&this.addFile()}async onUploadFile(){try{var e;const t=await I.a.showModal(x.Modals.GENERIC,Object(k.f)((null===(e=r.a.activeProject)||void 0===e?void 0:e.id)||0)),o=await r.a.createFile(t.name,t.projectId,t.content);r.a.openFile(o)}catch(e){e instanceof x.ModalAbort||console.error(e)}}onDownloadFile(e){if(e.content instanceof Blob)Object(O.saveAs)(e.content,e.name);else{const t=new Blob([e.content||""],{type:"text/plain"});Object(O.saveAs)(t,e.name)}}async addFile(){try{var e;const t=await I.a.showModal(x.Modals.GENERIC,Object(k.a)((null===(e=r.a.activeProject)||void 0===e?void 0:e.id)||0));console.log(t);const o=await r.a.createFile(`${t.name}.${t.type}`,Number(t.projectId),"");r.a.openFile(o)}catch(e){e instanceof x.ModalAbort||console.error(e)}}async firstUpdated(){var e;const t=null===(e=this.shadowRoot)||void 0===e?void 0:e.getElementById("filetree");t?t.onload=async()=>{if(t.contentWindow){R(this,N)[N].resolve(t.contentWindow);const e=await R(this,N)[N].promise;e.onFile=this.onFile.bind(this),e.onAddFile=this.onAddFile.bind(this),e.onDownloadFile=this.onDownloadFile.bind(this),e.onUploadFile=this.onUploadFile.bind(this),e.onDelete=this.onDelete.bind(this),Object(l.c)(t),Object(n.c)(async e=>{r.a.lastFileTreeChange,r.a.activeProject&&await this.updateTree()}),Object(n.c)(async t=>{const o=r.a.activeFile;o&&await e.selectFile(o)}),Object(n.c)(async t=>{var o;const i=Object(n.g)(null===(o=r.a.activeProject)||void 0===o?void 0:o.errors)||{};await e.setErrors(i)})}else Object(l.f)()}:Object(l.f)()}async updateTree(){var e;let t,o,i;[t,o,i]=await Promise.all([R(this,N)[N].promise,r.a.activeProject?_.a.getProjectFiles(r.a.activeProject.id):[],_.a.getProjectFiles(0)]),o=o.sort(this.sort),i=i.sort(this.sort);const a=(null===(e=r.a.activeProject)||void 0===e?void 0:e.errors)||{};r.a.activeFile?await t.updateFiles(i,o,r.a.activeFile,a):Object(l.f)()}sort(e,t){const o=e.name.split(".").pop(),i=t.name.split(".").pop();let a=null==o?void 0:o.localeCompare(i||"");return 0===a&&(a=e.name.localeCompare(t.name)),a||0}}var N="__private_"+F+++"_"+"fileTree";window.customElements.define("file-tree",B);var T=o(165),$=o(443),C=i.b`:host, #editor, #preview{
    height:100%;
    width: 100%;
    border: 0;
    position: relative;
}

ul#menu{
    position: absolute;
    top: -1.5em;
    right: 0;
    height: 1.5em;
    display: flex;
}
ul#menu > li{
    padding: 0 0.25em;
    display: flex;
    align-items: center;
}

#preview > img{
    width: 100%;
    height: 100%;
    object-fit: contain;
}`;function M(e,t){if(!Object.prototype.hasOwnProperty.call(e,t))throw new TypeError("attempted to use private field on non-instance");return e}var S=0;function A(e){return"__private_"+S+++"_"+e}class L extends i.a{constructor(...e){super(...e),Object.defineProperty(this,D,{writable:!0,value:new l.a}),Object.defineProperty(this,H,{writable:!0,value:!0})}static get styles(){return[s.a,C]}render(){M(this,H)[H]=!0;const e=T.a.get("editor-theme","vs"),t=T.a.get("editor-wordwrap",!1);return i.c`
            <iframe id="editor" src="monaco.html"></iframe>
            <ul id="menu">
                <li>
                    <input type="checkbox" id="wordwrap" ?checked=${t}>
                    <label for="wordwrap">word wrap</label>
                </li>
                <li>
                    <select id="theme">
                        <option value="vs" ?selected="${"vs"===e}">Light</option>
                        <option value="vs-dark" ?selected="${"vs-dark"===e}">Dark</option>
                        <option value="hc-black" ?selected="${"hc-black"===e}">High Contrast</option>
                    </select>
                </li>
            </ul>
            <div id="preview" style="display:none"></div>
        `}async firstUpdated(){var e,t,o;const i=null===(e=this.shadowRoot)||void 0===e?void 0:e.getElementById("editor"),a=null===(t=this.shadowRoot)||void 0===t?void 0:t.getElementById("theme"),s=null===(o=this.shadowRoot)||void 0===o?void 0:o.getElementById("wordwrap");let c,d;i.onload=()=>{const e=i.contentWindow;M(this,D)[D].resolve(e),new $.ResizeObserver(()=>{e.resize()}).observe(i),e.onContentChange=(e,t)=>{r.a.saveFileContent(e,t)},e.onStateChange=(e,t)=>{r.a.saveFileState(e,t)},e.onErrorChange=t=>{M(this,H)[H]&&(M(this,H)[H]=!1,r.a.activeFile&&e.openFile(r.a.activeFile)),r.a.activeProject&&r.a.updateProjectErrors(r.a.activeProject.id,t)},e.setTheme(a.options[a.selectedIndex].value),e.setWordWrap(s.checked),Object(l.c)(i)},a.onchange=async e=>{const t=await M(this,D)[D].promise,o=a.options[a.selectedIndex].value;T.a.set("editor-theme",o),t.setTheme(o)},s.onchange=async e=>{const t=await M(this,D)[D].promise;T.a.set("editor-wordwrap",s.checked),t.setWordWrap(s.checked)},Object(n.e)(()=>({activeProject:r.a.activeProject,activeFile:r.a.activeFile}),async(e,t)=>{if(e.activeProject!==c){const t=await M(this,D)[D].promise;if(e.activeProject){c=e.activeProject;let o=await _.a.getProjectFiles(c.id);o=[...o,...await _.a.getProjectFiles(0)].filter(e=>!(e.content instanceof Blob)),t.openProject(c,o)}else t.closeProject()}if(e.activeFile!==d&&e.activeFile){var o,i,a;d=e.activeFile;const t=null===(o=this.shadowRoot)||void 0===o?void 0:o.getElementById("editor"),n=null===(i=this.shadowRoot)||void 0===i?void 0:i.getElementById("menu"),r=null===(a=this.shadowRoot)||void 0===a?void 0:a.getElementById("preview"),l=await M(this,D)[D].promise;/\.(png|jpe?g)$/.test(d.name)?(t.style.display="none",n.style.display="none",r.style.display="block",r.innerHTML=`<img src="/${d.projectId}/${d.name}">`):(t.style.display="block",n.style.display="flex",r.style.display="none",l.openFile(d))}},{fireImmediately:!0})}}var D=A("monaco"),H=A("firstErrorUpdate");window.customElements.define("c4f-editor-iframe",L);var z=o(202),U=o(394),W=o(446),G=o(203),V=i.b`:host{
    height: 100%;
}

div#console{
    background: var(--color-background-primary);
    height: 100%;
    overflow: auto;
}

p{
    position:relative;
    white-space: pre-wrap;
    font-family: monospace; /*var(--font-monospace);*/
    margin: 0;
    padding: 0 0.5em;
    border-top: 1px solid var(--color-background-secondary);
    border-bottom: 1px solid var(--color-border-secondary);
    margin-top: -1px;
}

p.log{
    z-index: 0;
}

p.warn{
    color: rgb(44, 39, 16);
    background: rgb(255, 242, 166);
    border-color: rgb(255, 236, 130);
    z-index: 1;
}

p.error{
    color: rgb(48, 12, 12);
    background: rgb(255, 188, 188);
    border-color: rgb(255, 149, 149);
    z-index: 2;
}

a.file{
    font-family: monospace;
    float: right;
    color: var(--color-text-weak);
    font-size: 0.7em;
}

a.file:hover{
    color: var(--color-text);
}`;class q extends z.a{static get styles(){return[s.a,V]}render(){const e=[...r.a.log];return i.c`<div id="console">
            ${Object(W.a)(e,e=>e,e=>this.getLogHtml(e))}
        </div>`}updated(){var e;const t=null===(e=this.shadowRoot)||void 0===e?void 0:e.querySelector("div#console");t&&(t.scrollTop=t.scrollHeight,setTimeout(()=>{t.scrollTop=t.scrollHeight},100))}getLogHtml(e){const t=e.args.map(e=>e=(e=(e=(e=(e=(e=(e=(e=(e=(e=(e=(e=e.replace(/\{\s*"type":\s*"__FUNCTION__",\s*"name":\s*"(\w+)"\s*\}/g,"$1()")).replace(/\{\s*"type":\s*"__ERROR__",\s*"message":\s*"(.*?)"[^]*?\}/g,"Error: $1")).replace(/\{\s*"type":\s*"__MAP__",\s*"data":\s*([^]*?)\s*\}/g,"Map($1)")).replace(/\{\s*"type":\s*"__SET__",\s*"data":\s*([^]*?)\s*\}/g,"Set($1)")).replace(/\{\s*"type":\s*"__DATE__",\s*"timestamp":\s*(\d*)\s*\}/g,(e,t)=>new Date(Number(t)))).replace('"__UNDEFINED__"',"undefined")).replace('"__+INFINITY__"',"Infinity")).replace('"__-INFINITY__"',"-Infinity")).replace('"__NAN__"',"NaN")).replace("\\n","\n")).replace(/"(\w+)":/g,"$1:")).replace(/^"([^]*)"$/g,"$1"));let o;switch(e.type){case G.a.WARN:o="warn";break;case G.a.ERROR:o="error";break;default:o="log"}if(e.caller&&e.caller.fileId){const a=e.caller.fileId,n=e.caller.line,r=e.caller.column;let l=void 0;n&&r&&(l={lineNumber:n,column:r});let s=`${e.caller.fileName}`;n&&(s+=`:${e.caller.line}`);for(const t of e.caller.functionNames)s+=`:${t}`;return i.c`<p class="${o}"><a class="file" @click=${()=>this.onClick(a,l)}>${s}</a>${t.join(" ")}</p>`}return i.c`<p class="${o}">${t.join(" ")}</p>`}onClick(e,t){r.a.openFile(e,t)}}window.customElements.define("c4f-console",q);var J=o(112);function Y(e,t){if(!Object.prototype.hasOwnProperty.call(e,t))throw new TypeError("attempted to use private field on non-instance");return e}var K=0;class X{constructor(){Object.defineProperty(this,Z,{writable:!0,value:void 0}),this.onUpdateMessages=void 0,Y(this,Z)[Z]}async simSetup(){if(!r.a.activeProject)throw new Q("no project loaded");Y(this,Z)[Z]&&Y(this,Z)[Z].terminate(),Y(this,Z)[Z]=new Worker("scenario-worker.js",{type:"module"}),Y(this,Z)[Z].onmessage=async e=>{const t=e.data;switch(t.type){case J.a.LOG:{const e=t.log;var o;if(e.caller&&!e.caller.projectId)e.caller.projectId=null===(o=r.a.activeProject)||void 0===o?void 0:o.id;r.a.addLog(e.type,e.args,e.caller);break}case J.a.JSON_STORE:{var i;const e=t;let o=e.projectId;if(void 0===o&&(o=null===(i=r.a.activeProject)||void 0===i?void 0:i.id),o){try{const t=await _.a.loadFileByName(o,e.fileName);await r.a.saveFileContent(t.id,e.json)}catch(t){await r.a.createFile(e.fileName,o,e.json)}break}throw new Q("no active project")}case J.a.HTML:if(this.onUpdateMessages){const e=t;this.onUpdateMessages(e.action,e.html)}}e.ports.length>0&&e.ports[0].postMessage({},[])},Y(this,Z)[Z].onerror=e=>{console.error(e)};const e=await navigator.serviceWorker.ready;await Object(l.d)({type:"setProject",project:{id:r.a.activeProject.id,scenario:r.a.activeProject.scenario}},null,e.active)}async call(e,t,o){await this.simSetup();const i={type:J.a.CALL,file:e,functionName:t,canvases:o};await Object(l.d)(i,null,Y(this,Z)[Z],[...o])}async sendMessage(e,t=[]){if(Y(this,Z)[Z])return Object(l.d)(e,null,Y(this,Z)[Z],t)}terminate(){Y(this,Z)[Z]&&Y(this,Z)[Z].terminate(),Y(this,Z)[Z]=void 0}}var Z=function(e){return"__private_"+K+++"_"+e}("worker");class Q extends Error{}var ee=i.b`:host{
    height: 100%;
}

#wrapper{
    height: 100%;
    display: flex;
    flex-direction: column;
    align-items: stretch;
    align-content: stretch;
}

.layer{
    width: 100%;
    height: 100%;
    min-height: 0;
    position: absolute;
}

#display{
    flex: 1 1;
    min-height: 0;
    position: relative;
}

#messages{
    height: 10em;
    overflow: auto;
    font-size: 1.25em;
    padding: 0.25em;
    border-top: 1px solid var(--color-border);
}
#messages p{
    margin: 0.25em 0;
}

#control{
    display: flex;
}
#settings li{
    display: flex;
    align-items: center;
    position: relative;
}
#settings > ul{
    display: flex;
}

button{
    margin: 0.25em;
}


#video{
    display: none;
    position: absolute;
    top: 1.5em;
    left: 0.5em;
    max-width: 10em;
    max-height: 10em;
}
#video_container:hover > #camera:checked ~ #video{
    display: block;
}`;function te(e,t){if(!Object.prototype.hasOwnProperty.call(e,t))throw new TypeError("attempted to use private field on non-instance");return e}var oe=0;function ie(e){return"__private_"+oe+++"_"+e}class ae extends z.a{static get styles(){return[s.a,ee]}constructor(){super(),Object.defineProperty(this,ne,{writable:!0,value:new X}),Object.defineProperty(this,re,{writable:!0,value:new Array(3)}),Object.defineProperty(this,le,{writable:!0,value:null}),Object.defineProperty(this,se,{writable:!0,value:null}),te(this,ne)[ne].onUpdateMessages=this.updateMessages.bind(this)}render(){return i.c`
            <div id="wrapper">
                <header>
                    <section id="control">
                        <button class="ok" @click=${this.simRun}>start&nbsp;/&nbsp;restart</button>
                        <button class="warning" @click=${this.simTrain}>call&nbsp;train</button>
                        <button class="error" @click=${this.simTerminate}>terminate</button>
                    </section>
                    <section id="settings">
                        <ul>
                            <li id="video_container">
                                <input id="camera" type="checkbox" @click=${this.toggleCamera}>
                                <label for="camera">Camera</label>
                                <video id="video" poster="assets/interface/loading.gif"></video>
                            </li>
                        </ul>
                    </section>
                </header>
                <div id="display"></div>
                <footer id="messages"></footer>
            </div>
        `}firstUpdated(){Object(n.c)(e=>{r.a.activeProject?this.simRun():this.simTerminate()})}async simRun(){var e;await navigator.serviceWorker.ready,r.a.flushFile(),r.a.clearLog();for(const e of Object.values((null===(t=r.a.activeProject)||void 0===t?void 0:t.errors)||{})){var t;for(const t of e)r.a.addLog(G.a.ERROR,t.args,t.caller)}(null===(e=this.shadowRoot)||void 0===e?void 0:e.getElementById("messages")).innerHTML="";const o=await this.getCanvas();te(this,ne)[ne].call("/project/index.js","start",o)}async simTrain(){r.a.flushFile(),r.a.clearLog();for(const t of Object.values((null===(e=r.a.activeProject)||void 0===e?void 0:e.errors)||{})){var e;for(const e of t)r.a.addLog(G.a.ERROR,e.args,e.caller)}const t=await this.getCanvas();te(this,ne)[ne].call("/project/index.js","train",t)}async simTerminate(){te(this,ne)[ne].terminate();const e="simulation terminated!";r.a.addLog(G.a.WARN,[e]),console.warn(e)}updateMessages(e,t){var o;const i=null===(o=this.shadowRoot)||void 0===o?void 0:o.getElementById("messages");i&&("set"===e?(i.innerHTML=t,i.scrollTop=i.scrollHeight):(i.innerHTML+=t,i.scrollTop=i.scrollHeight))}async getCanvas(){return new Promise((e,t)=>{var o;const i=null===(o=this.shadowRoot)||void 0===o?void 0:o.getElementById("display");let a=new Array(3);for(let e=0;e<3;e++){var n;let t=null===(n=this.shadowRoot)||void 0===n?void 0:n.getElementById(`canvas${e}`);t&&i.removeChild(t),t=document.createElement("canvas"),t.id=`canvas${e}`,t.classList.add("layer"),i.appendChild(t),a[e]=new Promise((o,i)=>{te(this,re)[re][e]&&clearInterval(te(this,re)[re][e]),te(this,re)[re][e]=window.setInterval(()=>{t.clientWidth>0&&t.clientHeight>0&&te(this,re)[re]&&(t.width=t.clientWidth,t.height=t.clientHeight,clearInterval(te(this,re)[re][e]),te(this,re)[re][e]=void 0,o(t))},100)})}Promise.all(a).then(t=>{if(t.length){const e=t[t.length-1];e.onmousemove=Object(U.a)(t=>{const o=this.getMouseEventMessage(t,e,"onmousemove");te(this,ne)[ne].sendMessage(o)},100),e.onmousedown=t=>{const o=this.getMouseEventMessage(t,e,"onmousedown");te(this,ne)[ne].sendMessage(o)},e.onmouseup=t=>{const o=this.getMouseEventMessage(t,e,"onmouseup");te(this,ne)[ne].sendMessage(o)}}e(t.map(e=>e.transferControlToOffscreen()))})})}async startStream(e){if(!te(this,le)[le]){const t=await new Promise((e,t)=>{navigator.getUserMedia({video:!0},e,t)}),[o]=t.getVideoTracks(),i=new ImageCapture(o);te(this,se)[se]=()=>{i.grabFrame().then(e=>{const t={type:J.a.VIDEO,bitmap:e};te(this,ne)[ne].sendMessage(t,[e])}).catch(e=>{}),te(this,se)[se]&&requestAnimationFrame(te(this,se)[se])},e.onplay=()=>{te(this,se)[se]&&requestAnimationFrame(te(this,se)[se])},e.srcObject=t,te(this,le)[le]=t}e.play()}async stopStream(e){te(this,le)[le]&&(te(this,le)[le].getTracks().forEach(e=>e.stop()),te(this,le)[le]=null),e.srcObject=null}async toggleCamera(e){var t,o;const i=null===(t=this.shadowRoot)||void 0===t?void 0:t.getElementById("video");(null===(o=this.shadowRoot)||void 0===o?void 0:o.getElementById("camera")).checked?await this.startStream(i):await this.stopStream(i)}getMouseEventMessage(e,t,o){var i=t.getBoundingClientRect(),a=e.clientX-i.left,n=e.clientY-i.top;return{type:J.a.EVENT,callbackName:o,data:{x:a,y:n,width:i.width,height:i.height}}}}var ne=ie("sandbox"),re=ie("checkCanvasInterval"),le=ie("cameraStream"),se=ie("sendImageData");window.customElements.define("ai-simulator",ae);var ce=o(447),de=o.n(ce),pe=(o(448),o(449),o(450),i.b`:host{
    height: 100%;
}
#markdown{
    background: var(--color-background-primary);
    overflow: auto;
    height: 100%;
    padding: 0.5em;
    box-sizing: border-box;
}
em{
    font-weight: normal;
    font-style: italic;
}
strong{
    font-weight: bold;
}
ul{
    padding-left: 1em;
}
h1{
    letter-spacing: 0.1em; 
}
h2{
    margin-top: 2em;
    letter-spacing: 0.1em;
}
h3{
    margin-top: 1em;
    margin-bottom: -0.5em;
    letter-spacing: 0.1em;
}
p a{
    text-decoration: underline;
}
table{
    border-collapse: collapse;
}
td, th{
    font-family: var(--font-sans-serif);
}
th{
    text-align: start;
}
td{
    padding: 0 0.25em;
    border: 1px solid var(--color-border);
}`),me=o(451),ue=o(452);function he(e,t){if(!Object.prototype.hasOwnProperty.call(e,t))throw new TypeError("attempted to use private field on non-instance");return e}var ve=0;const fe=new(o(453).Converter)({ghCompatibleHeaderId:!0,parseImgDimensions:!0,strikethrough:!0,tables:!0,takslists:!0,smoothLivePreview:!0});class ge extends i.a{constructor(...e){super(...e),Object.defineProperty(this,ye,{writable:!0,value:null})}static get styles(){return[s.a,pe,me.a,ue.a]}render(){return i.c`<div id="markdown"></div>`}firstUpdated(){var e;const t=null===(e=this.shadowRoot)||void 0===e?void 0:e.querySelector("#markdown");Object(n.e)(()=>r.a.activeProject,e=>{e!==he(this,ye)[ye]&&(he(this,ye)[ye]=e,t.innerHTML="")}),Object(n.e)(()=>{var e;return{file:r.a.activeFile,content:null===(e=r.a.activeFile)||void 0===e?void 0:e.content}},async e=>{var o,i;let{file:a}=e;if(!(null===(o=a)||void 0===o?void 0:o.name.endsWith(".md"))&&r.a.activeProject&&0===t.innerHTML.length){var n;const e=r.a.activeProject.id;for(const t of["readme.md","scenario.md"])try{a=await _.a.loadFileByName(e,t);break}catch(e){}if(!(null===(n=a)||void 0===n?void 0:n.name.endsWith(".md"))){const t=await _.a.getProjectFiles(e);for(const e of t)if(e.name.endsWith(".md")){a=e;break}}}(null===(i=a)||void 0===i?void 0:i.name.endsWith(".md"))&&(t.innerHTML=fe.makeHtml(a.content),this.updateHyperlinks(t),this.updateCodeHighlight(t))},{fireImmediately:!0,delay:1})}updateHyperlinks(e){e.querySelectorAll("a").forEach(t=>{const o=t.getAttribute("href");o&&"#"===o[0]&&(t.onclick=t=>{t.preventDefault();const i=e.querySelector(o);i&&i.scrollIntoView()})})}updateCodeHighlight(e){for(const t of e.querySelectorAll("pre"))t.classList.add("line-numbers");de.a.highlightAllUnder(e)}}var ye=function(e){return"__private_"+ve+++"_"+e}("activeProject");function be(e,t){if(!Object.prototype.hasOwnProperty.call(e,t))throw new TypeError("attempted to use private field on non-instance");return e}window.customElements.define("c4f-markdown",ge);var we=0;function je(e){return"__private_"+we+++"_"+e}class Ee extends a.a{constructor(...e){super(...e),Object.defineProperty(this,Ie,{writable:!0,value:null}),Object.defineProperty(this,xe,{writable:!0,value:new l.a})}render(){return i.c`
            <dynamic-split direction="horizontal" minSize="300px" defaultRatio="0.6" saveId="project_simulation">
                <dynamic-split slot="start" direction="vertical" minSize="50px" defaultRatio="0.8" saveId="project_console">
                    <dynamic-split slot="start" direction="horizontal" minSize="100px" defaultRatio="0.3" saveId="project_files_editor">
                        <file-tree slot="start"></file-tree>
                        <tab-group slot="end" id="editorTabGroup">
                            <!-- <c4f-editor name="Editor"></c4f-editor> -->
                            <c4f-editor-iframe name="Editor"></c4f-editor-iframe>
                            <c4f-markdown name="Markdown"></c4f-markdown>
                        </tab-group>
                    </dynamic-split>
                    <c4f-console slot="end"></c4f-console>
                </dynamic-split>
                <tab-group slot="end">
                    <ai-simulator name="Simulation"></ai-simulator>
                    <c4f-markdown name="Markdown"></c4f-markdown>
                </tab-group>
            </dynamic-split>
        `}firstUpdated(){var e;const t=null===(e=this.shadowRoot)||void 0===e?void 0:e.getElementById("editorTabGroup");be(this,xe)[xe].resolve(t),Object(n.c)(async e=>{const t=r.a.activeFile;if(t&&t!==be(this,Ie)[Ie]){const e=await be(this,xe)[xe].promise;t.name.endsWith(".md")?e.select("Markdown"):e.select("Editor"),be(this,Ie)[Ie]=t}})}}var Ie=je("activeFile"),xe=je("editorTabGroup");window.customElements.define("ai-project",Ee)},412:function(e,t,o){"use strict";o.r(t),o.d(t,"Modals",(function(){return s})),o.d(t,"ModalAbort",(function(){return c}));var i=o(95),a=o(202),n=o(158),r=o(201),l=i.b`#background{
    display: none;
}
#background[active]{
    background: rgba(0, 0, 0, 0.75);
    position: absolute;
    z-index: 100;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    display: flex;
    justify-content: center;
    align-items: center;
}

#content{
    width: 30em;
    padding: 1em;
    border: 1px solid #000;
    background-color: #eee;
}

#yes{
    float: right;
    background-color: #5e5;
}

#no{
    float: left;
    background-color: #e55;
}

form{
    padding: 1em 0;
}

.modal {
    display: none;
}

.modal[active] {
    display: block;
    height:100%;
}`;let s;!function(e){e.GENERIC="generic"}(s||(s={}));class c extends Error{}class d extends a.a{static get styles(){return[r.a,l]}render(){var e;let t=null===(e=n.a.modal)||void 0===e?void 0:e.template;return i.c`
            <div id="background" ?active="${null!==n.a.modal}">
                <div id="content">
                    <modal-generic id="${s.GENERIC}" class="modal" ?active="${t===s.GENERIC}"></modal-generic>
                </div>
            </div>
        `}updated(){if(n.a.modal){var e;const t=n.a.modal.template;(null===(e=this.shadowRoot)||void 0===e?void 0:e.getElementById(t)).data=n.a.modal.data}}firstUpdated(){window.onkeydown=e=>{const t=["Escape"];if(n.a.reportOpen||t.push("Enter"),n.a.modal&&t.includes(e.key)){var o;const t=n.a.modal.template,i=null===(o=this.shadowRoot)||void 0===o?void 0:o.getElementById(t);i&&i.onKeyDown&&i.onKeyDown(e.key),e.preventDefault()}}}}window.customElements.define("c4f-modal",d)},435:function(e,t,o){"use strict";o.d(t,"e",(function(){return l})),o.d(t,"g",(function(){return s})),o.d(t,"d",(function(){return c})),o.d(t,"c",(function(){return d})),o.d(t,"a",(function(){return p})),o.d(t,"f",(function(){return m})),o.d(t,"b",(function(){return u}));var i=o(95),a=o(103),n=o(436),r=o.n(n);function l(e){const t=Object.values(e).map(e=>i.c`<option value="${e.name}">${Object.values(e.name)}</option>`);let o=1,n=0;const r=Object.values(e)[o],l=Object.values(r.templates)[n];function s(t,o){const i=Object.entries(e[o].templates).sort((e,t)=>e[1].name.localeCompare(t[1].name)).map(([e,t])=>`<option value="${e}">${t.name}</option>`).join("");t.innerHTML=i}return{title:"New Project",submit:"Create",abort:"Cancel",content:i.c`
            <li>
                <label for="scenario">Scenario</label>
                <select id="scenario">${t}</select>
            </li>
            <li>
                <label for="template">Template</label>
                <select id="template"></select>
            </li>
            <li>
                <label for="name">Name</label>
                <input id="name" type="text" placeholder="My Project" value="${l.name}">
            </li>
        `,init:async e=>{const t=e.getElementById("scenario"),i=e.getElementById("template"),a=e.getElementById("name");t.selectedIndex=o,s(i,t.options[o].value),i.selectedIndex=n,a.value=i.options[n].value},check:async e=>0===e.name.length?Error("Empty project name!<br>Every project must have a name."):!await a.a.projectExists(e.name)||Error("Duplicate name!<br>A project with the same name already exists."),change:{scenario:(e,t)=>{const i=e.target,a=t.getElementById("template"),r=t.getElementById("name");s(a,i.options[i.selectedIndex].value),o=i.selectedIndex,n=0,r.value=a.options[n].value},template:(e,t)=>{const o=e.target,i=o.options[o.selectedIndex].value;t.getElementById("name").value=i,n=o.selectedIndex}}}}function s(){let e,t,o,n;return{title:"Upload Project",submit:"Upload",abort:"Cancel",content:i.c`
            <li>
                <label for="file">File</label>
                <input id="file" type="file">
            </li>
            <li>
                <label for="name">Name</label>
                <input id="name" type="text" placeholder="My Project">
            </li>
            <li>
                <label>Options</label>
                <ul class="options">
                    <li>
                        <label for="globals">Include global files</label>
                        <input id="globals" type="checkbox">
                    </li>
                    <li id="collision" style="display:none">
                        <ul class="options">
                            <li>
                                <label for="prefer_old">Skip existing files</label>
                                <input id="prefer_old" type="radio" name="collision" value="old" checked>
                            </li>
                            <li>
                                <label for="prefer_new">Overwrite existing files</label>
                                <input id="prefer_new" type="radio" name="collision" value="new">
                            </li>
                        </ul>
                    </li>
                </ul>
            </li>
        `,init:async e=>{const t=e.getElementById("prefer_old"),o=e.getElementById("prefer_new"),i=e.getElementById("collision"),a=e.getElementById("globals"),n=e.getElementById("name"),r=e.getElementById("file");o.checked=!1,t.checked=!0,i.style.display="none",a.checked=!1,n.value="",r.value=""},check:async t=>{try{const i=t.globals,r=t.name,l=[];e.folder("project").forEach((e,t)=>{l.push(new Promise((o,i)=>{let a="text";/\.(png|jpe?g)$/.test(t.name)&&(a="blob"),t.async(a).then(t=>{o({id:0,projectId:0,name:e,content:t})})}))});const s=[];if(i&&e.folder("global").forEach((e,t)=>{s.push(new Promise((o,i)=>{let a="text";/\.(png|jpe?g)$/.test(t.name)&&(a="blob"),t.async(a).then(t=>{o({id:0,projectId:0,name:e,content:t})})}))}),0===r.length)throw Error("Empty project name!<br>Every project must have a name.");if(await a.a.projectExists(r))throw Error("Duplicate name!<br>A project with the same name already exists.");o=await Promise.all(l),n=await Promise.all(s)}catch(e){return e}return!0},async result(e){const i=e.getElementById("prefer_new"),a=e.getElementById("prefer_old"),r=i.checked?i.value:a.value,l=e.getElementById("name");return{projectFiles:o,globalFiles:n,name:l.value,collision:r,settings:t}},change:{file:(o,i)=>{const a=i.getElementById("name");!async function(o,i){const a=await new Promise((e,t)=>{const i=new FileReader;i.onload=()=>e(i.result),i.readAsArrayBuffer(o.files[0])});e=await r.a.loadAsync(a),t=JSON.parse(await e.file("settings.json").async("text")),i.value=t.name}(o.target,a)},globals:(e,t)=>{const o=t.getElementById("collision"),i=e.target.checked?"block":"none";o.style.display=i}}}}function c(e){return{title:"Download Project",submit:"Download",abort:"Cancel",content:i.c`
            <li>
                <label for="name">Name</label>
                <input id="name" type="text" placeholder="name" autocomplete="off" value="${e.name}.zip">
            </li>
            <li>
                <label>Options</label>
                <ul class="options">
                    <li>
                        <label for="globals">Include global files</label>
                        <input id="globals" type="checkbox">
                    </li>
                </ul>
            </li>
        `,init:async e=>{e.getElementById("globals").checked=!1}}}function d(e){return{title:"Permanently Delete Project",submit:"Delete",abort:"Cancel",content:i.c`
            <li><p>Are you sure you want to <em>permanently<em> delete the project '${e.name}'?<br>
            This operation can not be undone!</p></li>
        `}}function p(e){return{title:"Create File",submit:"Create File",abort:"Cancel",content:i.c`
            <li>
                <label for="projectId">Visibility</label>
                <select id="projectId">
                    <option value="${e}">Project</option>
                    <option value="0">Global</option>
                </select>
            </li>
            <li>
                <label for="name">Name</label>
                <input id="name" type="text" placeholder="filename">
                <select id="type">
                    <option value="js">.js</option>
                    <option value="json">.json</option>
                    <option value="pl">.pl</option>
                    <option value="md">.md</option>
                </select>
            </li>
        `,init:async e=>{const t=e.getElementById("name"),o=e.getElementById("type"),i=e.getElementById("projectId");t.value="",o.selectedIndex=0,i.selectedIndex=0},check:async e=>{const t=Number(e.projectId);return 0===e.name.length?Error("Empty filename!<br>Every file must have a name."):e.name.match(/^[a-zA-Z0-9_-]+$/)?!await a.a.fileExists(t,`${e.name}.${e.type}`)||Error("Duplicate name!<br>A file with the same name and ending already exists."):Error("Invalid character!<br>Only numbers, letters, _ and - are allowed.")}}}function m(e){let t;return{title:"Upload File",submit:"Upload",abort:"Cancel",content:i.c`
            <li>
                <label for="file">File</label>
                <input id="file" type="file">
            </li>
            <li>
                <label for="projectId">Visibility</label>
                <select id="projectId">
                    <option value="${e}">Project</option>
                    <option value="0">Global</option>
                </select>
            </li>
            <li>
                <label for="name">Name</label>
                <input id="name" type="text" placeholder="filename">
                <select id="type">
                    <option value="js">.js</option>
                    <option value="json">.json</option>
                    <option value="pl">.pl</option>
                    <option value="md">.md</option>
                    <option value="png">.png</option>
                    <option value="jpg">.jpg</option>
                </select>
            </li>
        `,init:async e=>{const t=e.getElementById("file"),o=e.getElementById("name"),i=e.getElementById("type"),a=e.getElementById("projectId");t.value="",o.value="",i.selectedIndex=0,a.selectedIndex=0},check:async e=>{const o=Number(e.projectId),i=`${e.name}.${e.type}`;return 0===e.name.length?Error("Empty filename!<br>Every file must have a name."):e.name.match(/^[a-zA-Z0-9_-]+$/)?await a.a.fileExists(o,i)?Error("Duplicate name!<br>A file with the same name and ending already exists."):(t.projectId=o,t.name=i,!0):Error("Invalid character!<br>Only numbers, letters, _ and - are allowed.")},result:async e=>({...t}),change:{file:(o,i)=>{const a=i.getElementById("name"),n=i.getElementById("type");!async function(o,i,a){const n=o.files[0],r=n.name,l=await new Promise((e,t)=>{const o=new FileReader;o.onload=()=>{o.result instanceof ArrayBuffer?e(new Blob([o.result])):"string"==typeof o.result?e(o.result):t("invalid file")},/\.(png|jpe?g)$/.test(r)?o.readAsArrayBuffer(n):/\.(js|pl|json|md)$/.test(r)?o.readAsText(n):t("invalid file type")}),[s,c]=r.split(".");i.value=s,[...a.options].some((e,t)=>e.value==c&&(a.selectedIndex=t,!0)),t={name:r,content:l,projectId:e}}(o.target,a,n)}}}}function u(e){const t=0===e.projectId?"global":"project";return{title:"Delete File",submit:"Yes Delete",abort:"No",content:i.c`
            <li><p>Are you sure you want to <em>permanently</em> delete the <em>${t}</em> file '${e.name}'?</p></li>`}}}}]);