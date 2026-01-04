import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { LoginDTO } from '../types/auth';
import { useNotification } from '../contexts/NotificationContext';
import FormInput, { validationRules } from './FormInput';
import { useFormValidation } from '../hooks/useFormValidation';

const Login: React.FC = () => {
    const navigate = useNavigate();
    const { login } = useAuth();
    const notification = useNotification();
    const [loading, setLoading] = useState(false);
    const { forceValidate, registerFieldError, validateForm } = useFormValidation();

    const [formData, setFormData] = useState<LoginDTO>({
        email: '',
        password: ''
    });

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        const { isValid } = await validateForm();
        if (!isValid) {
            return;
        }

        setLoading(true);

        try {
            await login(formData);
            navigate('/');
        } catch (err: any) {
            notification.error('Ошибка входа');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="auth-container">
            <div className="auth-card">
                <h2 className="auth-title">Вход в систему</h2>

                <form onSubmit={handleSubmit} className="auth-form" noValidate>
                    <FormInput
                        type="email"
                        id="email"
                        name="email"
                        label="Email"
                        value={formData.email}
                        onChange={handleChange}
                        required
                        placeholder="user@example.com"
                        disabled={loading}
                        autoComplete="email"
                        autoFocus
                        rules={[validationRules.email()]}
                        forceValidate={forceValidate}
                        onValidationChange={registerFieldError}
                    />

                    <FormInput
                        type="password"
                        id="password"
                        name="password"
                        label="Пароль"
                        value={formData.password}
                        onChange={handleChange}
                        required
                        placeholder="••••••••"
                        disabled={loading}
                        autoComplete="password"
                        forceValidate={forceValidate}
                        onValidationChange={registerFieldError}
                    />

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