import React from 'react';
import { BrowserRouter as Router, Switch, Route } from 'react-router-dom';

import store from '@store';

import Header from './pages/header';
import Modal from './elements/modal';
import ProjectIndex from './pages/project-index';
import Project from './pages/project';
import News from './pages/news';
import Impressum from './pages/impressum';
import Welcome from './pages/welcome';

import './app-light.scss';

export function App() {
    if (store.settings.getLocal('firstTime', true)) {
        return <Welcome />;
    }

    return (
        <Router>
            <Modal />
            <Header title="AI Playground" />
            <Switch>
                <Route path="/news">
                    <News />
                </Route>
                <Route path="/impressum">
                    <Impressum />
                </Route>
                <Route path="/documentation">
                    <p>documentation</p>
                </Route>
                <Route path="/welcome">
                    <Welcome />
                </Route>
                <Route path="/project/:id/:name">
                    <Project />
                </Route>
                <Route path="/">
                    <ProjectIndex />
                </Route>
                <Route>
                    <p>404</p>
                </Route>
            </Switch>
        </Router>
    );
}

export default App;
