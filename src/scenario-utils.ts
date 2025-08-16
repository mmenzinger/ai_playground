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
    templates: Map<string, ScenarioTemplate>,
    files: BasicFile[],
}

export async function getScenarios(): Promise<Map<string, ScenarioTemplates>> {
    let scenarios = new Map<string, ScenarioTemplates>();
    scenarios.set('Examples', {
        name: 'Examples',
        templates: new Map<string, ScenarioTemplate>(),
        files: [],
    });

    function getFileIfExists(files: BasicFile[], filename: string): BasicFile | undefined {
        return files.find(file => file.name === filename);
    }

    function stripNumbering(name: string){
        const matches = name.match(/^\d+~(.*)$/);
        if (matches) {
            return matches[1];
        }
        return name;
    }

    const paths  = __SCENARIO_DIRECTORY_LIST__.map(path => path.replace('src/scenario/', ''));
    for(const path of paths){
        const parts = path.split('/');
        let i = 0;
        let scenario = parts[i++];
        let template = undefined;
        if(parts[i] === '~examples'){
            scenario = 'Examples';
            template = stripNumbering(parts[i+1]);
            i+=2;
        }
        else if(parts[i] === '~templates'){
            template = stripNumbering(parts[i+1]);
            i+=2;
        }

        if(!scenarios.get(scenario)){
            scenarios.set(scenario,{
                name: scenario,
                templates: new Map<string, ScenarioTemplate>(),
                files: [],
            });
        }
        if(template && !scenarios.get(scenario)?.templates.get(template)){
            scenarios.get(scenario)?.templates.set(template, {
                name: template,
                scenario: parts[0],
                files: [],
            });
        }
        let files = (template ? scenarios.get(scenario)?.templates.get(template)?.files : scenarios.get(scenario)?.files) || [];
        let folder = undefined;
        for(; i < parts.length-1; i++){
            const foldername = parts[i];
            folder = getFileIfExists(files, foldername);
            if(!folder){
                folder = {
                    name: foldername,
                    content: [],
                }
                files.push(folder);
            }
            // step into each folder and set as base for new file
            files = folder.content as BasicFile[];
        }

        const response = await fetch(`scenario/${path}`);
        const newFile = await getBasicFile(parts[parts.length-1], response);
        files.push(newFile);
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
            // .pl files have no content-type...
            // if file ends with .pl, get as text
            if (filename.endsWith('.pl')) {
                content = await response.text();
            } else {
                content = await response.blob();
            }
    }
    return {
        name: filename,
        content,
    }
}