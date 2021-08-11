import React, { useState, useEffect, useRef } from 'react';
import store from '@src/store';
import { StoreMessage } from './utils';
import { project } from '@src/components/pages/project-index/project-index.module.css';
import db from '@src/localdb';

export function Simulator() {
    const iframe = useRef<HTMLIFrameElement>(null);
    const [src, setSrc] = useState<string>('/simulator/default.html');

    const iframeHandler: any = {
        log: (m: MessageEvent) => store.project.publishLogs(m.data.logs),
        store: (m: MessageEvent) => storeFile(m),
    };

    useEffect(() => {
        const channel = new MessageChannel();
        const interval = setInterval(() => {
            const contentWindow = iframe.current?.contentWindow;
            if (contentWindow) {
                // set message port on iframe
                (contentWindow as any).__port = channel.port2;
                clearInterval(interval);

                channel.port1.onmessage = (m) => {
                    const type = m.data.type as string;
                    if (iframeHandler[type]) {
                        iframeHandler[type](m);
                    }
                };
            }
        }, 100);
    }, []);

    return <iframe ref={iframe} src={src} />;
}

async function storeFile(m: MessageEvent) {
    const data: StoreMessage = m.data;
    let projectId = data.projectId || store.project.activeProject?.id;

    if (projectId) {
        try {
            const file = await db.loadFileByName(projectId, data.fileName);
            await store.project.saveFileContent(file.id, data.data);
        } catch (_) {
            await store.project.createFile(data.fileName, projectId, data.data);
        }
        m.ports[0].postMessage(true);
    } else {
        throw Error('no active project');
    }
}

export default Simulator;

// import { html } from 'lit-element';
// import { MobxLitElement } from '@adobe/lit-mobx';
// import projectStore from '@store/project-store';
// import { throttle } from 'lodash-es';
// import { autorun } from 'mobx';

// import '@element/c4f-console';
// import { Sandbox } from '@sandbox';
// import { LogType } from '@store/types';
// import { MessageType, EventMessage, VideoMessage } from '@worker/types';

// // @ts-ignore
// import sharedStyles from '@shared-styles';
// // @ts-ignore
// import style from './ai-simulator.css';

// const NUM_CANVASES = 3;

// class AiSimulator extends MobxLitElement {
//     #sandbox = new Sandbox();
//     #checkCanvasInterval: (number | undefined)[] = new Array(NUM_CANVASES);
//     #cameraStream: MediaStream | null = null;
//     #sendImageData: (() => void) | null = null;

//     static get styles() {
//         return [
//             sharedStyles,
//             style,
//         ];
//     }

//     constructor(){
//         super();
//         this.#sandbox.onUpdateMessages = this.updateMessages.bind(this);
//     }

//     render() {
//         return html`
//             <div id="wrapper">
//                 <header>
//                     <section id="control">
//                         <button class="ok" @click=${this.simRun}>start&nbsp;/&nbsp;restart</button>
//                         <button class="warning" @click=${this.simTrain}>call&nbsp;train</button>
//                         <button class="error" @click=${this.simTerminate}>terminate</button>
//                     </section>
//                     <section id="settings">
//                         <ul>
//                             <li id="video_container">
//                                 <input id="camera" type="checkbox" @click=${this.toggleCamera}>
//                                 <label for="camera">Camera</label>
//                                 <video id="video" poster="assets/interface/loading.gif"></video>
//                             </li>
//                         </ul>
//                     </section>
//                 </header>
//                 <div id="display"></div>
//                 <footer id="messages"></footer>
//             </div>
//         `;
//     }

//     firstUpdated(){
//         autorun(_ => {
//             if(projectStore.activeProject){
//                 this.simRun();
//             }
//             else{
//                 this.simTerminate();
//             }
//         })
//     }

//     async simRun() {
//         await navigator.serviceWorker.ready; // make sure sw is ready
//         projectStore.flushFile();
//         projectStore.clearLog();
//         for (const errors of Object.values(projectStore.activeProject?.errors || {})) {
//             for (const error of errors) {
//                 projectStore.addLog(LogType.ERROR, error.args, error.caller);
//             }
//         }
//         const messages = this.shadowRoot?.getElementById('messages') as HTMLDivElement;
//         messages.innerHTML = '';
//         const canvas = await this.getCanvas();
//         this.#sandbox.call('/project/index.js', 'start', canvas);
//     }

//     async simTrain() {
//         projectStore.flushFile();
//         projectStore.clearLog();
//         for (const errors of Object.values(projectStore.activeProject?.errors || {})) {
//             for (const error of errors) {
//                 projectStore.addLog(LogType.ERROR, error.args, error.caller);
//             }
//         }
//         const canvas = await this.getCanvas();
//         this.#sandbox.call('/project/index.js', 'train', canvas);
//     }

//     async simTerminate() {
//         this.#sandbox.terminate();
//         const msg = `simulation terminated!`;
//         projectStore.addLog(LogType.WARN, [msg]);
//         console.warn(msg);
//     }

