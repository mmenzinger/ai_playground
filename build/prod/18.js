(window.webpackJsonpLIB=window.webpackJsonpLIB||[]).push([[18],{268:function(e,o,t){"use strict";t.r(o),t.d(o,"Modals",(function(){return r})),t.d(o,"ModalAbort",(function(){return c}));var a=t(35),n=t(71),d=t(56),i=t(70),l=a.b`#background{
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
}`;let r;!function(e){e.GENERIC="generic"}(r||(r={}));class c extends Error{}class s extends n.a{static get styles(){return[i.a,l]}render(){var e;let o=null===(e=d.a.modal)||void 0===e?void 0:e.template;return a.c`
            <div id="background" ?active="${null!==d.a.modal}">
                <div id="content">
                    <modal-generic id="${r.GENERIC}" class="modal" ?active="${o===r.GENERIC}"></modal-generic>
                </div>
            </div>
        `}updated(){if(d.a.modal){var e;const o=d.a.modal.template;(null===(e=this.shadowRoot)||void 0===e?void 0:e.getElementById(o)).data=d.a.modal.data}}firstUpdated(){window.onkeydown=e=>{const o=["Escape"];if(d.a.reportOpen||o.push("Enter"),d.a.modal&&o.includes(e.key)){var t;const o=d.a.modal.template,a=null===(t=this.shadowRoot)||void 0===t?void 0:t.getElementById(o);a&&a.onKeyDown&&a.onKeyDown(e.key),e.preventDefault()}}}}window.customElements.define("c4f-modal",s)}}]);