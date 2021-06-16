export type BasicFile = {
    name: string,
    content: string | Blob | BasicFile[],
};

export type ScenarioTemplate = {
    name: string,
    scenario: string,
    files: BasicFile[],
};

export type ScenarioTemplates = {
    name: string,
    templates: {[key:string]: ScenarioTemplate},
    files: BasicFile[],
}

export function getScenarios(): {[key:string]: ScenarioTemplates} {
    let scenarios:{[key:string]: ScenarioTemplates} = {
                Examples: {
                    name: 'Examples',
                    templates: {},
                    files: [],
                },
            };
    const context = require.context('@src/scenario', true, /\.[a-z]+$/i);
    const paths = context.keys().filter(path => new RegExp(`/[^/]+/`).test(path));

    function getOrCreateFolder(files: BasicFile[], filename: string){
        for(const folder of files){
            if(folder.name === filename)
                return folder;
        }
        const folder: BasicFile = {
            name: filename,
            content: [],
        }
        files.push(folder);
        return folder;
    }

    for(const path of paths){
        const parts = path.split('/');
        let i = 1;
        let scenario = parts[i++];
        let template = undefined;
        if(parts[i] === '~examples'){
            scenario = 'Examples';
            template = parts[i+1];
            i+=2;
        }
        else if(parts[i] === '~templates'){
            template = parts[i+1];
            i+=2;
        }

        if(scenario){
            if(!scenarios[scenario]){
                scenarios[scenario] =  {
                    name: scenario,
                    templates: {},
                    files: [],
                }
            }
            if(template && !scenarios[scenario].templates[template]){
                scenarios[scenario].templates[template] = {
                    name: template,
                    scenario: parts[1],
                    files: [],
                }
            }
            let files = template ? scenarios[scenario].templates[template].files : scenarios[scenario].files;
            for(; i < parts.length-1; i++){
                const folder = getOrCreateFolder(files, parts[i])
                files = folder.content as BasicFile[];
            }
            // ts-ignore
            const raw = require(`@src/scenario/${path.slice(2)}`).default;
            files.push(getBasicFile(parts[parts.length-1], raw))
        }
    }
    return scenarios;
}

function getBasicFile(filename: string, raw: any): BasicFile{
    let content = raw;
    if(/\.(png|jpe?g|gif)$/.test(filename)){
        const [_match, _contentType, base64] = raw.match(/^data:(.+);base64,(.*)$/);
        content = base64toBlob(base64);
    }
    return {
        name: filename,
        content,
    }
}

// Convert the base64 to a Blob
// Source: https://stackoverflow.com/a/20151856/626911
function base64toBlob(base64Data: string, contentType?: string) {
    contentType = contentType || '';
    var sliceSize = 1024;
    var byteCharacters = atob(base64Data);
    var bytesLength = byteCharacters.length;
    var slicesCount = Math.ceil(bytesLength / sliceSize);
    var byteArrays = new Array(slicesCount);

    for (var sliceIndex = 0; sliceIndex < slicesCount; ++sliceIndex) {
        var begin = sliceIndex * sliceSize;
        var end = Math.min(begin + sliceSize, bytesLength);

        var bytes = new Array(end - begin);
        for (var offset = begin, i = 0; offset < end; ++i, ++offset) {
            bytes[i] = byteCharacters[offset].charCodeAt(0);
        }
        byteArrays[sliceIndex] = new Uint8Array(bytes);
    }
    return new Blob(byteArrays, { type: contentType });
}