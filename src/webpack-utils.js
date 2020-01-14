export function getScenarios(){
    const rc = require.context('scenarios', true, /\.[a-z]+$/i);
    const paths = rc.keys().filter(path => new RegExp(`/(templates|examples)/[^/]+/[^/]+$`).test(path));
    const scenarios = {};
    paths.forEach(path => {
        const match = path.match(new RegExp(`^\./([^/]+)/(templates|examples)/([^/]+)/([^/]+)$`));
        const type = match[1];
        const folder = match[2];
        const name = match[3];
        const filename = match[4];

        scenarios[type] = scenarios[type] || {
            name: type,
            templates: {},
            examples: {},
        }
        scenarios[type][folder][name] = scenarios[type][folder][name] || {
            name,
            scenario: type,
            files: [],
        }
        scenarios[type][folder][name].files.push({
            name: filename,
            content: require(`scenarios/${path.substring(2)}`).default,
        });
    });
    return scenarios;
}

export function getTemplates(){
    const templates = [];
    for(let scenario of Object.values(getScenarios())){
        for( let template of Object.values(scenario.templates)){
            templates.push(template);
        }
    }
    return templates;
}

export function getExamples(){
    const examples = [];
    for(let scenario of Object.values(getScenarios())){
        for( let example of Object.values(scenario.examples)){
            examples.push(example);
        }
    }
    return examples;
}