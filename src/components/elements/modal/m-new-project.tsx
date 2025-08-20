import { useState, useEffect, forwardRef, useMemo } from 'react';
import { ScenarioTemplates } from '@src/scenario-utils';
import { Modal } from '@elements/modal';
import store from '@store';
import { Select, Input } from 'react-daisyui';

export type NewProjectModalResult = {
    scenario: string;
    template: string;
    name: string;
};

export const NewProjectModal = forwardRef((props: {
    scenarios: Map<string, ScenarioTemplates>;
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
            const scenarioTemplate = props.scenarios.get(scenario);
            const projectTemplate = scenarioTemplate?.templates.get(template);
            const templateScenario = projectTemplate?.scenario;
            if(templateScenario){
                projectTemplate.files.push(...props.scenarios.get(templateScenario)?.files || []);
                return await store.project.createProject(
                    name,
                    projectTemplate.scenario,
                    projectTemplate.files
                );
            }
            else{
                throw Error(`Scenario '${templateScenario}' not found`);
            }
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
        <Modal ref={ref} title="New Project" submitName="create" onSubmit={onSubmit} error={error}>
            <>
                <label className="label cursor-pointer" htmlFor="scenario">Scenario</label>
                <Select className="w-full" id="scenario" size="lg" value={scenario} onChange={(e) => setScenario(e.target.value)}>
                    {scenarios}
                </Select>

                <label className="label cursor-pointer" htmlFor="template">Template</label>
                <Select className="w-full" id="template" size="lg" value={template} onChange={(e) => setTemplate(e.target.value)}>
                    {templates}
                </Select>

                <label className="label cursor-pointer" htmlFor="name">Name</label>
                <Input className="w-full" size="lg" id="name" type="text" onChange={(e) => setName(e.target.value)} value={name} />
            </>
        </Modal>
    );
});

function getScenarios(scenarios: Map<string, ScenarioTemplates>) {
    return Array.from(scenarios.values()).map((scenario) => (
        <option value={scenario.name} key={scenario.name}>
            {scenario.name}
        </option>
    ));
}

function getTemplates(
    scenarios: Map<string, ScenarioTemplates>,
    scenario: string
) {
    return Array.from(scenarios.get(scenario)?.templates.entries() || [])
        .map(([key, template]) => (
        <option value={key} key={key}>
                {template.name}
            </option>
        ));
}