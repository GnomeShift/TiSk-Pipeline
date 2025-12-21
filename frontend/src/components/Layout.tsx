import React from 'react';
import { Link, Outlet, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { env } from '../services/env'

const Layout: React.FC = () => {
    const { user, isAuthenticated, logout } = useAuth();
    const navigate = useNavigate();

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    const getUserInitials = () => {
        if (!user) return '';
        const first = user.firstName?.charAt(0) || '';
        const last = user.lastName?.charAt(0) || '';
        return (first + last).toUpperCase();
    };

    return (
        <div className="app">
            <header className="header">
                <div className="container">
                    <h1 className="logo">
                        <Link to="/">{env.appTitle}</Link>
                    </h1>
                    <nav className="nav">
                        {isAuthenticated ? (
                            <>
                                {(user?.role === 'ADMIN') && (
                                    <Link to="/statistics" className="nav-link">
                                        Статистика
                                    </Link>
                                )}
                                <Link to="/" className="nav-link">Тикеты</Link>
                                <Link to="/create" className="nav-link nav-link-primary">
                                    Создать тикет
                                </Link>

                                <div className="nav-user">
                                    <div className="nav-user-avatar">
                                        {getUserInitials()}
                                    </div>
                                    <div className="user-menu">
                                        <div className="user-menu-header">
                                            <div className="user-menu-avatar">
                                                {getUserInitials()}
                                            </div>
                                            <div className="user-menu-info">
                                                <span className="user-menu-name">
                                                    {user?.firstName} {user?.lastName}
                                                </span>
                                                <span className="user-menu-email">
                                                    {user?.email}
                                                </span>
                                            </div>
                                        </div>
                                        <div className="user-menu-divider"></div>
                                        <Link to="/profile" className="user-menu-item">
                                            <span className="user-menu-icon">👤</span>
                                            Профиль
                                        </Link>
                                        {user?.role === 'ADMIN' && (
                                            <Link to="/users" className="user-menu-item">
                                                <span className="user-menu-icon">⚙️</span>
                                                Управление пользователями
                                            </Link>
                                        )}
                                        <div className="user-menu-divider"></div>
                                        <button onClick={handleLogout} className="user-menu-item user-menu-logout">
                                            <span className="user-menu-icon">🚪</span>
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