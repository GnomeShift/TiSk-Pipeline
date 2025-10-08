import React from 'react';
import { Link, Outlet } from 'react-router-dom';

const Layout: React.FC = () => {
    return (
        <div className="app">
            <header className="header">
                <div className="container">
                    <h1 className="logo">
                        <Link to="/">TiSk - Ticket Desk</Link>
                    </h1>
                    <nav className="nav">
                        <Link to="/" className="nav-link">Все тикеты</Link>
                        <Link to="/create" className="nav-link nav-link-primary">
                            Создать тикет
                        </Link>
                    </nav>
                </div>
            </header>
            <main className="main">
                <div className="container">
                    <Outlet />
                </div>
            </main>
        </div>
    );
};

export default Layout;