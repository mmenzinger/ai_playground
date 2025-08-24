import { Link, useLocation } from 'react-router-dom';
import { ThemeSwitcher } from '@elements/theme-switcher';
import { FaLink } from 'react-icons/fa6';

export function Header(props: { title: string }) {
    const location = useLocation();
    const path = location.pathname.split('/').splice(1);

    let i = 0;
    const breadcrumbs = [
        <li key="/"><Link to={"/"} className="text-3xl font-mono font-bold pr-2 hover:text-primary"><img
        src="/assets/logo.png"
        alt="Coding4Fun"
        className="w-14 -my-1 pr-2" />{props.title}</Link></li>,
    ];

    while (path[i]) {
        let name = // react automatically escapes all strings
            path[i] === 'editor'
                ? path[(i += 2)] // use project name
                : path[i][0].toUpperCase() + path[i].slice(1);
        const url = '/' + path.slice(0, i + 1).join('/');
        breadcrumbs.push(
            <li key={url}><Link to={url} className="hover:text-primary">{decodeURI(name)}</Link></li>
        );
        
        i++;
    }

    return (
        <div className="navbar flex justify-between flex-wrap p-0 px-2 min-h-0 border-b border-b-base-300">
            <div className="breadcrumbs text-base">
                <ul>{breadcrumbs}</ul>
            </div>

            <ul className="menu menu-horizontal p-0 pr-1 text-base flex items-center">
                {/* <li><Link className="hover:text-primary-content hover:bg-primary" to="/documentation">Documentation</Link></li> */}
                <li><Link className="hover:text-primary-content hover:bg-primary" to="/news">News</Link></li>
                <li><Link className="hover:text-primary-content hover:bg-primary" to="/impressum">Impressum</Link></li>
                <li><Link className="hover:text-primary-content hover:bg-primary" to="https://github.com/mmenzinger/ai_playground/issues" target="_blank"><FaLink /> Issues</Link></li>
                <li><ThemeSwitcher /></li>
            </ul>
        </div>
    );
}

export default Header;
