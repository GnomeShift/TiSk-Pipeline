import React, { useEffect, useState, useMemo } from 'react';
import { UserDTO, UserRole, UserStatus, CreateUserDTO } from '../types/user';
import { userService } from '../services/userService';
import { useAuth } from '../contexts/AuthContext';
import { toast } from '../services/toast';
import Pagination from './Pagination';
import { getUserRoleVariant, getUserRoleLabel, getUserStatusLabel, formatDate, getUserStatusVariant } from '../services/utils';
import FormInput, { validationRules } from './FormInput';
import PasswordInput from './PasswordInput';
import { useFormValidation } from '../hooks/useFormValidation';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Input } from './ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from './ui/dialog';
import { Card, CardContent } from './ui/card';
import { useBlockConfirm, useDeleteConfirm } from './ui/confirm-dialog';
import { SkeletonUserManagement } from './ui/skeleton';
import { UserRoleSelect, UserStatusSelect } from './ui/entity-select';
import { ArrowUpDown, Edit, Lock, RotateCcw, Search, Trash2, Unlock, UserPlus, Users } from 'lucide-react';
import { getErrorMessage } from '../services/errorTranslator';

const UserFormModal: React.FC<{
    user: UserDTO | null;
    isOpen: boolean;
    onClose: () => void;
    onSubmit: (data: any) => Promise<void>;
}> = ({ user, isOpen, onClose, onSubmit }) => {
    const isEdit = !!user;
    const [loading, setLoading] = useState(false);
    const { forceValidate, registerFieldError, validateForm, resetValidation } = useFormValidation();

    const [formData, setFormData] = useState<Partial<CreateUserDTO> & { status?: UserStatus }>({
        role: UserRole.USER,
        status: UserStatus.ACTIVE,
        ...user,
        password: ''
    });

    useEffect(() => {
        if (isOpen) {
            setFormData({ role: UserRole.USER, status: UserStatus.ACTIVE, ...user, password: '' });
            resetValidation();
        }
    }, [isOpen, user, resetValidation]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        const { isValid } = await validateForm();
        if (!isValid) return;
        setLoading(true);
        try {
            await onSubmit(formData);
            onClose();
        } finally {
            setLoading(false);
        }
    };

    const handleChange = (e: any) => setFormData(prev => ({
        ...prev, [e.target.name]: e.target.value
    }));
    const setField = (name: string, value: any) => setFormData(prev => ({
        ...prev, [name]: value
    }));

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle>
                        {isEdit ? 'Редактировать' : 'Создать'} пользователя
                    </DialogTitle>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="space-y-4" noValidate>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <FormInput
                            id="firstName"
                            name="firstName"
                            label="Имя"
                            value={formData.firstName || ''}
                            onChange={handleChange}
                            required
                            disabled={loading}
                            minLength={2}
                            forceValidate={forceValidate}
                            onValidationChange={registerFieldError}
                        />
                        <FormInput
                            id="lastName"
                            name="lastName"
                            label="Фамилия"
                            value={formData.lastName || ''}
                            onChange={handleChange}
                            required
                            disabled={loading}
                            minLength={2}
                            forceValidate={forceValidate}
                            onValidationChange={registerFieldError}
                        />
                    </div>
                    <FormInput
                        id="email"
                        name="email"
                        label="Email"
                        value={formData.email || ''}
                        onChange={handleChange}
                        required
                        disabled={loading}
                        rules={[validationRules.email()]}
                        forceValidate={forceValidate}
                        onValidationChange={registerFieldError}
                    />

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <FormInput
                            id="login"
                            name="login"
                            label="Логин"
                            value={formData.login || ''}
                            onChange={handleChange} required
                            disabled={loading}
                            minLength={3}
                            rules={[validationRules.login()]}
                            forceValidate={forceValidate}
                            onValidationChange={registerFieldError}
                        />
                        {!isEdit && (
                            <PasswordInput
                                id="password"
                                name="password"
                                label="Пароль"
                                value={formData.password || ''}
                                onChange={handleChange}
                                required disabled={loading}
                                forceValidate={forceValidate}
                                onValidationChange={registerFieldError}
                            />
                        )}
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <FormInput
                            id="phoneNumber"
                            name="phoneNumber"
                            label="Телефон"
                            value={formData.phoneNumber || ''}
                            onChange={handleChange}
                            rules={[validationRules.phone()]}
                            forceValidate={forceValidate}
                            onValidationChange={registerFieldError}
                        />
                        <div className="space-y-2">
                            <label className="text-sm font-medium">Роль</label>
                            <UserRoleSelect
                                value={formData.role!}
                                onChange={v => setField('role', v)}
                                disabled={loading}
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <FormInput
                            id="department"
                            name="department"
                            label="Отдел"
                            value={formData.department || ''}
                            onChange={handleChange}
                            disabled={loading}
                        />
                        <FormInput
                            id="position"
                            name="position"
                            label="Должность"
                            value={formData.position || ''}
                            onChange={handleChange}
                            disabled={loading}
                        />
                    </div>

                    {isEdit && (
                        <div className="space-y-2">
                            <label className="text-sm font-medium">Статус</label>
                            <UserStatusSelect
                                value={formData.status!}
                                onChange={v => setField('status', v)}
                                disabled={loading}
                            />
                        </div>
                    )}

                    <div className="flex justify-end gap-3 pt-2">
                        <Button type="submit" disabled={loading} loading={loading}>
                            {loading ? 'Сохранение...' : 'Сохранить'}
                        </Button>
                        <Button type="button" variant="secondary" onClick={onClose} disabled={loading}>
                            Отмена
                        </Button>
                    </div>
                </form>
            </DialogContent>
        </Dialog>
    );
};

