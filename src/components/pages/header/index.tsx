import React, { Component } from 'react';
import { Link } from 'react-router-dom';
import { Navbar, Breadcrumb, Nav } from 'react-bootstrap';

import appStore from '@store/app-store';
import projectStore from '@store/project-store';

import css from './header.module.css';

type HeaderProps = {
    title: string;
};

export class Header extends Component<HeaderProps> {
    static defaultProps = {
        title: 'My Awesome App',
    };

    render() {
        const breadcrumb = [
            <Breadcrumb.Item linkAs={Link} linkProps={{ to: '/' }} key="/">
                Home
            </Breadcrumb.Item>,
        ];
        if (appStore.page) {
            breadcrumb.push(
                <Breadcrumb.Item
                    linkAs={Link}
                    linkProps={{ to: appStore.page }}
                    key={appStore.page}
                >
                    {appStore.page}
                </Breadcrumb.Item>
            );
        }
        for (const [key, value] of appStore.params) {
            breadcrumb.push(
                <Breadcrumb.Item
                    linkAs={Link}
                    linkProps={{ to: key + (value ? '/' + value : '') }}
                    key={key}
                >
                    {projectStore.activeProject?.name || key}
                </Breadcrumb.Item>
            );
        }
        return (
            <Navbar bg="light" variant="light" className={css.navbar}>
                <Navbar.Brand href="/">
                    <img
                        src="/assets/logo.png"
                        alt="Coding4Fun"
                        className={css.logo}
                    />
                    {this.props.title}
                </Navbar.Brand>
                <Navbar.Collapse>
                    <Breadcrumb className={css.breadcrumb}>
                        {breadcrumb}
                    </Breadcrumb>
                    <Nav>
                        {/* <Nav.Link href="https://docs.google.com/forms/d/e/1FAIpQLSfrFYo0PnULmqOhQY4bxE_uWwe21m-RtxmboGFRlJW9Or5r4w/viewform?usp=sf_link">
                                    Feedback
                                </Nav.Link> */}
                        <Nav.Link as={Link} to="/impressum">
                            Impressum
                        </Nav.Link>
                    </Nav>
                </Navbar.Collapse>
            </Navbar>
        );
    }
}

export default Header;
