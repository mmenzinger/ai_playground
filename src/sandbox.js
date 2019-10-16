let worker;

window.simTerminate = () => {
    if(worker)
        worker.terminate();
    worker = undefined;
}

window.simStart = (files, state) => {
    return new Promise((resolve, reject) => {
        const timeout = setTimeout(() => {
            simTerminate();
            reject(Error('timeout'));
        }, 1000);
        if (worker) {
            worker.terminate();
        }
        worker = new Worker(`scenario-worker.js#project/1`/*, { type: "module" }*/); // waiting for module support...
        const channel = new MessageChannel();
        channel.port1.onmessage = m => {
            console.log(m.data.type);
            clearTimeout(timeout);
            resolve();
        }
        worker.postMessage({ type:'start', files, state }, [channel.port2]);
    });
}

window.simUpdate = (state, actions) => {
    return new Promise((resolve, reject) => {
        if (worker) {
            const timeout = setTimeout(() => {
                simTerminate();
                reject(Error('timeout'));
            }, 1000);
            const channel = new MessageChannel();
            channel.port1.onmessage = m => {
                console.log(m.data.type);
                clearTimeout(timeout);
                resolve();
            }
            worker.postMessage({ type:'update', state, actions }, [channel.port2]);
        }
        else {
            reject(Error('no scenario loaded!'));
        }
    });
}