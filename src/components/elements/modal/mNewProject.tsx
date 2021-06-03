import React, { Component } from 'react';
import { Form, Row, Col } from 'react-bootstrap';
import { getScenarios, ScenarioTemplates } from '@src/webpack-utils';
import appStore from '@src/store/app-store';

type State = {
    scenarios: JSX.Element[];
    templates: JSX.Element[];
    scenario: string;
    template: string;
    name: string;
};

type ReturnValue = {
    scenario: string;
    template: string;
    name: string;
};

type Props = {
    scenarios: { [key: string]: ScenarioTemplates };
    callback: (data: any) => void;
};

class NewProjectModal extends Component<Props> {
    static defaultProps = {
        scenarios: {},
        callback: () => {},
    };

    state: State = {
        scenarios: [<></>],
        templates: [<></>],
        scenario: '',
        template: '',
        name: '',
    };

    constructor(props: Props) {
        super(props);

        const scenarios = Object.values(this.props.scenarios).map(
            (scenario) => (
                <option value={scenario.name} key={scenario.name}>
                    {Object.values(scenario.name)}
                </option>
            )
        );
        const scenario = Object.values(this.props.scenarios)[0].name;
        const templates = this.getTemplates(scenario);
        const template = templates[0].key as string;
        const name = template;

        this.state = { scenarios, templates, scenario, template, name };
        this.updateResult({ scenario, template, name });
    }

    render() {
        console.log(this.state.scenarios);
        console.log(this.state.templates);
        return (
            <Form>
                <Form.Group as={Row} controlId="scenario">
                    <Form.Label column sm="2">
                        Scenario
                    </Form.Label>
                    <Col sm="10">
                        <Form.Control
                            as="select"
                            onChange={this.onChangeScenario.bind(this)}
                            value={this.state.scenario}
                        >
                            {this.state.scenarios}
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
                            onChange={this.onChangeTemplate.bind(this)}
                            value={this.state.template}
                        >
                            {this.state.templates}
                        </Form.Control>
                    </Col>
                </Form.Group>
                <Form.Group as={Row} controlId="template">
                    <Form.Label column sm="2">
                        Name
                    </Form.Label>
                    <Col sm="10">
                        <Form.Control
                            type="text"
                            onChange={this.onChangeName.bind(this)}
                            value={this.state.name}
                        />
                    </Col>
                </Form.Group>
            </Form>
        );
    }

    getTemplates(scenario: string) {
        return Object.entries(getScenarios()[scenario].templates)
            .sort((a, b) => a[1].name.localeCompare(b[1].name))
            .map(([key, template]) => (
                <option value={key} key={key}>
                    {template.name}
                </option>
            ));
    }

    updateResult(obj: {}) {
        this.props.callback(obj);
    }

    onChangeScenario(event: any) {
        const templates = this.getTemplates(event.target.value);
        const template = templates[0].key as string;
        const scenario = event.target.value;
        const name = template;
        this.setState({
            scenario,
            templates,
            template,
            name,
        });
        this.updateResult({ scenario, template, name });
    }

    onChangeTemplate(event: any) {
        const template = event.target.value;
        const name = template;
        this.setState({ template, name });
        this.updateResult({ template, name });
    }

    onChangeName(event: any) {
        const name = event.target.value;
        this.setState({ name });
        this.updateResult({ name });
    }
}

export default async function showNewProjectModal(scenarios: {
    [key: string]: ScenarioTemplates;
}): Promise<ReturnValue> {
    let result = {
        scenario: '',
        template: '',
        name: '',
    };

    // TODO: remove indirection and just use appStore defer for value transfer
    await appStore.showModal({
        title: 'New Project',
        submit: 'Create',
        cancel: 'Cancel',
        body: (
            <NewProjectModal
                scenarios={scenarios}
                callback={(data) => {
                    result = { ...result, ...data };
                }}
            />
        ),
    });

    return result;
}