//     updateMessages(action: 'set' | 'add', html: string){
//         const messages = this.shadowRoot?.getElementById('messages') as HTMLDivElement;
//         if(messages){
//             if(action === 'set'){
//                 messages.innerHTML = html;
//                 messages.scrollTop = messages.scrollHeight;
//             }
//             else{
//                 messages.innerHTML += html;
//                 messages.scrollTop = messages.scrollHeight;
//             }
//         }
//     }

//     async getCanvas() {
//         return new Promise<OffscreenCanvas[]>((resolve, _) => {
//             const display = this.shadowRoot?.getElementById('display') as HTMLDivElement;
//             let canvases: Promise<HTMLCanvasElement>[] = new Array(NUM_CANVASES);
//             for(let i = 0; i < NUM_CANVASES; i++){
//                 let canvas = this.shadowRoot?.getElementById(`canvas${i}`) as HTMLCanvasElement;
//                 if (canvas) {
//                     display.removeChild(canvas);
//                 }
//                 canvas = document.createElement('canvas');
//                 canvas.id = `canvas${i}`;
//                 canvas.classList.add('layer');
//                 display.appendChild(canvas);

//                 canvases[i] = new Promise<HTMLCanvasElement>((resolve, _) => {
//                     if(this.#checkCanvasInterval[i]){
//                         clearInterval(this.#checkCanvasInterval[i]);
//                     }
//                     this.#checkCanvasInterval[i] = window.setInterval(() => {
//                         if(canvas.clientWidth > 0 && canvas.clientHeight > 0 && this.#checkCanvasInterval){
//                             canvas.width = canvas.clientWidth;
//                             canvas.height = canvas.clientHeight;
//                             clearInterval(this.#checkCanvasInterval[i]);
//                             this.#checkCanvasInterval[i] = undefined;
//                             resolve(canvas);
//                         }
//                     }, 100);
//                 });
//             }

//             Promise.all(canvases).then(canvases => {
//                 if(canvases.length){
//                     const canvas = canvases[canvases.length-1];
//                     canvas.onmousemove = throttle(event => {
//                         const msg = this.getMouseEventMessage(event, canvas, 'onmousemove');
//                         this.#sandbox.sendMessage(msg);
//                     }, 100);
//                     canvas.onmousedown = (event) => {
//                         const msg = this.getMouseEventMessage(event, canvas, 'onmousedown');
//                         this.#sandbox.sendMessage(msg);
//                     }
//                     canvas.onmouseup = event => {
//                         const msg = this.getMouseEventMessage(event, canvas, 'onmouseup');
//                         this.#sandbox.sendMessage(msg);
//                     }
//                 }
//                 resolve(canvases.map(canvas => canvas.transferControlToOffscreen()));
//             });
//         });
//     }

//     async startStream(video: HTMLVideoElement): Promise<void> {
//         if(!this.#cameraStream){
//             const stream = await new Promise((resolve: (stream: MediaStream) => void, reject: any) => {
//                 navigator.getUserMedia({video:true}, resolve, reject);
//             });

//             const [track] = stream.getVideoTracks();
//             const imageCapture = new ImageCapture(track);

//             this.#sendImageData = () => {
//                 imageCapture.grabFrame().then((imageBitmap: ImageBitmap) => {
//                     const msg: VideoMessage = {
//                         type: MessageType.VIDEO,
//                         bitmap: imageBitmap
//                     };
//                     this.#sandbox.sendMessage(msg, [imageBitmap]);
//                 })
//                 .catch((error: any) => {
//                     //console.warn(error);
//                 });

//                 if(this.#sendImageData){
//                     requestAnimationFrame(this.#sendImageData);
//                 }
//             };

//             video.onplay = () => {
//                 if(this.#sendImageData){
//                     requestAnimationFrame(this.#sendImageData);
//                 }
//             };

//             video.srcObject = stream;
//             this.#cameraStream = stream;
//         }
//         video.play();
//     }

//     async stopStream(video: HTMLVideoElement): Promise<void> {
//         if(this.#cameraStream){
//             this.#cameraStream.getTracks().forEach(track => track.stop());
//             this.#cameraStream = null;
//         }
//         video.srcObject = null;
//     }

//     async toggleCamera(_: MouseEvent){
//         const video = this.shadowRoot?.getElementById('video') as HTMLVideoElement;
//         const camera = this.shadowRoot?.getElementById('camera') as HTMLInputElement;
//         if(camera.checked){
//             await this.startStream(video);
//         }
//         else{
//             await this.stopStream(video);
//         }
//     }

//     getMouseEventMessage(event: MouseEvent, target: HTMLElement, callbackName: string) {
//         var rect = target.getBoundingClientRect();
//         var x = event.clientX - rect.left; //x position within the element.
//         var y = event.clientY - rect.top;  //y position within the element.
//         const msg: EventMessage = {
//             type: MessageType.EVENT,
//             callbackName,
//             data: { x, y, width: rect.width, height: rect.height },
//         };
//         return msg;
//     }
// }

// window.customElements.define('ai-simulator', AiSimulator);
