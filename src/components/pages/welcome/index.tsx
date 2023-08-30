import { useEffect, useState } from 'react';
import { Alert, Button, Spinner } from 'react-bootstrap';
import { messageWithResult } from '@utils';

import store from '@store';

import css from './welcome.module.css';

async function checkServiceWorker(): Promise<JSX.Element | true> {
    return 'serviceWorker' in navigator ? (
        true
    ) : (
        <a href="https://developer.mozilla.org/en-US/docs/Web/API/ServiceWorker">
            ServiceWorker
        </a>
    );
}

async function checkModuleWorker(): Promise<JSX.Element | true> {
    return new Promise(async (resolve, _) => {
        try {
            const worker = new Worker(`/simulator/scenario-worker.js`, {
                type: 'module',
            });
            worker.postMessage({ type: 'setup' });
            const result = await messageWithResult(
                { type: 'setup' },
                5000,
                worker
            );
            if (result.type === 'ready') {
                resolve(true);
            } else {
                resolve(
                    <a href="https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Statements/import">
                        dynamic import inside Workers
                    </a>
                );
            }
            worker.terminate();
        } catch (e) {
            resolve(
                <a href="https://developer.mozilla.org/en-US/docs/Web/API/Worker/Worker">
                    Worker with type module
                </a>
            );
        }
    });
}

async function checkOffscreenCanvas(): Promise<JSX.Element | true> {
    return window.OffscreenCanvas ? (
        true
    ) : (
        <a href="https://developer.mozilla.org/en-US/docs/Web/API/OffscreenCanvas">
            OffscreenCanvas
        </a>
    );
}

async function checkBrowserFeatures(): Promise<JSX.Element[]> {
    return (
        await Promise.all([
            checkServiceWorker(),
            checkModuleWorker(),
            checkOffscreenCanvas(),
        ])
    ).filter((e) => e !== true) as JSX.Element[];
}

function onContinue() {
    store.settings.setLocal('firstTime', false);
    location.href = '/';
}

export function Welcome() {
    const [missingFeatures, setMissingFeatures] = useState<JSX.Element[]>();

    useEffect(() => {
        checkBrowserFeatures().then((missing) => {
            setMissingFeatures(missing);
        });
    }, []);

    const footer = missingFeatures ? (
        <Button
            variant={missingFeatures.length ? 'danger' : 'primary'}
            onClick={onContinue}
        >
            Continue {missingFeatures.length ? 'anyway' : ''}
        </Button>
    ) : (
        <div className={css.check}>
            <Spinner animation="border" />
            checking browser features...
        </div>
    );

    const missing = missingFeatures?.length ? (
        <Alert variant="danger">
            Your browser is missing the following <strong>required</strong>{' '}
            features:
            <ul>
                {missingFeatures.map((feature, i) => (
                    <li key={i}>{feature}</li>
                ))}
            </ul>
            This website <strong>will not work</strong> in the intended way!
            While you can try to continue anyway, it is highly recommended to
            switch to a supported browser like any{' '}
            <a href="https://www.chromium.org/Home">Chromium</a>-based browser (
            <a href="https://www.google.com/chrome/">Chrome</a>,{' '}
            <a href="https://www.microsoft.com/en-us/edge">Edge</a>,{' '}
            <a href="https://www.opera.com/">Opera</a>, ...)!
        </Alert>
    ) : null;

    const ok =
        !missingFeatures || missingFeatures?.length ? null : (
            <Alert variant="success">
                Your browser has all required features and should work fine. If
                you still find any bugs let me know:{' '}
                <a href="https://github.com/c4f-wtf/ai/issues">
                    https://github.com/c4f-wtf/ai/issues
                </a>
            </Alert>
        );

    return (
        <div className={css.root}>
            <h1>Welcome to ai.c4f.wtf</h1>
            <p>
                This website is a new platform for teaching and experimenting
                with AI techniques on various scenarios. It enables the user to
                focus on solving the task ahead by providing a complete
                programming environment inside the browser as well as engaging
                scenarios to test someones skills.
                <br />
                The goal was not to teach specific algorithms or techniques, for
                which you can find many examples online, but to provide an easy
                to use, no setup required, AI development environment, where you
                can just try out the algorithms you learned previously.
            </p>
            <p>
                For security and privacy reasons, everything you do only happens
                locally on your computer. If you want to transfer your project
                to another computer simply export it and then import it on your
                target machine.
            </p>
            <p>
                Furthermore the app is open-source and its code can be found on{' '}
                <a href="https://github.com/c4f-wtf/ai">GitHub</a>. It was
                created with extensibility in mind, any contributions
                (especially new scenarios) are very welcome.
            </p>
            {missing}
            {ok}
            {footer}
        </div>
    );
}
export default Welcome;
