// import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';

import store from '@store';

import Header from './elements/header';
import ModalHandler, {ModalHandlerFunctions} from '@elements/modal/modal-handler';
import ProjectIndex from './pages/project-index';
import Project from './pages/project';
import News from './pages/news';
import Impressum from './pages/impressum';
import Welcome from './pages/welcome';

import './app.css';
import { useEffect, useRef } from 'react';

export function App() {
    if (store.settings.getLocal('firstTime', true)) {
        return <Welcome />;
    }

    const modalRef = useRef<ModalHandlerFunctions>(null);
    useEffect(() => {
        store.app.modalHandler = modalRef.current;
    }, [modalRef]);

    return (
        <Router>
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
            <ModalHandler ref={modalRef} />
        </Router>
    );
}

export default App;
