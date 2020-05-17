type File = {
    name: string,
    content: string,
}

export type ScenarioTemplate = {
    name: string,
    scenario: string,
    files: File[],
};

export type ScenarioTemplates = {
    name: string,
    component: string,
    templates: {[key:string]: ScenarioTemplate},
    examples: {[key:string]: ScenarioTemplate},
    description: {
        name: string,
        content: string,
    }
}

export function getScenarios(): {[key:string]: ScenarioTemplates} {
    const rc = require.context('@src/scenario', true, /\.[a-z]+$/i);
    const paths = rc.keys().filter(path => new RegExp(`/(templates|examples)/[^/]+/[^/]+$`).test(path));
    const scenarios: {[key:string]: ScenarioTemplates} = {};
    paths.forEach(path => {
        const match = path.match(new RegExp(`^\./([^/]+)/(templates|examples)/([^/]+)/([^/]+)$`));
        if(match){
            const type = match[1];
            const folder = match[2];
            const name = match[3];
            const filename = match[4];
    
            scenarios[type] = scenarios[type] || {
                name: type,
                templates: {},
                examples: {},
                description: {
                    name: 'scenario.md',
                    content: require(`@src/scenario/${type}/scenario.md`).default,
                }
            }
            // @ts-ignore
            scenarios[type][folder][name] = scenarios[type][folder][name] || {
                name,
                scenario: type,
                files: [],
            }
            // @ts-ignore
            scenarios[type][folder][name].files.push({
                name: filename,
                content: require(`@src/scenario/${path.substring(2)}`).default,
            });
        }
    });
    const components = rc.keys().filter(path => new RegExp(`/scenario-[^/]+\.(js|ts)$`).test(path));
    components.forEach(component => {
        const match = component.match(new RegExp(`^\./([^/]+)/([^/]+)\.(js|ts)$`));
        if(match){
            const type = match[1];
            const name = match[2];
            scenarios[type].component = name;
        }
    });

    return scenarios;
}

export function getTemplates() {
    const templates = [];
    for (let scenario of Object.values(getScenarios())) {
        for (let template of Object.values(scenario.templates)) {
            template.files.push(scenario.description);
            templates.push(template);
        }
    }
    return templates;
}

export function getExamples() {
    const examples = [];
    for (let scenario of Object.values(getScenarios())) {
        for (let example of Object.values(scenario.examples)) {
            example.files.push(scenario.description);
            examples.push(example);
        }
    }
    return examples;
}

export function getComponents() {
    const components = [];
    for (let scenario of Object.values(getScenarios())) {
        components.push(scenario.component);
    }
    return components;
}