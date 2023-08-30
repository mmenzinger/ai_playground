import { Link, useLocation } from 'react-router-dom';
import { Navbar, Breadcrumb, Nav } from 'react-bootstrap';

import css from './header.module.css';

export function Header(props: { title: string }) {
    const location = useLocation();
    const path = location.pathname.split('/').splice(1);

    let i = 0;
    const breadcrumb = [
        <Breadcrumb.Item
            linkAs={Link}
            linkProps={{ to: '/' }}
            key="/"
            active={!path[i]}
        >
            Home
        </Breadcrumb.Item>,
    ];

    while (path[i]) {
        let name = // react automatically escapes all strings
            path[i] === 'project'
                ? path[(i += 2)] // use project name
                : path[i][0].toUpperCase() + path[i].slice(1);
        const url = '/' + path.slice(0, i + 1).join('/');
        breadcrumb.push(
            <Breadcrumb.Item
                linkAs={Link}
                linkProps={{ to: url }}
                key={url}
                active={!path[i + 1]}
            >
                {name}
            </Breadcrumb.Item>
        );
        i++;
    }

    return (
        <Navbar bg="light" variant="light" className={css.navbar}>
            <Navbar.Brand href="/">
                <img
                    src="/assets/logo.png"
                    alt="Coding4Fun"
                    className={css.logo}
                />
                {props.title}
            </Navbar.Brand>
            <Navbar.Collapse>
                <Breadcrumb className={css.breadcrumb}>{breadcrumb}</Breadcrumb>
                <Nav>
                    {/* <Nav.Link href="https://docs.google.com/forms/d/e/1FAIpQLSfrFYo0PnULmqOhQY4bxE_uWwe21m-RtxmboGFRlJW9Or5r4w/viewform?usp=sf_link">
                                    Feedback
                                </Nav.Link> */}
                    <Nav.Link as={Link} to="/documentation">
                        Documentation
                    </Nav.Link>
                    <Nav.Link as={Link} to="/news">
                        News
                    </Nav.Link>
                    <Nav.Link as={Link} to="/impressum">
                        Impressum
                    </Nav.Link>
                    <Nav.Link href="https://github.com/c4f-wtf/ai/issues">
                        Issues
                    </Nav.Link>
                </Nav>
            </Navbar.Collapse>
        </Navbar>
    );
}

export default Header;
