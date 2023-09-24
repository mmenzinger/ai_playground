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

export async function getScenarios(): Promise<{[key:string]: ScenarioTemplates}> {
    let scenarios:{[key:string]: ScenarioTemplates} = {
        Examples: {
            name: 'Examples',
            templates: {},
            files: [],
        },
    };

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

    const paths  = __SCENARIO_DIRECTORY_LIST__.map(path => path.replace('src/', ''));
    for(const path of paths){
        const parts = path.split('/');
        let i = 1; // skip src
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
            
            const response = await fetch(path);
            files.push(await getBasicFile(parts[parts.length-1], response));
        }
    }
    return scenarios;
}

async function getBasicFile(filename: string, response: Response): Promise<BasicFile>{
    let content;
    switch(response.headers.get("Content-Type")?.split('/')[0]){
        case 'application':
        case 'text':
            content = await response.text();
            break;
        default:
            content = await response.blob();
    }
    return {
        name: filename,
        content,
    }
}