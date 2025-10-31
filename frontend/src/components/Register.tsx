import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { RegisterDTO } from '../types/auth';
import { validatePassword } from '../services/utils'
import { useNotification } from '../contexts/NotificationContext';

const Register: React.FC = () => {
    const navigate = useNavigate();
    const { register } = useAuth();
    const notification = useNotification();
    const [loading, setLoading] = useState(false);

    const [formData, setFormData] = useState<RegisterDTO & { confirmPassword: string }>({
        email: '',
        password: '',
        confirmPassword: '',
        firstName: '',
        lastName: '',
        login: '',
        phoneNumber: '',
        department: '',
        position: ''
    });

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (formData.password !== formData.confirmPassword) {
            notification.error('Пароли не совпадают');
            return;
        }

        if (!validatePassword(formData.password)) {
            notification.error('Пароль должен содержать минимум 8 символов, включая заглавные и строчные буквы, а также цифры');
            return;
        }

        setLoading(true);

        try {
            const { confirmPassword, ...registerData } = formData;
            await register(registerData);
            navigate('/');
        } catch (err: any) {
            notification.error('Ошибка регистрации');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="auth-container">
            <div className="auth-card auth-card-wide">
                <h2 className="auth-title">Регистрация</h2>

                <form onSubmit={handleSubmit} className="auth-form">
                    <div className="form-row">
                        <div className="form-group">
                            <label htmlFor="firstName">Имя *</label>
                            <input
                                type="text"
                                id="firstName"
                                name="firstName"
                                value={formData.firstName}
                                onChange={handleChange}
                                required
                                className="form-control"
                                minLength={2}
                                maxLength={100}
                                placeholder="Иван"
                            />
                            <small className="form-hint">
                                Минимум 2, максимум 100 символов
                            </small>
                        </div>

                        <div className="form-group">
                            <label htmlFor="lastName">Фамилия *</label>
                            <input
                                type="text"
                                id="lastName"
                                name="lastName"
                                value={formData.lastName}
                                onChange={handleChange}
                                required
                                className="form-control"
                                minLength={2}
                                maxLength={100}
                                placeholder="Иванов"
                            />
                            <small className="form-hint">
                                Минимум 2, максимум 100 символов
                            </small>
                        </div>
                    </div>

                    <div className="form-group">
                        <label htmlFor="email">Email *</label>
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
                        <label htmlFor="login">Логин *</label>
                        <input
                            type="text"
                            id="login"
                            name="login"
                            value={formData.login}
                            onChange={handleChange}
                            required
                            className="form-control"
                            pattern="^[a-zA-Z0-9_]+$"
                            minLength={3}
                            maxLength={50}
                            placeholder="user_login"
                        />
                        <small className="form-hint">
                            Минимум 3, максимум 50 символов, только буквы, цифры и подчеркивания
                        </small>
                    </div>

                    <div className="form-row">
                        <div className="form-group">
                            <label htmlFor="password">Пароль *</label>
                            <input
                                type="password"
                                id="password"
                                name="password"
                                value={formData.password}
                                onChange={handleChange}
                                required
                                className="form-control"
                                minLength={8}
                                placeholder="••••••••"
                            />
                            <small className="form-hint">
                                Минимум 8 символов, заглавные и строчные буквы, цифры
                            </small>
                        </div>

                        <div className="form-group">
                            <label htmlFor="confirmPassword">Подтвердите пароль *</label>
                            <input
                                type="password"
                                id="confirmPassword"
                                name="confirmPassword"
                                value={formData.confirmPassword}
                                onChange={handleChange}
                                required
                                className="form-control"
                                placeholder="••••••••"
                            />
                        </div>
                    </div>

                    <div className="form-group">
                        <label htmlFor="phoneNumber">Телефон</label>
                        <input
                            type="tel"
                            id="phoneNumber"
                            name="phoneNumber"
                            value={formData.phoneNumber}
                            onChange={handleChange}
                            className="form-control"
                            pattern="^$|^\+?[1-9]\d{0,10}$"
                            placeholder="+7XXXXXXXXXX"
                        />
                    </div>

                    <div className="form-row">
                        <div className="form-group">
                            <label htmlFor="department">Отдел</label>
                            <input
                                type="text"
                                id="department"
                                name="department"
                                value={formData.department}
                                onChange={handleChange}
                                className="form-control"
                            />
                        </div>

                        <div className="form-group">
                            <label htmlFor="position">Должность</label>
                            <input
                                type="text"
                                id="position"
                                name="position"
                                value={formData.position}
                                onChange={handleChange}
                                className="form-control"
                            />
                        </div>
                    </div>

                    <button
                        type="submit"
                        className="btn btn-primary btn-block"
                        disabled={loading}
                    >
                        {loading ? 'Регистрация...' : 'Зарегистрироваться'}
                    </button>
                </form>

                <div className="auth-footer">
                    <p>
                        Уже есть аккаунт?{' '}
                        <Link to="/login" className="auth-link">
                            Войти
                        </Link>
                    </p>
                </div>
            </div>
        </div>
    );
};

export default Register;