import { Link, useLocation } from 'react-router-dom';
import { ThemeSwitcher } from '@elements/theme-switcher';


export function Header(props: { title: string }) {
    const location = useLocation();
    const path = location.pathname.split('/').splice(1);

    let i = 0;
    const breadcrumbs = [
        <li key="/"><Link to={"/"} className="text-3xl font-mono font-bold pr-2"><img
        src="/assets/logo.png"
        alt="Coding4Fun"
        className="w-14 -my-1 pr-2" />{props.title}</Link></li>,
    ];

    while (path[i]) {
        let name = // react automatically escapes all strings
            path[i] === 'project'
                ? path[(i += 2)] // use project name
                : path[i][0].toUpperCase() + path[i].slice(1);
        const url = '/' + path.slice(0, i + 1).join('/');
        breadcrumbs.push(
            <li key={url}><Link to={url}>{decodeURI(name)}</Link></li>
        );
        
        i++;
    }

    return (
        <div className="navbar p-0 px-2 min-h-0 border-b dark:border-gray-700 bg-base-100">
            <div className="navbar-start">
                <div className="breadcrumbs text-base">
                    <ul>{breadcrumbs}</ul>
                </div>
            </div>
            <div className="navbar-end">
                <ul className="menu menu-horizontal p-0 pr-1 text-base">
                    <li><Link to="/documentation">Documentation</Link></li>
                    <li><Link to="/news">News</Link></li>
                    <li><Link to="/impressum">Impressum</Link></li>
                    <li><Link to="https://github.com/mmenzinger/ai_playground/issues" target="_blank">Issues</Link></li>
                </ul>
                <ThemeSwitcher />
            </div>
        </div>
    );
}

export default Header;
