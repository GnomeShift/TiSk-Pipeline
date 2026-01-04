import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { RegisterDTO } from '../types/auth';
import { useNotification } from '../contexts/NotificationContext';
import FormInput, { validationRules } from './FormInput';
import PasswordInput from './PasswordInput';
import { useFormValidation } from '../hooks/useFormValidation';

const Register: React.FC = () => {
    const navigate = useNavigate();
    const { register } = useAuth();
    const notification = useNotification();
    const [loading, setLoading] = useState(false);
    const { forceValidate, registerFieldError, validateForm } = useFormValidation();

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

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        const { isValid } = await validateForm();
        if (!isValid) {
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

                <form onSubmit={handleSubmit} className="auth-form" noValidate>
                    <div className="form-row">
                        <FormInput
                            type="text"
                            id="firstName"
                            name="firstName"
                            label="Имя"
                            value={formData.firstName}
                            onChange={handleChange}
                            required
                            disabled={loading}
                            minLength={2}
                            maxLength={100}
                            placeholder="Иван"
                            forceValidate={forceValidate}
                            onValidationChange={registerFieldError}
                        />

                        <FormInput
                            type="text"
                            id="lastName"
                            name="lastName"
                            label="Фамилия"
                            value={formData.lastName}
                            onChange={handleChange}
                            required
                            disabled={loading}
                            minLength={2}
                            maxLength={100}
                            placeholder="Иванов"
                            forceValidate={forceValidate}
                            onValidationChange={registerFieldError}
                        />
                    </div>

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
                        rules={[validationRules.email()]}
                        forceValidate={forceValidate}
                        onValidationChange={registerFieldError}
                    />

                    <FormInput
                        type="text"
                        id="login"
                        name="login"
                        label="Логин"
                        value={formData.login}
                        onChange={handleChange}
                        required
                        disabled={loading}
                        minLength={3}
                        maxLength={50}
                        placeholder="user_login"
                        rules={[
                            validationRules.login(),
                            validationRules.noSpaces()
                        ]}
                        hint="Только буквы, цифры и подчеркивания"
                        forceValidate={forceValidate}
                        onValidationChange={registerFieldError}
                    />

                    <PasswordInput
                        id="password"
                        name="password"
                        label="Пароль"
                        value={formData.password}
                        onChange={handleChange}
                        required
                        disabled={loading}
                        autoComplete="new-password"
                        forceValidate={forceValidate}
                        onValidationChange={registerFieldError}
                    />

                    <FormInput
                        type="password"
                        id="confirmPassword"
                        name="confirmPassword"
                        label="Подтвердите пароль"
                        value={formData.confirmPassword}
                        onChange={handleChange}
                        required
                        placeholder="••••••••"
                        disabled={loading}
                        rules={[validationRules.match(() => formData.password, 'Пароли')]}
                        forceValidate={forceValidate}
                        onValidationChange={registerFieldError}
                    />

                    <FormInput
                        type="tel"
                        id="phoneNumber"
                        name="phoneNumber"
                        label="Телефон"
                        value={formData.phoneNumber || ''}
                        onChange={handleChange}
                        placeholder="+7XXXXXXXXXX"
                        disabled={loading}
                        rules={[validationRules.phone()]}
                        forceValidate={forceValidate}
                        onValidationChange={registerFieldError}
                    />

                    <div className="form-row">
                        <FormInput
                            type="text"
                            id="department"
                            name="department"
                            label="Отдел"
                            value={formData.department || ''}
                            onChange={handleChange}
                            disabled={loading}
                            forceValidate={forceValidate}
                            onValidationChange={registerFieldError}
                        />

                        <FormInput
                            type="text"
                            id="position"
                            name="position"
                            label="Должность"
                            value={formData.position || ''}
                            onChange={handleChange}
                            disabled={loading}
                            forceValidate={forceValidate}
                            onValidationChange={registerFieldError}
                        />
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