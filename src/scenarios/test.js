console.log("worker started");

let code;
onmessage = m => {
    if(m.data.type === 'init'){
        //console.log(m.data.code);#
        code = m.data.code;
        eval(m.data.code);
    }
    if(m.data.type === 'update'){
        console.log(code);
        eval(code);
        update();
    }
}