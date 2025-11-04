import React from 'react';
import { Link, Outlet, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const Layout: React.FC = () => {
    const { user, isAuthenticated, logout } = useAuth();
    const navigate = useNavigate();

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    return (
        <div className="app">
            <header className="header">
                <div className="container">
                    <h1 className="logo">
                        <Link to="/">{import.meta.env.VITE_APP_TITLE}</Link>
                    </h1>
                    <nav className="nav">
                        {isAuthenticated ? (
                            <>
                                <Link to="/" className="nav-link">Тикеты</Link>
                                <Link to="/create" className="nav-link nav-link-primary">
                                    Создать тикет
                                </Link>

                                <div className="nav-user">
                                    <span className="user-login">{user?.login}</span>
                                    <div className="user-menu">
                                        <Link to="/profile" className="user-menu-item">
                                            Профиль
                                        </Link>
                                        {user?.role === 'ADMIN' && (
                                            <Link to="/users" className="user-menu-item">
                                                Управление пользователями
                                            </Link>
                                        )}
                                        <button onClick={handleLogout} className="user-menu-item">
                                            Выйти
                                        </button>
                                    </div>
                                </div>
                            </>
                        ) : (
                            <>
                                <Link to="/login" className="nav-link">Войти</Link>
                                <Link to="/register" className="nav-link nav-link-primary">
                                    Регистрация
                                </Link>
                            </>
                        )}
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