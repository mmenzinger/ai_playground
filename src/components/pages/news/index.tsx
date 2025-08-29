const news = [
    {
        title: 'Major Update 2025.?.?',
        major: true,
        content_text: <></>,
        content_list: [
            <>completely reworked backbone (moved from <a href="https://lit.dev" target="_blank">lit</a> to <a href="https://react.dev" target="_blank">React</a>)</>,
            <>switched design to tailwind/daisyui</>,
            <>new console</>,
            <>new file-tree (added folders)</>,
            <>new documentation</>,
            <>more flexible scenario system (added views)</>,
            <>major bugfixes</>,
            <>moved to single canvas</>,
            <>removed addMessage and setMessage from utils</>,
        ],
    },
    {     
        title: 'Update 2020.10.12',
        major: false,
        content_text: <></>,
        content_list: [
            <>added Flabby Bird scenario</>,
            <>moved mouse events into lib</>,
            <>added 2 additional layers of canvases</>,
            <>updated editor to new version</>,
            <>restructured scenarios (moved examples)</>,
            <>minor bugfixes</>,
        ],
    },
    {
        title: 'Update 2020.07.11',
        major: false,
        content_text: <></>,
        content_list: [
            <>added camera support</>,
            <>added tensorflow models</>,
            <>added tensorflow example (facemesh)</>,
            <>minor bugfixes</>,
        ],
    },
];


export function News() {
    return (
        <div className="max-w-3xl mx-auto mt-4 prose">
            {news.map((item, index) => 
                <div key={index} className="collapse collapse-arrow border border-base-300 bg-base-200">
                    <input type="checkbox" name="news-accordion" defaultChecked={index === 0} />
                    <div className={"collapse-title text-xl font-medium " + (item.major ? "bg-primary text-neutral" : "")}>
                        {item.title}
                    </div>
                    <div className="collapse-content">
                        {item.content_text}
                        { item.content_list.length > 0 ? 
                            <ul className="m-0">
                                {item.content_list.map((item, index) => <li key={index} className="m-0">{item}</li>)}
                            </ul>
                            : <></>
                        }
                    </div>
                </div>
            )}
        </div>
    );
}
export default News;
