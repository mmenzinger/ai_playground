
/*var code = 'self.postMessage({text: "sandbox created"});';
var url = window.URL.createObjectURL(
    new Blob([code], {type: 'text/javascript'})
);

var worker = new Worker(url);

// forwarding messages to parent
worker.addEventListener('message', function(m) {
    parent.postMessage(m.data, '*');
});*/

let worker;

window.addEventListener('message', m => {
    if (m.origin !== 'null' && m.source === parent) {
        switch (m.data.type) {
            case 'init':
                simInit(m.data.code);
                break;

            case 'update':
                simUpdate();
                break;

            case 'load_scenario':
                loadScenario(m.data.name);
                break;
        }

    }
    //parent.postMessage(m.data, '*');
    //parent.postMessage({type: 'result'}, '*');
});

onload = () => {
    parent.postMessage({type: 'sandbox_status', status: 'online'}, '*');
}

function loadScenario(name) {
    console.log("load scneario", name);
    if (worker) {
        worker.terminate();
    }

    worker = new Worker(`${name}.js`, { type: "module" });
}

function simInit(code) {
    if (worker) {
        worker.postMessage({ type:'init', code });
    }
    else {
        throw Error('no scneario loaded!');
    }
}

function simUpdate() {
    if (worker) {
        worker.postMessage({ type:'update' });
    }
    else {
        throw Error('no scneario loaded!');
    }
}