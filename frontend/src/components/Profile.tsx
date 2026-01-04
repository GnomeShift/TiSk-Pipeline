import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useNotification } from '../contexts/NotificationContext';
import { userService } from '../services/userService';
import { ChangePasswordDTO } from '../types/auth';
import { UpdateUserDTO } from '../types/user';
import { getRoleLabel } from '../services/utils';
import FormInput, { validationRules } from './FormInput';
import PasswordInput from './PasswordInput';
import { useFormValidation } from '../hooks/useFormValidation';

const Profile: React.FC = () => {
    const notification = useNotification();
    const { user, updateUser, changePassword } = useAuth();
    const [isEditing, setIsEditing] = useState(false);
    const [loading, setLoading] = useState(false);

    const profileValidation = useFormValidation();
    const passwordValidation = useFormValidation();

    const [formData, setFormData] = useState<UpdateUserDTO>({
        firstName: user?.firstName || '',
        lastName: user?.lastName || '',
        email: user?.email || '',
        login: user?.login || '',
        phoneNumber: user?.phoneNumber || '',
        department: user?.department || '',
        position: user?.position || ''
    });

    const [passwordData, setPasswordData] = useState<ChangePasswordDTO>({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
    });

    const handleProfileChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };

    const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        setPasswordData({
            ...passwordData,
            [e.target.name]: e.target.value
        });
    };

    const handleProfileSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        const { isValid } = await profileValidation.validateForm();
        if (!isValid) {
            return;
        }

        setLoading(true);

        try {
            if (user?.id) {
                const updatedUser = await userService.update(user.id, formData);
                updateUser(updatedUser);
                setIsEditing(false);
                notification.success('Профиль успешно обновлен');
            }
        } catch (error: any) {
            notification.error('Ошибка при обновлении профиля');
        } finally {
            setLoading(false);
        }
    };

    const handlePasswordSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        const { isValid } = await passwordValidation.validateForm();
        if (!isValid) {
            return;
        }

        setLoading(true);

        try {
            await changePassword(passwordData);
            setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
            passwordValidation.resetValidation();
            notification.success('Пароль успешно изменен');
        } catch (error: any) {
            notification.error('Неверный текущий пароль.');
        } finally {
            setLoading(false);
        }
    };

    const handleCancelEdit = () => {
        setIsEditing(false);
        profileValidation.resetValidation();
        setFormData({
            firstName: user?.firstName || '',
            lastName: user?.lastName || '',
            email: user?.email || '',
            login: user?.login || '',
            phoneNumber: user?.phoneNumber || '',
            department: user?.department || '',
            position: user?.position || ''
        });
    };

    if (!user) return null;

    return (
        <div className="profile-container">
            <h2>Профиль пользователя</h2>

            <div className="profile-sections">
                <div className="profile-section">
                    <h3>Личная информация</h3>

                    {!isEditing ? (
                        <div className="profile-info">
                            <dl>
                                <dt>Имя:</dt>
                                <dd>{user.firstName}</dd>

                                <dt>Фамилия:</dt>
                                <dd>{user.lastName}</dd>

                                <dt>Email:</dt>
                                <dd>{user.email}</dd>

                                <dt>Логин:</dt>
                                <dd>{user.login}</dd>

                                <dt>Телефон:</dt>
                                <dd>{user.phoneNumber || '—'}</dd>

                                <dt>Отдел:</dt>
                                <dd>{user.department || '—'}</dd>

                                <dt>Должность:</dt>
                                <dd>{user.position || '—'}</dd>

                                <dt>Роль:</dt>
                                <dd>
                                    <span className={`role-badge role-${user.role.toLowerCase()}`}>
                                        {getRoleLabel(user.role)}
                                    </span>
                                </dd>

                                <dt>Зарегистрирован:</dt>
                                <dd>{new Date(user.createdAt).toLocaleDateString()}</dd>

                                {user.lastLoginAt && (
                                    <>
                                        <dt>Последний вход:</dt>
                                        <dd>{new Date(user.lastLoginAt).toLocaleString()}</dd>
                                    </>
                                )}
                            </dl>

                            <button
                                onClick={() => setIsEditing(true)}
                                className="btn btn-primary"
                            >
                                Редактировать
                            </button>
                        </div>
                    ) : (
                        <form onSubmit={handleProfileSubmit} className="profile-form" noValidate>
                            <FormInput
                                type="text"
                                id="profile-firstName"
                                name="firstName"
                                label="Имя"
                                value={formData.firstName || ''}
                                onChange={handleProfileChange}
                                required
                                disabled={loading}
                                minLength={2}
                                maxLength={100}
                                placeholder="Иван"
                                forceValidate={profileValidation.forceValidate}
                                onValidationChange={profileValidation.registerFieldError}
                            />

                            <FormInput
                                type="text"
                                id="profile-lastName"
                                name="lastName"
                                label="Фамилия"
                                value={formData.lastName || ''}
                                onChange={handleProfileChange}
                                required
                                disabled={loading}
                                minLength={2}
                                maxLength={100}
                                placeholder="Иванов"
                                forceValidate={profileValidation.forceValidate}
                                onValidationChange={profileValidation.registerFieldError}
                            />

                            <FormInput
                                type="email"
                                id="profile-email"
                                name="email"
                                label="Email"
                                value={formData.email || ''}
                                onChange={handleProfileChange}
                                required
                                placeholder="user@example.com"
                                disabled={loading}
                                rules={[validationRules.email()]}
                                forceValidate={profileValidation.forceValidate}
                                onValidationChange={profileValidation.registerFieldError}
                            />

                            <FormInput
                                type="text"
                                id="profile-login"
                                name="login"
                                label="Логин"
                                value={formData.login || ''}
                                onChange={handleProfileChange}
                                required
                                disabled={loading}
                                minLength={3}
                                maxLength={50}
                                placeholder="user_login"
                                rules={[
                                    validationRules.login(),
                                    validationRules.noSpaces()
                                ]}
                                forceValidate={profileValidation.forceValidate}
                                onValidationChange={profileValidation.registerFieldError}
                            />

                            <FormInput
                                type="tel"
                                id="profile-phoneNumber"
                                name="phoneNumber"
                                label="Телефон"
                                value={formData.phoneNumber || ''}
                                onChange={handleProfileChange}
                                placeholder="+7XXXXXXXXXX"
                                disabled={loading}
                                rules={[validationRules.phone()]}
                                forceValidate={profileValidation.forceValidate}
                                onValidationChange={profileValidation.registerFieldError}
                            />

                            <FormInput
                                type="text"
                                id="profile-department"
                                name="department"
                                label="Отдел"
                                value={formData.department || ''}
                                onChange={handleProfileChange}
                                disabled={loading}
                                forceValidate={profileValidation.forceValidate}
                                onValidationChange={profileValidation.registerFieldError}
                            />

                            <FormInput
                                type="text"
                                id="profile-position"
                                name="position"
                                label="Должность"
                                value={formData.position || ''}
                                onChange={handleProfileChange}
                                disabled={loading}
                                forceValidate={profileValidation.forceValidate}
                                onValidationChange={profileValidation.registerFieldError}
                            />

                            <div className="form-actions">
                                <button
                                    type="submit"
                                    className="btn btn-primary"
                                    disabled={loading}
                                >
                                    {loading ? 'Сохранение...' : 'Сохранить'}
                                </button>
                                <button
                                    type="button"
                                    onClick={handleCancelEdit}
                                    className="btn btn-secondary"
                                    disabled={loading}
                                >
                                    Отмена
                                </button>
                            </div>
                        </form>
                    )}
                </div>

                <div className="profile-section">
                    <h3>Изменить пароль</h3>

                    <form onSubmit={handlePasswordSubmit} className="profile-form" noValidate>
                        <FormInput
                            type="password"
                            id="currentPassword"
                            name="currentPassword"
                            label="Текущий пароль"
                            value={passwordData.currentPassword}
                            onChange={handlePasswordChange}
                            required
                            disabled={loading}
                            autoComplete="current-password"
                            forceValidate={passwordValidation.forceValidate}
                            onValidationChange={passwordValidation.registerFieldError}
                        />

                        <PasswordInput
                            id="newPassword"
                            name="newPassword"
                            label="Новый пароль"
                            value={passwordData.newPassword}
                            onChange={handlePasswordChange}
                            required
                            disabled={loading}
                            autoComplete="new-password"
                            forceValidate={passwordValidation.forceValidate}
                            onValidationChange={passwordValidation.registerFieldError}
                        />

                        <FormInput
                            type="password"
                            id="confirmPassword"
                            name="confirmPassword"
                            label="Подтвердите новый пароль"
                            value={passwordData.confirmPassword}
                            onChange={handlePasswordChange}
                            required
                            placeholder="••••••••"
                            disabled={loading}
                            rules={[validationRules.match(() => passwordData.newPassword, 'Пароли')]}
                            forceValidate={passwordValidation.forceValidate}
                            onValidationChange={passwordValidation.registerFieldError}
                        />

                        <button
                            type="submit"
                            className="btn btn-primary"
                            disabled={loading}
                        >
                            {loading ? 'Изменение...' : 'Изменить пароль'}
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default Profile;