import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useNotification } from '../contexts/NotificationContext';
import { userService } from '../services/userService';
import { ChangePasswordDTO } from '../types/auth';
import { UpdateUserDTO } from '../types/user';
import { getUserStatusLabel, getRoleLabel, validatePassword } from '../services/utils';

const Profile: React.FC = () => {
    const notification = useNotification();
    const { user, updateUser, changePassword } = useAuth();
    const [isEditing, setIsEditing] = useState(false);
    const [loading, setLoading] = useState(false);

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

    const handleProfileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };

    const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setPasswordData({
            ...passwordData,
            [e.target.name]: e.target.value
        });
    };

    const handleProfileSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
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

        if (passwordData.newPassword !== passwordData.confirmPassword) {
            notification.error('Пароли не совпадают');
            return;
        }

        if (!validatePassword(passwordData.newPassword)) {
            notification.error('Пароль должен содержать минимум 8 символов, заглавные и строчные буквы, а также цифры');
            return;
        }

        setLoading(true);

        try {
            await changePassword(passwordData);
            setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
            notification.success('Пароль успешно изменен');
        } catch (error: any) {
            notification.error('Неверный текущий пароль.');
        } finally {
            setLoading(false);
        }
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

                                <dt>Статус:</dt>
                                <dd>
                                    <span className={`status-badge status-${user.status.toLowerCase()}`}>
                                        {getUserStatusLabel(user.status)}
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
                        <form onSubmit={handleProfileSubmit} className="profile-form">
                            <div className="form-group">
                                <label htmlFor="firstName">Имя *</label>
                                <input
                                    type="text"
                                    id="firstName"
                                    name="firstName"
                                    value={formData.firstName}
                                    onChange={handleProfileChange}
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
                                    onChange={handleProfileChange}
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

                            <div className="form-group">
                                <label htmlFor="email">Email *</label>
                                <input
                                    type="email"
                                    id="email"
                                    name="email"
                                    value={formData.email}
                                    onChange={handleProfileChange}
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
                                    onChange={handleProfileChange}
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

                            <div className="form-group">
                                <label htmlFor="phoneNumber">Телефон</label>
                                <input
                                    type="tel"
                                    id="phoneNumber"
                                    name="phoneNumber"
                                    value={formData.phoneNumber}
                                    onChange={handleProfileChange}
                                    className="form-control"
                                    pattern="^$|^\+?[1-9]\d{0,10}$"
                                    placeholder="+7XXXXXXXXXX"
                                />
                            </div>

                            <div className="form-group">
                                <label htmlFor="department">Отдел</label>
                                <input
                                    type="text"
                                    id="department"
                                    name="department"
                                    value={formData.department}
                                    onChange={handleProfileChange}
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
                                    onChange={handleProfileChange}
                                    className="form-control"
                                />
                            </div>

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
                                    onClick={() => {
                                        setIsEditing(false);
                                        setFormData({
                                            firstName: user.firstName,
                                            lastName: user.lastName,
                                            email: user.email,
                                            login: user.login,
                                            phoneNumber: user.phoneNumber || '',
                                            department: user.department || '',
                                            position: user.position || ''
                                        });
                                    }}
                                    className="btn btn-secondary"
                                >
                                    Отмена
                                </button>
                            </div>
                        </form>
                    )}
                </div>

                <div className="profile-section">
                    <h3>Изменить пароль</h3>

                    <form onSubmit={handlePasswordSubmit} className="profile-form">
                        <div className="form-group">
                            <label htmlFor="currentPassword">Текущий пароль</label>
                            <input
                                type="password"
                                id="currentPassword"
                                name="currentPassword"
                                value={passwordData.currentPassword}
                                onChange={handlePasswordChange}
                                required
                                className="form-control"
                            />
                        </div>

                        <div className="form-group">
                            <label htmlFor="newPassword">Новый пароль</label>
                            <input
                                type="password"
                                id="newPassword"
                                name="newPassword"
                                value={passwordData.newPassword}
                                onChange={handlePasswordChange}
                                required
                                minLength={8}
                                className="form-control"
                            />
                            <small className="form-hint">
                                Минимум 8 символов, заглавные и строчные буквы, цифры
                            </small>
                        </div>

                        <div className="form-group">
                            <label htmlFor="confirmPassword">Подтвердите новый пароль</label>
                            <input
                                type="password"
                                id="confirmPassword"
                                name="confirmPassword"
                                value={passwordData.confirmPassword}
                                onChange={handlePasswordChange}
                                required
                                className="form-control"
                            />
                        </div>

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