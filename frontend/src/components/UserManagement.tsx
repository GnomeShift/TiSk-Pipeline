import React, { useEffect, useState, useMemo } from 'react';
import { UserDTO, UserRole, UserStatus, CreateUserDTO, UpdateUserDTO } from '../types/user';
import { userService } from '../services/userService';
import { useAuth } from '../contexts/AuthContext';
import { useNotification } from '../contexts/NotificationContext.tsx'
import Pagination from './Pagination';
import { getRoleLabel, getUserStatusLabel, validatePassword, getStatusLabel } from '../services/utils'

const UserManagement: React.FC = () => {
    const { user: currentUser } = useAuth();
    const notification = useNotification();
    const [users, setUsers] = useState<UserDTO[]>([]);
    const [loading, setLoading] = useState(true);
    const [editingUser, setEditingUser] = useState<UserDTO | null>(null);
    const [isCreating, setIsCreating] = useState(false);

    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage] = useState(10);

    const [search, setSearch] = useState('');
    const [roleFilter, setRoleFilter] = useState<string>('ALL');
    const [statusFilter, setStatusFilter] = useState<string>('ALL');

    const [sortBy, setSortBy] = useState<string>('createdAt');
    const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

    const [formData, setFormData] = useState<CreateUserDTO>({
        email: '',
        password: '',
        firstName: '',
        lastName: '',
        login: '',
        phoneNumber: '',
        department: '',
        position: '',
        role: UserRole.USER
    });

    const [editFormData, setEditFormData] = useState<UpdateUserDTO>({
        email: '',
        firstName: '',
        lastName: '',
        login: '',
        phoneNumber: '',
        department: '',
        position: '',
        role: UserRole.USER,
        status: UserStatus.ACTIVE
    });

    useEffect(() => {
        loadUsers();
    }, []);

    const loadUsers = async () => {
        try {
            setLoading(true);
            const data = await userService.getAll();
            setUsers(data);
        } catch (err: any) {
            notification.error('Ошибка загрузки пользователей');
        } finally {
            setLoading(false);
        }
    };

    const filteredUsers = useMemo(() => {
        let filtered = [...users];

        if (search) {
            const searchLower = search.toLowerCase();
            filtered = filtered.filter(user =>
                user.email.toLowerCase().includes(searchLower) ||
                user.firstName.toLowerCase().includes(searchLower) ||
                user.lastName.toLowerCase().includes(searchLower) ||
                (user.login && user.login.toLowerCase().includes(searchLower)) ||
                (user.phoneNumber && user.phoneNumber.toLowerCase().includes(searchLower)) ||
                (user.department && user.department.toLowerCase().includes(searchLower)) ||
                (user.position && user.position.toLowerCase().includes(searchLower))
            );
        }

        if (roleFilter !== 'ALL') {
            filtered = filtered.filter(user => user.role === roleFilter);
        }

        if (statusFilter !== 'ALL') {
            filtered = filtered.filter(user => user.status === statusFilter);
        }

        filtered.sort((a, b) => {
            let aVal: any;
            let bVal: any;

            switch (sortBy) {
                case 'name':
                    aVal = `${a.firstName} ${a.lastName}`.toLowerCase();
                    bVal = `${b.firstName} ${b.lastName}`.toLowerCase();
                    break;
                case 'email':
                    aVal = a.email.toLowerCase();
                    bVal = b.email.toLowerCase();
                    break;
                case 'role':
                    aVal = a.role;
                    bVal = b.role;
                    break;
                case 'status':
                    aVal = a.status;
                    bVal = b.status;
                    break;
                case 'department':
                    aVal = (a.department || '').toLowerCase();
                    bVal = (b.department || '').toLowerCase();
                    break;
                case 'createdAt':
                    aVal = new Date(a.createdAt).getTime();
                    bVal = new Date(b.createdAt).getTime();
                    break;
                case 'updatedAt':
                    aVal = new Date(a.updatedAt).getTime();
                    bVal = new Date(b.updatedAt).getTime();
                    break;
                default:
                    aVal = a[sortBy as keyof UserDTO];
                    bVal = b[sortBy as keyof UserDTO];
            }

            if (sortOrder === 'asc') {
                return aVal > bVal ? 1 : -1;
            }
            return bVal > aVal ? 1 : -1;
        });

        return filtered;
    }, [users, search, roleFilter, statusFilter, sortBy, sortOrder]);

    const paginatedUsers = useMemo(() => {
        const start = (currentPage - 1) * itemsPerPage;
        const end = start + itemsPerPage;
        return filteredUsers.slice(start, end);
    }, [currentPage, filteredUsers, itemsPerPage]);

    const totalPages = Math.ceil(filteredUsers.length / itemsPerPage);

    useEffect(() => {
        setCurrentPage(1);
    }, [search, roleFilter, statusFilter, sortBy, sortOrder]);

    const handleSort = (field: string) => {
        if (sortBy === field) {
            setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
        } else {
            setSortBy(field);
            setSortOrder('asc');
        }
    };

    const handleResetFilters = () => {
        setSearch('');
        setRoleFilter('ALL');
        setStatusFilter('ALL');
        setSortBy('createdAt');
        setSortOrder('desc');
        setCurrentPage(1);
    };

    const handleCreateUser = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!validatePassword(formData.password)) {
            notification.error('Пароль должен содержать минимум 8 символов, включая заглавные и строчные буквы, а также цифры');
            return;
        }

        try {
            await userService.create(formData);
            await loadUsers();
            setIsCreating(false);
            resetForm();
            notification.success('Пользователь успешно создан')
        } catch (err: any) {
            notification.error(err.response?.data?.message || 'Ошибка при создании пользователя');
        }
    };

    const handleUpdateUser = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!editingUser) return;

        try {
            await userService.update(editingUser.id, editFormData);
            await loadUsers();
            setEditingUser(null);
            notification.success('Пользователь успешно обновлен')
        } catch (err: any) {
            notification.error(err.response?.data?.message || 'Ошибка при обновлении пользователя');
        }
    };

    const handleDeleteUser = async (userId: string) => {
        if (userId === currentUser?.id) {
            notification.info('Вы не можете удалить свой аккаунт');
            return;
        }

        if (window.confirm('Вы уверены, что хотите удалить этого пользователя?')) {
            try {
                await userService.delete(userId);
                await loadUsers();
                notification.success('Пользователь успешно удален')
            } catch (err: any) {
                notification.error(err.response?.data?.message || 'Ошибка при удалении пользователя');
            }
        }
    };

    const handleChangeStatus = async (userId: string, status: UserStatus) => {
        if (userId === currentUser?.id) {
            notification.info('Вы не можете изменить свой статус');
            return;
        }

        try {
            await userService.changeStatus(userId, status);
            await loadUsers();
            notification.success(`Статус пользователя изменен на ${getStatusLabel(status)}`);
        } catch (err: any) {
            notification.error(err.response?.data?.message || 'Ошибка при изменении статуса');
        }
    };

    const openEditModal = (user: UserDTO) => {
        setEditingUser(user);
        setEditFormData({
            email: user.email,
            firstName: user.firstName,
            lastName: user.lastName,
            login: user.login,
            phoneNumber: user.phoneNumber || '',
            department: user.department || '',
            position: user.position || '',
            role: user.role,
            status: user.status
        });
    };

    const resetForm = () => {
        setFormData({
            email: '',
            password: '',
            firstName: '',
            lastName: '',
            login: '',
            phoneNumber: '',
            department: '',
            position: '',
            role: UserRole.USER
        });
    };

    const handleFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };

    const handleEditFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        setEditFormData({
            ...editFormData,
            [e.target.name]: e.target.value
        });
    };

    const getSortIcon = (field: string) => {
        if (sortBy !== field) return '↕';
        return sortOrder === 'asc' ? '↑' : '↓';
    };

    const hasActiveFilters = search !== '' || roleFilter !== 'ALL' || statusFilter !== 'ALL';

    if (loading) return <div className="loading"></div>;

    return (
        <div className="user-management">
            <div className="management-header">
                <h2>Управление пользователями</h2>
                <button
                    onClick={() => setIsCreating(true)}
                    className="btn btn-primary"
                >
                    Добавить пользователя
                </button>
            </div>

            <div className="user-filters">
                <div className="filter-group search-group">
                    <input
                        type="text"
                        placeholder="Поиск по имени, email, телефону, отделу, должности..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="search-input"
                    />
                </div>
                <div className="filter-group">
                    <select
                        value={roleFilter}
                        onChange={(e) => setRoleFilter(e.target.value)}
                        className="filter-select"
                    >
                        <option value="ALL">Все роли</option>
                        <option value={UserRole.USER}>{getRoleLabel(UserRole.USER)}</option>
                        <option value={UserRole.SUPPORT}>{getRoleLabel(UserRole.SUPPORT)}</option>
                        <option value={UserRole.ADMIN}>{getRoleLabel((UserRole.ADMIN))}</option>
                    </select>
                </div>
                <div className="filter-group">
                    <select
                        value={statusFilter}
                        onChange={(e) => setStatusFilter(e.target.value)}
                        className="filter-select"
                    >
                        <option value="ALL">Все статусы</option>
                        <option value={UserStatus.ACTIVE}>{getUserStatusLabel(UserStatus.ACTIVE)}</option>
                        <option value={UserStatus.INACTIVE}>{getUserStatusLabel(UserStatus.INACTIVE)}</option>
                        <option value={UserStatus.SUSPENDED}>{getUserStatusLabel(UserStatus.SUSPENDED)}</option>
                    </select>
                </div>
                <div className="filter-group filter-actions">
                    <button
                        onClick={handleResetFilters}
                        className="btn btn-secondary"
                    >
                        Сбросить фильтры
                    </button>
                </div>
                <div className="filter-stats">
                    Найдено: {filteredUsers.length} из {users.length}
                </div>
            </div>

            {isCreating && (
                <div className="modal-overlay" onClick={() => setIsCreating(false)}>
                    <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                        <div className="modal-header">
                            <h3>Создать пользователя</h3>
                            <button
                                className="modal-close"
                                onClick={() => {
                                    setIsCreating(false);
                                    resetForm();
                                }}
                            >
                                ✕
                            </button>
                        </div>
                        <form onSubmit={handleCreateUser}>
                            <div className="form-row">
                                <div className="form-group">
                                    <label>Имя *</label>
                                    <input
                                        type="text"
                                        name="firstName"
                                        value={formData.firstName}
                                        onChange={handleFormChange}
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
                                    <label>Фамилия *</label>
                                    <input
                                        type="text"
                                        name="lastName"
                                        value={formData.lastName}
                                        onChange={handleFormChange}
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
                            </div>

                            <div className="form-group">
                                <label>Email *</label>
                                <input
                                    type="email"
                                    name="email"
                                    value={formData.email}
                                    onChange={handleFormChange}
                                    required
                                    className="form-control"
                                    placeholder="user@example.com"
                                />
                            </div>

                            <div className="form-row">
                                <div className="form-group">
                                    <label>Логин *</label>
                                    <input
                                        type="text"
                                        name="login"
                                        value={formData.login}
                                        onChange={handleFormChange}
                                        required
                                        pattern="^[a-zA-Z0-9_]+$"
                                        className="form-control"
                                        minLength={3}
                                        maxLength={50}
                                        placeholder="user_login"
                                    />
                                    <small className="form-hint">
                                        Минимум 3, максимум 50 символов, только буквы, цифры и подчеркивания
                                    </small>
                                </div>
                                <div className="form-group">
                                    <label>Пароль *</label>
                                    <input
                                        type="password"
                                        name="password"
                                        value={formData.password}
                                        onChange={handleFormChange}
                                        required
                                        minLength={8}
                                        className="form-control"
                                        placeholder="••••••••"
                                    />
                                    <small className="form-hint">
                                        Минимум 8 символов, заглавные и строчные буквы, цифры
                                    </small>
                                </div>
                            </div>

                            <div className="form-row">
                                <div className="form-group">
                                    <label>Телефон</label>
                                    <input
                                        type="tel"
                                        name="phoneNumber"
                                        value={formData.phoneNumber}
                                        onChange={handleFormChange}
                                        className="form-control"
                                        pattern="^$|^\+?[1-9]\d{0,10}$"
                                        placeholder="+7XXXXXXXXXX"
                                    />
                                </div>
                                <div className="form-group">
                                    <label>Роль *</label>
                                    <select
                                        name="role"
                                        value={formData.role}
                                        onChange={handleFormChange}
                                        className="form-control"
                                    >
                                        <option value={UserRole.USER}>{getRoleLabel(UserRole.USER)}</option>
                                        <option value={UserRole.SUPPORT}>{getRoleLabel(UserRole.SUPPORT)}</option>
                                        <option value={UserRole.ADMIN}>{getRoleLabel((UserRole.ADMIN))}</option>
                                    </select>
                                </div>
                            </div>

                            <div className="form-row">
                                <div className="form-group">
                                    <label>Отдел</label>
                                    <input
                                        type="text"
                                        name="department"
                                        value={formData.department}
                                        onChange={handleFormChange}
                                        className="form-control"
                                    />
                                </div>
                                <div className="form-group">
                                    <label>Должность</label>
                                    <input
                                        type="text"
                                        name="position"
                                        value={formData.position}
                                        onChange={handleFormChange}
                                        className="form-control"
                                    />
                                </div>
                            </div>

                            <div className="modal-actions">
                                <button type="submit" className="btn btn-primary">
                                    Создать
                                </button>
                                <button
                                    type="button"
                                    onClick={() => {
                                        setIsCreating(false);
                                        resetForm();
                                    }}
                                    className="btn btn-secondary"
                                >
                                    Отмена
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {editingUser && (
                <div className="modal-overlay" onClick={() => setEditingUser(null)}>
                    <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                        <div className="modal-header">
                            <h3>Редактировать пользователя</h3>
                            <button
                                className="modal-close"
                                onClick={() => setEditingUser(null)}
                            >
                                ✕
                            </button>
                        </div>
                        <form onSubmit={handleUpdateUser}>
                            <div className="form-row">
                                <div className="form-group">
                                    <label>Имя *</label>
                                    <input
                                        type="text"
                                        name="firstName"
                                        value={editFormData.firstName}
                                        onChange={handleEditFormChange}
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
                                    <label>Фамилия *</label>
                                    <input
                                        type="text"
                                        name="lastName"
                                        value={editFormData.lastName}
                                        onChange={handleEditFormChange}
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
                                <label>Email *</label>
                                <input
                                    type="email"
                                    name="email"
                                    value={editFormData.email}
                                    onChange={handleEditFormChange}
                                    required
                                    className="form-control"
                                    placeholder="user@example.com"
                                />
                            </div>

                            <div className="form-group">
                                <label>Логин *</label>
                                <input
                                    type="text"
                                    name="login"
                                    value={editFormData.login}
                                    onChange={handleEditFormChange}
                                    required
                                    pattern="^[a-zA-Z0-9_]+$"
                                    className="form-control"
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
                                    <label>Телефон</label>
                                    <input
                                        type="tel"
                                        name="phoneNumber"
                                        value={editFormData.phoneNumber}
                                        onChange={handleEditFormChange}
                                        className="form-control"
                                        pattern="^$|^\+?[1-9]\d{0,10}$"
                                        placeholder="+7XXXXXXXXXX"
                                    />
                                </div>
                                <div className="form-group">
                                    <label>Роль *</label>
                                    <select
                                        name="role"
                                        value={editFormData.role}
                                        onChange={handleEditFormChange}
                                        className="form-control"
                                        disabled={editingUser.id === currentUser?.id}
                                    >
                                        <option value={UserRole.USER}>{getRoleLabel(UserRole.USER)}</option>
                                        <option value={UserRole.SUPPORT}>{getRoleLabel(UserRole.SUPPORT)}</option>
                                        <option value={UserRole.ADMIN}>{getRoleLabel((UserRole.ADMIN))}</option>
                                    </select>
                                </div>
                            </div>

                            <div className="form-row">
                                <div className="form-group">
                                    <label>Отдел</label>
                                    <input
                                        type="text"
                                        name="department"
                                        value={editFormData.department}
                                        onChange={handleEditFormChange}
                                        className="form-control"
                                    />
                                </div>
                                <div className="form-group">
                                    <label>Должность</label>
                                    <input
                                        type="text"
                                        name="position"
                                        value={editFormData.position}
                                        onChange={handleEditFormChange}
                                        className="form-control"
                                    />
                                </div>
                            </div>

                            <div className="form-group">
                                <label>Статус *</label>
                                <select
                                    name="status"
                                    value={editFormData.status}
                                    onChange={handleEditFormChange}
                                    className="form-control"
                                    disabled={editingUser.id === currentUser?.id}
                                >
                                    <option value={UserStatus.ACTIVE}>{getUserStatusLabel(UserStatus.ACTIVE)}</option>
                                    <option value={UserStatus.INACTIVE}>{getUserStatusLabel(UserStatus.INACTIVE)}</option>
                                    <option value={UserStatus.SUSPENDED}>{getUserStatusLabel(UserStatus.SUSPENDED)}</option>
                                </select>
                            </div>

                            <div className="modal-actions">
                                <button type="submit" className="btn btn-primary">
                                    Сохранить
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setEditingUser(null)}
                                    className="btn btn-secondary"
                                >
                                    Отмена
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {filteredUsers.length === 0 ? (
                <div className="empty-state">
                    <div className="empty-icon">👥</div>
                    <h3>Пользователи не найдены</h3>
                    {hasActiveFilters ? (
                        <>
                            <p>По заданным фильтрам не найдено ни одного пользователя.</p>
                            <button
                                onClick={handleResetFilters}
                                className="btn btn-primary"
                            >
                                Сбросить фильтры
                            </button>
                        </>
                    ) : (
                        <p>В системе нет зарегистрированных пользователей.</p>
                    )}
                </div>
            ) : (
                <>
                    <div className="table-wrapper">
                        <div className="users-table">
                            <table>
                                <thead>
                                <tr>
                                    <th className="th-name sortable" onClick={() => handleSort('name')}>
                                        Имя {getSortIcon('name')}
                                    </th>
                                    <th className="th-email sortable" onClick={() => handleSort('email')}>
                                        Email {getSortIcon('email')}
                                    </th>
                                    <th className="th-login">Логин</th>
                                    <th className="th-role sortable" onClick={() => handleSort('role')}>
                                        Роль {getSortIcon('role')}
                                    </th>
                                    <th className="th-status sortable" onClick={() => handleSort('status')}>
                                        Статус {getSortIcon('status')}
                                    </th>
                                    <th className="th-phone">Телефон</th>
                                    <th className="th-department sortable" onClick={() => handleSort('department')}>
                                        Отдел {getSortIcon('department')}
                                    </th>
                                    <th className="th-position">Должность</th>
                                    <th className="th-date sortable" onClick={() => handleSort('createdAt')}>
                                        Регистрация {getSortIcon('createdAt')}
                                    </th>
                                    <th className="th-date sortable" onClick={() => handleSort('updatedAt')}>
                                        Изменен {getSortIcon('updatedAt')}
                                    </th>
                                    <th className="th-actions">Действия</th>
                                </tr>
                                </thead>
                                <tbody>
                                {paginatedUsers.map(user => (
                                    <tr key={user.id}>
                                        <td className="td-name">
                                                <span className="cell-text" title={`${user.firstName} ${user.lastName}`}>
                                                    {user.firstName} {user.lastName}
                                                </span>
                                        </td>
                                        <td className="td-email">
                                                <span className="cell-text" title={user.email}>
                                                    {user.email}
                                                </span>
                                        </td>
                                        <td className="td-login">
                                                <span className="cell-text" title={user.login}>
                                                    {user.login}
                                                </span>
                                        </td>
                                        <td className="td-role">
                                                <span className={`role-badge role-${user.role.toLowerCase()}`}>
                                                    {getRoleLabel(user.role)}
                                                </span>
                                        </td>
                                        <td className="td-status">
                                                <span className={`status-badge status-${user.status.toLowerCase()}`}>
                                                    {getUserStatusLabel(user.status)}
                                                </span>
                                        </td>
                                        <td className="td-phone">
                                                <span className="cell-text" title={user.phoneNumber || ''}>
                                                    {user.phoneNumber || '—'}
                                                </span>
                                        </td>
                                        <td className="td-department">
                                                <span className="cell-text" title={user.department || ''}>
                                                    {user.department || '—'}
                                                </span>
                                        </td>
                                        <td className="td-position">
                                                <span className="cell-text" title={user.position || ''}>
                                                    {user.position || '—'}
                                                </span>
                                        </td>
                                        <td className="td-date">
                                                <span className="cell-date">
                                                    {new Date(user.createdAt).toLocaleDateString()}
                                                </span>
                                        </td>
                                        <td className="td-date">
                                                <span className="cell-date">
                                                    {new Date(user.updatedAt).toLocaleDateString()}
                                                </span>
                                        </td>
                                        <td className="td-actions">
                                            <div className="table-actions">
                                                <button
                                                    onClick={() => openEditModal(user)}
                                                    className="btn-icon btn-primary"
                                                    title="Редактировать"
                                                >
                                                    ✎
                                                </button>
                                                <button
                                                    onClick={() => handleChangeStatus(
                                                        user.id,
                                                        user.status === UserStatus.ACTIVE ? UserStatus.SUSPENDED : UserStatus.ACTIVE
                                                    )}
                                                    className="btn-icon btn-warning"
                                                    title={user.status === UserStatus.ACTIVE ? "Заблокировать" : "Разблокировать"}
                                                    disabled={user.id === currentUser?.id}
                                                >
                                                    {user.status === UserStatus.ACTIVE ? '🔒' : '🔓'}
                                                </button>
                                                <button
                                                    onClick={() => handleDeleteUser(user.id)}
                                                    className="btn-icon btn-danger"
                                                    title="Удалить"
                                                    disabled={user.id === currentUser?.id}
                                                >
                                                    🗑
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                                </tbody>
                            </table>
                        </div>
                    </div>

                    {totalPages > 1 && (
                        <Pagination
                            currentPage={currentPage}
                            totalPages={totalPages}
                            onPageChange={setCurrentPage}
                            totalItems={filteredUsers.length}
                            itemsPerPage={itemsPerPage}
                        />
                    )}
                </>
            )}
        </div>
    );
};

export default UserManagement;