import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { userService } from '../services/userService';
import { getUserRoleVariant, getUserRoleLabel, formatDate, formatDateTime } from '../services/utils';
import { useFormValidation } from '../hooks/useFormValidation';
import FormInput, { validationRules } from './FormInput';
import PasswordInput from './PasswordInput';
import { toast } from '../services/toast';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { SkeletonProfile } from './ui/skeleton';
import { Edit, Key, Save, User, X } from 'lucide-react';
import { getErrorMessage } from '../services/errorTranslator';

const Profile: React.FC = () => {
    const { user, updateUser, changePassword } = useAuth();
    const [isEditing, setIsEditing] = useState(false);
    const [loading, setLoading] = useState(false);
    const profileValidation = useFormValidation();
    const passwordValidation = useFormValidation();
    const [formData, setFormData] = useState({ ...user });
    const [passwordData, setPasswordData] = useState({currentPassword: '', newPassword: '', confirmPassword: '' });

    if (!user) return <SkeletonProfile />;

    const PROFILE_FIELDS = [
        { name: 'firstName', label: 'Имя', required: true, grid: true },
        { name: 'lastName', label: 'Фамилия', required: true, grid: true },
        { name: 'email', label: 'Email', type: 'email', required: true, rules: [validationRules.email()] },
        { name: 'login', label: 'Логин', required: true, rules: [validationRules.login(), validationRules.noSpaces()] },
        { name: 'phoneNumber', label: 'Телефон', type: 'tel', rules: [validationRules.phone()] },
        { name: 'department', label: 'Отдел', grid: true },
        { name: 'position', label: 'Должность', grid: true },
    ];

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        const { isValid } = await profileValidation.validateForm();
        if (!isValid) return;
        setLoading(true);

        try {
            updateUser(await userService.update(user.id, formData));
            setIsEditing(false);
            toast.success('Профиль обновлен');
        } catch (err) {
            toast.error(getErrorMessage(err));
        } finally {
            setLoading(false);
        }
    };

    const handlePasswordSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        const { isValid } = await passwordValidation.validateForm();
        if (!isValid) return;
        setLoading(true);

        try {
            await changePassword(passwordData);
            setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
            passwordValidation.resetValidation();
            toast.success('Пароль изменен');
        } catch (err) {
            toast.error(getErrorMessage(err));
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="max-w-3xl mx-auto space-y-6 pb-8">
            {/* Header */}
            <div className="flex items-center gap-3">
                <User className="w-8 h-8 text-primary" />
                <h2 className="text-2xl font-bold">Профиль пользователя</h2>
            </div>

            {/* Info */}
            <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0">
                    <CardTitle className="text-xl">Личная информация</CardTitle>
                    {!isEditing &&
                        <Button
                            variant="outline"
                            onClick={() => setIsEditing(true)}>
                        <Edit className="w-4 h-4 mr-2" />
                        Редактировать
                    </Button>
                    }
                </CardHeader>
                <CardContent>
                    {!isEditing ? (
                        <dl className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            {[
                                { label: 'Имя', val: user.firstName }, { label: 'Фамилия', val: user.lastName },
                                { label: 'Email', val: user.email }, { label: 'Логин', val: user.login },
                                { label: 'Телефон', val: user.phoneNumber || '—' }, { label: 'Отдел', val: user.department || '—' },
                                { label: 'Должность', val: user.position || '—' }
                            ].map(i => (
                                <div key={i.label}>
                                    <dt className="text-sm font-medium text-muted-foreground">{i.label}</dt>
                                    <dd>{i.val}</dd>
                                </div>
                            ))}
                            <div>
                                <dt className="text-sm font-medium text-muted-foreground">Роль</dt>
                                <dd>
                                    <Badge variant={getUserRoleVariant(user.role)}>
                                        {getUserRoleLabel(user.role)}
                                    </Badge>
                                </dd>
                            </div>
                            <div>
                                <dt className="text-sm font-medium text-muted-foreground">Регистрация</dt>
                                <dd>{formatDate(user.createdAt)}</dd>
                            </div>
                            {user.lastLoginAt &&
                                <div>
                                    <dt className="text-sm font-medium text-muted-foreground">Вход</dt>
                                    <dd>{formatDateTime(user.lastLoginAt)}</dd>
                                </div>
                            }
                        </dl>
                    ) : (
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                {PROFILE_FIELDS.map((f) => (
                                    <div key={f.name} className={f.grid ? "" : "sm:col-span-2"}>
                                        <FormInput {...f}
                                                   id={`p-${f.name}`}
                                                   value={(formData as any)[f.name] || ''}
                                                   onChange={e => setFormData({
                                                       ...formData, [f.name]: e.target.value
                                                   })}
                                                   disabled={loading}
                                                   forceValidate={profileValidation.forceValidate}
                                                   onValidationChange={profileValidation.registerFieldError}
                                        />
                                    </div>
                                ))}
                            </div>
                            <div className="flex gap-3 mt-6">
                                <Button type="submit" loading={loading}>
                                    <Save className="mr-2 h-4 w-4" />
                                    Сохранить
                                </Button>
                                <Button
                                    type="button"
                                    variant="secondary"
                                    onClick={() => setIsEditing(false)} disabled={loading}
                                >
                                    <X className="mr-2 h-4 w-4" />
                                    Отмена
                                </Button>
                            </div>
                        </form>
                    )}
                </CardContent>
            </Card>

            {/* Change password */}
            <Card>
                <CardHeader>
                    <CardTitle className="text-xl flex items-center gap-2">
                        <Key className="w-5 h-5" />
                        Изменить пароль
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handlePasswordSubmit} className="max-w-sm space-y-4">
                        <FormInput
                            type="password"
                            id="currentPassword"
                            name="currentPassword"
                            label="Текущий пароль"
                            required
                            value={passwordData.currentPassword}
                            onChange={e => setPasswordData({
                                ...passwordData, [e.target.name]: e.target.value
                            })}
                            forceValidate={passwordValidation.forceValidate}
                            onValidationChange={passwordValidation.registerFieldError}
                        />
                        <PasswordInput
                            id="newPassword"
                            name="newPassword"
                            label="Новый пароль"
                            required
                            value={passwordData.newPassword}
                            onChange={e => setPasswordData({
                                ...passwordData, [e.target.name]: e.target.value
                            })}
                            forceValidate={passwordValidation.forceValidate}
                            onValidationChange={passwordValidation.registerFieldError}
                        />
                        <FormInput
                            type="password"
                            id="confirmPassword"
                            name="confirmPassword"
                            label="Подтвердите пароль"
                            required value={passwordData.confirmPassword}
                            onChange={e => setPasswordData({
                                ...passwordData, [e.target.name]: e.target.value
                            })}
                            rules={[validationRules.match(() => passwordData.newPassword, 'Пароли')]}
                            forceValidate={passwordValidation.forceValidate}
                            onValidationChange={passwordValidation.registerFieldError}
                        />
                        <Button type="submit" disabled={loading} loading={loading}>
                            <Key className="w-4 h-4 mr-2" />
                            {loading ? 'Изменение...' : 'Изменить пароль'}
                        </Button>
                    </form>
                </CardContent>
            </Card>
        </div>
    );
};

export default Profile;