import { useState, useEffect, forwardRef, useMemo } from 'react';
// import { Form, Row, Col } from 'react-bootstrap';
import { ScenarioTemplates } from '@src/scenario-utils';
// import appStore from '@src/store/app-store';
import { Modal } from '@elements/modal';
import store from '@store';

export type NewProjectModalResult = {
    scenario: string;
    template: string;
    name: string;
};

export const NewProjectModal = forwardRef((props: {
    scenarios: { [key: string]: ScenarioTemplates };
}, ref: React.Ref<HTMLDialogElement>) => {
    const scenarios = useMemo(() => getScenarios(props.scenarios), [props.scenarios]);
    const [scenario, setScenario] = useState(scenarios[0].key as string);
    const [templates, setTemplates] = useState(
        useMemo(() => getTemplates(props.scenarios, scenario), 
        [props.scenarios, scenario])
    );
    const [template, setTemplate] = useState(templates[0].key as string);
    const [name, setName] = useState(template);
    const [error, setError] = useState<string | undefined>(undefined);

    useEffect(() => {
        setTemplates(getTemplates(props.scenarios, scenario));
    }, [scenario]);

    useEffect(() => {
        setTemplate(templates[0].key as string);
    }, [templates]);

    useEffect(() => {
        setName(template);
    }, [template]);

    async function onSubmit(): Promise<any | undefined>{
        try{
            const scenarioTemplate = props.scenarios[scenario];
            const projectTemplate = scenarioTemplate.templates[template];
            if (projectTemplate.scenario) {
                projectTemplate.files.push(...props.scenarios[projectTemplate.scenario].files);
            }
            
            return await store.project.createProject(
                name,
                projectTemplate.scenario,
                projectTemplate.files
            );
        }
        catch(error: any){
            if(error?.name === 'ConstraintError'){
                setError(`Project with name '${name}' already exists!`);
            }
            else{
                setError(String(error));
            }
        }
        return undefined;
    }

    return (
        <Modal ref={ref} title="New Project" submitName="create" onSubmit={onSubmit} error={error} >
            <>
                <label className="label cursor-pointer" htmlFor="scenario">Scenario</label>
                <select className="select select-bordered select-lg w-full" id="scenario" onChange={(e) => setScenario(e.target.value)} value={scenario}>
                    {scenarios}
                </select>

                <label className="label cursor-pointer" htmlFor="template">Template</label>
                <select className="select select-bordered select-lg w-full" id="template" onChange={(e) => setTemplate(e.target.value)} value={template}>
                    {templates}
                </select>

                <label className="label cursor-pointer" htmlFor="name">Name</label>
                <input className="input input-bordered input-lg w-full" id="name" type="text" onChange={(e) => setName(e.target.value)} value={name} />
            </>
        </Modal>
    );
});

function getScenarios(scenarios: { [key: string]: ScenarioTemplates }) {
    return Object.values(scenarios).map((scenario) => (
        <option value={scenario.name} key={scenario.name}>
            {Object.values(scenario.name)}
        </option>
    ));
}

function getTemplates(
    scenarios: { [key: string]: ScenarioTemplates },
    scenario: string
) {
    return Object.entries(scenarios[scenario].templates)
        .sort((a, b) => a[1].name.localeCompare(b[1].name))
        .map(([key, template]) => (
            <option value={key} key={key}>
                {template.name}
            </option>
        ));
}