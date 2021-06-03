import 'bootstrap/dist/css/bootstrap.min.css';

import React, { Component } from 'react';
import {
    BrowserRouter as Router,
    Switch,
    Route,
    Redirect,
    useLocation,
} from 'react-router-dom';

import Header from './pages/header';
import Modal from './elements/modal';
import ProjectIndex from './pages/project-index';

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
                    <Route path="/project/:id">
                        <p>project</p>
                    </Route>
                    <Route path="/projects">
                        <ProjectIndex />
                    </Route>
                    <Route path="/">
                        <Redirect to="/projects" />
                    </Route>
                </Switch>
            </Router>
        );
    }
}

export default App;
