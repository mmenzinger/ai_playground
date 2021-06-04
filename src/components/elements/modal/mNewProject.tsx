import React, { useState, useEffect } from 'react';
import { Form, Row, Col } from 'react-bootstrap';
import { ScenarioTemplates } from '@src/webpack-utils';
import appStore from '@src/store/app-store';

type NewProjectModalResult = {
    scenario: string;
    template: string;
    name: string;
};

function NewProjectModal(props: {
    scenarios: { [key: string]: ScenarioTemplates };
}) {
    const scenarios = getScenarios(props.scenarios);

    const [scenario, setScenario] = useState(scenarios[0].key as string);
    const [templates, setTemplates] = useState(
        getTemplates(props.scenarios, scenario)
    );
    const [template, setTemplate] = useState(templates[0].key as string);
    const [name, setName] = useState(template);

    useEffect(() => {
        setTemplates(getTemplates(props.scenarios, scenario));
    }, [scenario]);

    useEffect(() => {
        setTemplate(templates[0].key as string);
    }, [templates]);

    useEffect(() => {
        setName(template);
    }, [template]);

    useEffect(() => {
        appStore.updateModalResult({ scenario, template, name });
    });

    return (
        <Form>
            <Form.Group as={Row} controlId="scenario">
                <Form.Label column sm="2">
                    Scenario
                </Form.Label>
                <Col sm="10">
                    <Form.Control
                        as="select"
                        onChange={(e) => setScenario(e.target.value)}
                        value={scenario}
                    >
                        {scenarios}
                    </Form.Control>
                </Col>
            </Form.Group>
            <Form.Group as={Row} controlId="template">
                <Form.Label column sm="2">
                    Template
                </Form.Label>
                <Col sm="10">
                    <Form.Control
                        as="select"
                        onChange={(e) => setTemplate(e.target.value)}
                        value={template}
                    >
                        {templates}
                    </Form.Control>
                </Col>
            </Form.Group>
            <Form.Group as={Row} controlId="name">
                <Form.Label column sm="2">
                    Name
                </Form.Label>
                <Col sm="10">
                    <Form.Control
                        type="text"
                        onChange={(e) => setName(e.target.value)}
                        value={name}
                    />
                </Col>
            </Form.Group>
        </Form>
    );
}

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

export async function showNewProjectModal(scenarios: {
    [key: string]: ScenarioTemplates;
}): Promise<NewProjectModalResult> {
    return await appStore.showModal({
        title: 'New Project',
        submit: 'Create',
        cancel: 'Cancel',
        body: <NewProjectModal scenarios={scenarios} />,
    });
}
