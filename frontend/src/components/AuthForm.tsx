import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { toast } from '../services/toast';
import { useFormValidation } from '../hooks/useFormValidation';
import FormInput, { validationRules } from './FormInput';
import PasswordInput from './PasswordInput';
import { Button } from './ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from './ui/card';
import { UserPlus } from 'lucide-react';
import { getErrorMessage } from '../services/errorTranslator';

type AuthMode = 'login' | 'register';

interface AuthFormProps {
    mode: AuthMode;
}

const CONFIG = {
    login: {
        title: 'Вход в систему',
        submitText: 'Войти',
        loadingText: 'Вход...',
        link: { text: 'Нет аккаунта?', linkText: 'Зарегистрироваться', to: '/register' }
    },
    register: {
        title: 'Регистрация',
        description: 'Создайте аккаунт для доступа к системе',
        submitText: 'Зарегистрироваться',
        loadingText: 'Регистрация...',
        link: { text: 'Уже есть аккаунт?', linkText: 'Войти', to: '/login' }
    }
} as const;

const AuthForm: React.FC<AuthFormProps> = ({ mode }) => {
    const navigate = useNavigate();
    const { login, register } = useAuth();
    const [loading, setLoading] = useState(false);
    const { forceValidate, registerFieldError, validateForm } = useFormValidation();

    const [formData, setFormData] = useState({
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

    const config = CONFIG[mode];
    const isRegister = mode === 'register';

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        const { isValid } = await validateForm();
        if (!isValid) return;
        setLoading(true);

        try {
            if (isRegister) {
                const { confirmPassword, ...registerData } = formData;
                await register(registerData);
            } else {
                await login({ email: formData.email, password: formData.password });
            }
            navigate('/');
        } catch (err) {
            toast.error(getErrorMessage(err));
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-[80vh] flex items-center justify-center p-4">
            <Card className={isRegister ? 'w-full max-w-2xl' : 'w-full max-w-md'}>
                <CardHeader className="text-center">
                    <CardTitle className="text-2xl flex items-center justify-center gap-2">
                        {isRegister && <UserPlus className="w-6 h-6" />}
                        {config.title}
                    </CardTitle>
                    {isRegister && <CardDescription>{CONFIG.register.description}</CardDescription>}
                </CardHeader>

                <CardContent>
                    <form onSubmit={handleSubmit} className="space-y-4" noValidate>
                        {/* Name */}
                        {isRegister && (
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <FormInput
                                    type="text" id="firstName" name="firstName" label="Имя"
                                    value={formData.firstName} onChange={handleChange}
                                    required disabled={loading} minLength={2} maxLength={100}
                                    placeholder="Иван"
                                    forceValidate={forceValidate} onValidationChange={registerFieldError}
                                />
                                <FormInput
                                    type="text" id="lastName" name="lastName" label="Фамилия"
                                    value={formData.lastName} onChange={handleChange}
                                    required disabled={loading} minLength={2} maxLength={100}
                                    placeholder="Иванов"
                                    forceValidate={forceValidate} onValidationChange={registerFieldError}
                                />
                            </div>
                        )}

                        {/* Email */}
                        <FormInput
                            type="email" id="email" name="email" label="Email"
                            value={formData.email} onChange={handleChange}
                            required placeholder="user@example.com" disabled={loading}
                            autoComplete="email" autoFocus={!isRegister}
                            rules={[validationRules.email()]}
                            forceValidate={forceValidate} onValidationChange={registerFieldError}
                        />

                        {/* Login */}
                        {isRegister && (
                            <FormInput
                                type="text" id="login" name="login" label="Логин"
                                value={formData.login} onChange={handleChange}
                                required disabled={loading} minLength={3} maxLength={50}
                                placeholder="user_login"
                                rules={[validationRules.login(), validationRules.noSpaces()]}
                                hint="Только буквы, цифры и подчеркивания"
                                forceValidate={forceValidate} onValidationChange={registerFieldError}
                            />
                        )}

                        {/* Password */}
                        {isRegister ? (
                            <PasswordInput
                                id="password" name="password" label="Пароль"
                                value={formData.password} onChange={handleChange}
                                required disabled={loading} autoComplete="new-password"
                                forceValidate={forceValidate} onValidationChange={registerFieldError}
                            />
                        ) : (
                            <FormInput
                                type="password" id="password" name="password" label="Пароль"
                                value={formData.password} onChange={handleChange}
                                required placeholder="••••••••" disabled={loading}
                                autoComplete="current-password"
                                forceValidate={forceValidate} onValidationChange={registerFieldError}
                            />
                        )}

                        {/* Confirm password */}
                        {isRegister && (
                            <FormInput
                                type="password" id="confirmPassword" name="confirmPassword" label="Подтвердите пароль"
                                value={formData.confirmPassword} onChange={handleChange}
                                required placeholder="••••••••" disabled={loading}
                                rules={[validationRules.match(() => formData.password, 'Пароли')]}
                                forceValidate={forceValidate} onValidationChange={registerFieldError}
                            />
                        )}

                        {/* Phone */}
                        {isRegister && (
                            <FormInput
                                type="tel" id="phoneNumber" name="phoneNumber" label="Телефон"
                                value={formData.phoneNumber} onChange={handleChange}
                                placeholder="+7XXXXXXXXXX" disabled={loading}
                                rules={[validationRules.phone()]}
                                forceValidate={forceValidate} onValidationChange={registerFieldError}
                            />
                        )}

                        {/* Department and position */}
                        {isRegister && (
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <FormInput
                                    type="text" id="department" name="department" label="Отдел"
                                    value={formData.department} onChange={handleChange} disabled={loading}
                                    forceValidate={forceValidate} onValidationChange={registerFieldError}
                                />
                                <FormInput
                                    type="text" id="position" name="position" label="Должность"
                                    value={formData.position} onChange={handleChange} disabled={loading}
                                    forceValidate={forceValidate} onValidationChange={registerFieldError}
                                />
                            </div>
                        )}

                        <Button type="submit" className="w-full" loading={loading} size={isRegister ? 'lg' : 'default'}>
                            {loading ? config.loadingText : config.submitText}
                        </Button>
                    </form>
                </CardContent>

                <CardFooter className="flex justify-center border-t pt-6">
                    <p className="text-sm text-muted-foreground">
                        {config.link.text}{' '}
                        <Link to={config.link.to} className="text-primary hover:underline font-medium">
                            {config.link.linkText}
                        </Link>
                    </p>
                </CardFooter>
            </Card>
        </div>
    );
};

export default AuthForm;