const UserManagement: React.FC = () => {
    const { user: currentUser } = useAuth();
    const deleteConfirm = useDeleteConfirm();
    const blockConfirm = useBlockConfirm();
    const [users, setUsers] = useState<UserDTO[]>([]);
    const [loading, setLoading] = useState(true);
    const [modalState, setModalState] = useState<{ isOpen: boolean; user: UserDTO | null }>({ isOpen: false, user: null });
    // Filters and pagination
    const [filters, setFilters] = useState({ search: '', role: 'ALL', status: 'ALL', sortBy: 'createdAt', sortOrder: 'desc' as 'asc'|'desc' });
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 10;

    useEffect(() => { loadUsers(); setCurrentPage(1) }, []);

    const loadUsers = async () => {
        try {
            setLoading(true);
            setUsers(await userService.getAll());
        } catch (err) {
            toast.error(getErrorMessage(err));
        } finally {
            setLoading(false);
        }
    };

    const handleSave = async (data: any) => {
        if (modalState.user) {
            await userService.update(modalState.user.id, data);
            toast.success('Пользователь обновлен');
        } else {
            await userService.create(data);
            toast.success('Пользователь создан');
        }
        await loadUsers();
    };

    const handleAction = async (action: 'delete' | 'status', user: UserDTO) => {
        if (user.id === currentUser?.id) return toast.info('Нельзя изменить свой аккаунт');
        if (action === 'delete') {
            if (await deleteConfirm(`пользователя "${user.firstName} ${user.lastName}"`)) {
                await userService.delete(user.id);
                toast.success('Пользователь удален');
                await loadUsers();
            }
        } else {
            const newStatus = user.status === UserStatus.ACTIVE ? UserStatus.SUSPENDED : UserStatus.ACTIVE;
            if (await blockConfirm(`${user.firstName} ${user.lastName}`, newStatus)) {
                await userService.changeStatus(user.id, newStatus);
                toast.success('Статус пользователя изменен');
                await loadUsers();
            }
        }
    };

    const filteredUsers = useMemo(() => {
        let res = [...users];
        if (filters.search) {
            const s = filters.search.toLowerCase();
            res = res.filter(u => [u.email, u.firstName, u.lastName, u.login].some(f => f?.toLowerCase().includes(s)));
        }
        if (filters.role !== 'ALL') res = res.filter(u => u.role === filters.role);
        if (filters.status !== 'ALL') res = res.filter(u => u.status === filters.status);

        return res.sort((a: any, b: any) => {
            const v1 = a[filters.sortBy], v2 = b[filters.sortBy];
            return filters.sortOrder === 'asc' ? (v1 > v2 ? 1 : -1) : (v2 > v1 ? 1 : -1);
        });
    }, [users, filters]);

    const paginated = filteredUsers.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

    const columns = [
        { label: 'Имя', key: 'firstName' },
        { label: 'Email', key: 'email' },
        { label: 'Логин', key: 'login' },
        { label: 'Роль', key: 'role' },
        { label: 'Статус', key: 'status' },
        { label: 'Телефон', key: 'phoneNumber' },
        { label: 'Отдел', key: 'department' },
        { label: 'Дата', key: 'createdAt' },
        { label: 'Действия', key: null }
    ];

    const handleSort = (key: string | null) => {
        if (!key) return;

        setFilters(prev => ({
            ...prev,
            sortBy: key,
            sortOrder: prev.sortBy === key && prev.sortOrder === 'asc' ? 'desc' : 'asc'
        }));
    };

    if (loading) return <SkeletonUserManagement />;

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row justify-between gap-4">
                <h2 className="text-2xl font-bold">Управление пользователями</h2>
                <Button onClick={() => setModalState({ isOpen: true, user: null })}>
                    <UserPlus className="mr-2 h-4 w-4" />
                    Добавить
                </Button>
            </div>

            <Card>
                <CardContent className="pt-6">
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                        {/* Search */}
                        <div className="relative sm:col-span-2 lg:col-span-1">
                            <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                            <Input
                                placeholder="Поиск..."
                                value={filters.search}
                                onChange={e => setFilters({...filters, search: e.target.value})}
                                className="pl-10"
                            />
                        </div>
                        <UserRoleSelect value={filters.role} onChange={v => setFilters({...filters, role: v})} includeAll />
                        <UserStatusSelect value={filters.status} onChange={v => setFilters({...filters, status: v})} includeAll />
                        <Button
                            variant="secondary"
                            onClick={() => setFilters({ search: '', role: 'ALL', status: 'ALL', sortBy: 'createdAt', sortOrder: 'desc' })}
                        >
                            <RotateCcw className="mr-2 h-4 w-4" />
                            Сбросить
                        </Button>
                    </div>
                    <div className="mt-4 text-sm text-muted-foreground">
                        Найдено: <strong>{filteredUsers.length}</strong>
                    </div>
                </CardContent>
            </Card>

            {/* Empty state */}
            {filteredUsers.length === 0 ? (
                <Card className="text-center py-12">
                    <CardContent>
                        <Users className="h-16 w-16 mx-auto text-muted-foreground/50 mb-4" />
                        <p>Пользователи не найдены.</p>
                    </CardContent>
                </Card>
            ) : (
                <Card>
                    {/* Users table */}
                    <div className="overflow-x-auto">
                        <table className="w-full min-w-[1000px]">
                            <thead>
                            <tr className="border-b bg-muted/50">
                                {columns.map((col, i) => (
                                    <th
                                        key={i}
                                        className={`px-4 py-3 text-left text-sm font-semibold ${col.key ? 'cursor-pointer select-none hover:bg-muted/80' : ''}`}
                                        onClick={() => handleSort(col.key)}
                                    >
                                        <div className="flex items-center gap-1">
                                            {col.label}
                                            {col.key && (
                                                <ArrowUpDown
                                                    className={`h-3 w-3 transition-colors ${
                                                        filters.sortBy === col.key ? 'text-primary' : 'text-muted-foreground'
                                                    }`
                                                }
                                                />
                                            )}
                                        </div>
                                    </th>
                                ))}
                            </tr>
                            </thead>
                            <tbody>
                                {paginated.map(u => (
                                    <tr key={u.id} className="border-b hover:bg-muted/30">
                                        <td className="px-4 py-3 font-medium truncate max-w-[150px]">{u.firstName} {u.lastName}</td>
                                        <td className="px-4 py-3 text-sm truncate max-w-[200px]">{u.email}</td>
                                        <td className="px-4 py-3 text-sm truncate max-w-[100px]">{u.login}</td>
                                        <td className="px-4 py-3">
                                            <Badge variant={getUserRoleVariant(u.role)}>
                                                {getUserRoleLabel(u.role)}
                                            </Badge>
                                        </td>
                                        <td className="px-4 py-3">
                                            <Badge variant={getUserStatusVariant(u.status)}>
                                                {getUserStatusLabel(u.status)}
                                            </Badge>
                                        </td>
                                        <td className="px-4 py-3 text-sm">{u.phoneNumber || '—'}</td>
                                        <td className="px-4 py-3 text-sm truncate max-w-[120px]">{u.department || '—'}</td>
                                        <td className="px-4 py-3 text-sm">{formatDate(u.createdAt)}</td>
                                        <td className="px-4 py-3">
                                            <div className="flex gap-1">
                                                <Button variant="ghost" size="icon-sm" onClick={() => setModalState({ isOpen: true, user: u })}>
                                                    <Edit className="h-4 w-4" />
                                                </Button>
                                                <Button
                                                    variant="ghost" size="icon-sm"
                                                    onClick={() => handleAction('status', u)}
                                                    disabled={u.id === currentUser?.id}
                                                >
                                                    {u.status === UserStatus.ACTIVE
                                                        ? <Lock className="h-4 w-4" /> : <Unlock className="h-4 w-4" />
                                                    }
                                                </Button>
                                                <Button
                                                    variant="ghost"
                                                    size="icon-sm"
                                                    onClick={() => handleAction('delete', u)}
                                                    className="text-destructive"
                                                    disabled={u.id === currentUser?.id}
                                                >
                                                    <Trash2 className="h-4 w-4"/>
                                                </Button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </Card>
            )}

            {/* Pagination */}
            {filteredUsers.length > itemsPerPage &&
                <Pagination
                    currentPage={currentPage}
                    totalPages={Math.ceil(filteredUsers.length / itemsPerPage)}
                    onPageChange={setCurrentPage}
                    totalItems={filteredUsers.length}
                    itemsPerPage={itemsPerPage}
                />}

            <UserFormModal
                isOpen={modalState.isOpen}
                user={modalState.user}
                onClose={() => setModalState({ isOpen: false, user: null })}
                onSubmit={handleSave}
            />
        </div>
    );
};

export default UserManagement;