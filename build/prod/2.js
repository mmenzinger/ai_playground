(window.webpackJsonpLIB=window.webpackJsonpLIB||[]).push([[2,18],{104:function(t,e,o){"use strict";o.r(e),o.d(e,"ModalGeneric",(function(){return l}));var a=o(35),n=o(56),i=o(88),s=o(268),d=o(70),r=a.b`ul.options > li{
    padding: 0;
}
ul.options > li > *{
    max-width: 100%;
}
ul.options > li > input:last-child{
    max-width: 1em;
}`;class l extends i.a{constructor(...t){super(...t),this.data=void 0,this._error=void 0}static get properties(){return{...super.properties,data:{type:Object}}}static get styles(){return[d.a,r]}render(){return this.data?a.c`
                <form autocomplete="off" action="javascript:void(0);">
                    <header>
                        <h1>${this.data.title}</h1>
                    </header>
                    <ul>
                        ${this.data.content}
                        <li id="error" style="display:none"></li>
                    </ul>
                    <footer>
                        <button id="no" class="error" @click=${this.onAbort}>${this.data.abort}</button>
                        <button id="yes" class="ok" @click=${this.onSubmit}>${this.data.submit}</button>
                    </footer>
                </form>
            `:a.c``}updated(){const t=this.shadowRoot;if(t){this.data&&this.data.init&&this.data.init(t);const e=t.querySelector("input");if(e&&e.focus(),this.data&&this.data.change)for(let[e,o]of Object.entries(this.data.change)){const a=t.getElementById(e);null==a||a.addEventListener("change",e=>o(e,t))}const o=t.querySelectorAll("input");for(const t of o)t.onkeydown=t=>{["Escape","Enter"].includes(t.key)&&(this.onKeyDown(t.key),t.preventDefault())};const a=t.getElementById("error");a.innerHTML="",a.style.display="none"}}async onSubmit(){var t;const e=null===(t=this.shadowRoot)||void 0===t?void 0:t.getElementById("error");try{var o;let t;const a={},i=null===(o=this.shadowRoot)||void 0===o?void 0:o.querySelectorAll("input,select");if(i&&i.forEach(t=>{const e=t;switch(e.type){case"checkbox":a[e.id]=e.checked;break;case"file":a[e.id]=e.files;break;default:a[e.id]=e.value}}),this.data.check){const t=await this.data.check(a);if(t instanceof Error)throw t}t=this.data.result&&this.shadowRoot?this.data.result(this.shadowRoot):a,e.style.display="none",e.innerHTML="",n.a.resolveModal(t)}catch(t){e.style.display="block",e.innerHTML=`<p>${t}</p>`}}onAbort(){this._error=null,n.a.rejectModal(new s.ModalAbort)}onKeyDown(t){switch(t){case"Escape":this.onAbort();break;case"Enter":this.onSubmit()}}}window.customElements.define("modal-generic",l)},268:function(t,e,o){"use strict";o.r(e),o.d(e,"Modals",(function(){return r})),o.d(e,"ModalAbort",(function(){return l}));var a=o(35),n=o(71),i=o(56),s=o(70),d=a.b`#background{
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
}`;let r;!function(t){t.GENERIC="generic"}(r||(r={}));class l extends Error{}class c extends n.a{static get styles(){return[s.a,d]}render(){var t;let e=null===(t=i.a.modal)||void 0===t?void 0:t.template;return a.c`
            <div id="background" ?active="${null!==i.a.modal}">
                <div id="content">
                    <modal-generic id="${r.GENERIC}" class="modal" ?active="${e===r.GENERIC}"></modal-generic>
                </div>
            </div>
        `}updated(){if(i.a.modal){var t;const e=i.a.modal.template;(null===(t=this.shadowRoot)||void 0===t?void 0:t.getElementById(e)).data=i.a.modal.data}}firstUpdated(){window.onkeydown=t=>{const e=["Escape"];if(i.a.reportOpen||e.push("Enter"),i.a.modal&&e.includes(t.key)){var o;const e=i.a.modal.template,a=null===(o=this.shadowRoot)||void 0===o?void 0:o.getElementById(e);a&&a.onKeyDown&&a.onKeyDown(t.key),t.preventDefault()}}}}window.customElements.define("c4f-modal",c)}}]);