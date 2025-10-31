import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { LoginDTO } from '../types/auth';
import { useNotification } from '../contexts/NotificationContext';

const Login: React.FC = () => {
    const navigate = useNavigate();
    const { login } = useAuth();
    const notification = useNotification();
    const [loading, setLoading] = useState(false);

    const [formData, setFormData] = useState<LoginDTO>({
        email: '',
        password: ''
    });

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            await login(formData);
            navigate('/');
        } catch (err: any) {
            notification.error(err.response?.data?.message || 'Ошибка входа');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="auth-container">
            <div className="auth-card">
                <h2 className="auth-title">Вход в систему</h2>

                <form onSubmit={handleSubmit} className="auth-form">
                    <div className="form-group">
                        <label htmlFor="email">Email</label>
                        <input
                            type="email"
                            id="email"
                            name="email"
                            value={formData.email}
                            onChange={handleChange}
                            required
                            className="form-control"
                            placeholder="user@example.com"
                        />
                    </div>

                    <div className="form-group">
                        <label htmlFor="password">Пароль</label>
                        <input
                            type="password"
                            id="password"
                            name="password"
                            value={formData.password}
                            onChange={handleChange}
                            required
                            className="form-control"
                            placeholder="••••••••"
                        />
                    </div>

                    <button
                        type="submit"
                        className="btn btn-primary btn-block"
                        disabled={loading}
                    >
                        {loading ? 'Вход...' : 'Войти'}
                    </button>
                </form>

                <div className="auth-footer">
                    <p>
                        Нет аккаунта?{' '}
                        <Link to="/register" className="auth-link">
                            Зарегистрироваться
                        </Link>
                    </p>
                </div>
            </div>
        </div>
    );
};

export default Login;