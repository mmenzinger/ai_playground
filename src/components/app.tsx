import 'bootstrap/dist/css/bootstrap.min.css';

import React, { Component } from 'react';
import {
    BrowserRouter as Router,
    Switch,
    Route,
    Redirect,
} from 'react-router-dom';

import Header from './pages/header';
import Modal from './elements/modal';
import ProjectIndex from './pages/project-index';
import { Project } from './pages/project';

// import './global-style.css';

export class App extends Component<{}> {
    render() {
        return (
            <Router>
                <Modal />
                <Header title="AI Playground" />
                <Switch>
                    <Route path="/404">
                        <p>404</p>
                    </Route>
                    <Route path="/news">
                        <p>news</p>
                    </Route>
                    <Route path="/impressum">
                        <p>impressum</p>
                    </Route>
                    <Route path="/documentation">
                        <p>documentation</p>
                    </Route>
                    <Route path="/welcome">
                        <p>welcome</p>
                    </Route>
                    <Route path="/project/:id/:name">
                        <Project />
                    </Route>
                    <Route path="/">
                        <ProjectIndex />
                    </Route>
                </Switch>
            </Router>
        );
    }
}

export default App;
