import { File } from '@store/types';

export type ScenarioTemplate = {
    name: string,
    scenario: string,
    files: File[],
};

export type ScenarioTemplates = {
    name: string,
    templates: {[key:string]: ScenarioTemplate},
    examples: {[key:string]: ScenarioTemplate},
    files: File[],
}

export function getScenarios(): {[key:string]: ScenarioTemplates} {
    const rc = require.context('@src/scenario', true, /\.[a-z]+$/i);
    const paths = rc.keys().filter(path => new RegExp(`/[^/]+/`).test(path));
    const scenarios: {[key:string]: ScenarioTemplates} = {
        Examples: {
            name: 'Examples',
            templates: {},
            examples: {},
            files: [],
        },
    };
    paths.forEach(path => {
        const match = path.match(new RegExp(`^\./([^/~]+)/?(templates|examples|assets)?/?([^/]+)?/([^/]+)$`));
        if(match){
            const type = match[1];
            const folder = match[2];
            const name = match[3];
            const filename = match[4];
    
            scenarios[type] = scenarios[type] || {
                name: type,
                templates: {},
                examples: {},
                files: [],
            }
            if(!folder){
                // @ts-ignore
                const raw = require(`@src/scenario/${type}/${filename}`).default;
                scenarios[type].files.push(
                    getFile(filename, raw)
                )
            }
            if(folder === 'assets'){
                const raw = require(`@src/scenario/${type}/${folder}/${filename}`).default;
                scenarios[type].files.push(
                    getFile(filename, raw)
                )
            }
            if(folder === 'examples'){
                scenarios.Examples.templates[name] = scenarios.Examples.templates[name] || {
                    name: name,
                    scenario: type,
                    files: [],
                }
                const raw = require(`@src/scenario/${path.substring(2)}`).default;
                scenarios.Examples.templates[name].files.push(
                    getFile(filename, raw)
                );
            }

            if(folder && folder !== 'assets'){
                // @ts-ignore
                scenarios[type][folder][name] = scenarios[type][folder][name] || {
                    name,
                    scenario: type,
                    files: [],
                }

                
                const raw = require(`@src/scenario/${path.substring(2)}`).default;
                // @ts-ignore
                scenarios[type][folder][name].files.push(
                    getFile(filename, raw)
                );
            }
        }
        else{
            const match = path.match(new RegExp(`^\./~Examples/([^/]+)/([^/]+)$`));
            if(match){
                const name = match[1];
                const filename = match[2];
                
                scenarios.Examples.templates[name] = scenarios.Examples.templates[name] || {
                    name: name,
                    scenario: undefined,
                    files: [],
                }
                const raw = require(`@src/scenario/${path.substring(2)}`).default;
                scenarios.Examples.templates[name].files.push(
                    getFile(filename, raw)
                );
            }
        }
    });
    return scenarios;
}

function getFile(filename: string, raw: any): File{
    let content = raw;
    if(/\.(png|jpe?g|gif)$/.test(filename)){
        const [match, contentType, base64] = raw.match(/^data:(.+);base64,(.*)$/);
        content = base64toBlob(base64);
    }
    // @ts-ignore
    return {
        name: filename,
        content,
    }
}

export function getTemplates() {
    const templates = [];
    for (let scenario of Object.values(getScenarios())) {
        for (let template of Object.values(scenario.templates)) {
            template.files.push(...scenario.files);
            templates.push(template);
        }
    }
    return templates;
}

export function getExamples() {
    const examples = [];
    for (let scenario of Object.values(getScenarios())) {
        for (let example of Object.values(scenario.examples)) {
            example.files.push(...scenario.files);
            examples.push(example);
        }
    }
    return examples;
}

// Convert the base64 to a Blob
// Souce: https://stackoverflow.com/a/20151856/626911
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