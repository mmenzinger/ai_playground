import { Card } from 'react-bootstrap';

import css from './news.module.css';

export function News() {
    return (
        <div className={css.root}>
            <Card bg="primary">
                <Card.Header>Major Update 2021.?.?</Card.Header>
                <Card.Body>
                    <ul>
                        <li>
                            completely reworked backbone (moved from polymer to
                            react)
                        </li>
                        <li>switched design to bootstrap</li>
                        <li>new console</li>
                        <li>new file-tree (also added folders)</li>
                        <li>new documentation</li>
                        <li>more flexible scenario system (added views)</li>
                        <li>major bugfixes</li>
                        <li>moved to single canvas</li>
                        <li>removed addMessage and setMessage from utils</li>
                    </ul>
                </Card.Body>
            </Card>

            <Card>
                <Card.Header>Update 2020.10.12</Card.Header>
                <Card.Body>
                    <ul>
                        <li>added Flabby Bird scenario</li>
                        <li>moved mouse events into lib</li>
                        <li>added 2 additional layers of canvases</li>
                        <li>updated editor to new version</li>
                        <li>restructured scenarios (moved examples)</li>
                        <li>minor bugfixes</li>
                    </ul>
                </Card.Body>
            </Card>

            <Card>
                <Card.Header>Update 2020.07.11</Card.Header>
                <Card.Body>
                    <ul>
                        <li>added camera support</li>
                        <li>added tensorflow models</li>
                        <li>added tensorflow example (facemesh)</li>
                        <li>minor bugfixes</li>
                    </ul>
                </Card.Body>
            </Card>
        </div>
    );
}
export default News;
