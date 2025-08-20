export function Impressum() {
    return (
        <div className="prose text-center mx-auto my-4">
            <h2>Media Owner</h2>
            <p>
                Manuel Menzinger, Laßnitzhöhe, Austria
                <br />
                <a href="mailto:admin@c4f.wtf">admin@c4f.wtf</a>
            </p>

            <h2>Basic Line</h2>
            <p>Open educational resource, AI programming playground</p>

            <h2>Privacy Policy</h2>
            <p>
                This website does store all its user-data locally inside the
                browser and only uses technology necessary for the website to function.
                There is no additional tracking or data collection.
            </p>

            <h2>Source Code</h2>
            <p>
                The source code can be found on{' '}
                <a href="https://github.com/mmenzinger/ai_playground">GitHub</a>.
            </p>

            <h2>Attribution</h2>
            <ul className="list-none">
                <li>Icons from <a href="https://fontawesome.com/">Font Awesome</a></li>
            </ul>
        </div>
    );
}
export default Impressum;
