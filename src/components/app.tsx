import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';

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
            <Routes>
                <Route path="/news" element={<News />} />
                <Route path="/impressum" element={<Impressum />} />
                <Route path="/documentation" element={<p>documentation</p>} />
                <Route path="/welcome" element={<Welcome />} />
                <Route path="/project/:id/:name" element={<Project />} />
                <Route path="/" element={<ProjectIndex />} />
                <Route element={<p>404</p>} />
            </Routes>
        </Router>
    );
}

export default App;
