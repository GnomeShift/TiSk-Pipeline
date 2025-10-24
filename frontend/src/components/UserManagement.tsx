import React, { useEffect, useState, useMemo } from 'react';
import { UserDTO, UserRole, UserStatus, CreateUserDTO, UpdateUserDTO } from '../types/user';
import { userService } from '../services/userService';
import { useAuth } from '../contexts/AuthContext';
import Pagination from './Pagination';
import { getRoleLabel } from '../services/utils'

const UserManagement: React.FC = () => {
    const { user: currentUser } = useAuth();
    const [users, setUsers] = useState<UserDTO[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [editingUser, setEditingUser] = useState<UserDTO | null>(null);
    const [isCreating, setIsCreating] = useState(false);

    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage] = useState(10);

    const [search, setSearch] = useState('');
    const [roleFilter, setRoleFilter] = useState<string>('ALL');
    const [statusFilter, setStatusFilter] = useState<string>('ALL');

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
        } catch (err) {
            setError('Ошибка загрузки пользователей');
            console.error(err);
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
                (user.login && user.login.toLowerCase().includes(searchLower))
            );
        }

        if (roleFilter !== 'ALL') {
            filtered = filtered.filter(user => user.role === roleFilter);
        }

        if (statusFilter !== 'ALL') {
            filtered = filtered.filter(user => user.status === statusFilter);
        }

        return filtered;
    }, [users, search, roleFilter, statusFilter]);

    const paginatedUsers = useMemo(() => {
        const start = (currentPage - 1) * itemsPerPage;
        const end = start + itemsPerPage;
        return filteredUsers.slice(start, end);
    }, [currentPage, filteredUsers, itemsPerPage]);

    const totalPages = Math.ceil(filteredUsers.length / itemsPerPage);

    useEffect(() => {
        setCurrentPage(1);
    }, [search, roleFilter, statusFilter]);

    const handleCreateUser = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            await userService.create(formData);
            await loadUsers();
            setIsCreating(false);
            resetForm();
        } catch (err: any) {
            alert(err.response?.data?.message || 'Ошибка при создании пользователя');
        }
    };

    const handleUpdateUser = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!editingUser) return;

        try {
            await userService.update(editingUser.id, editFormData);
            await loadUsers();
            setEditingUser(null);
        } catch (err: any) {
            alert(err.response?.data?.message || 'Ошибка при обновлении пользователя');
        }
    };

    const handleDeleteUser = async (userId: string) => {
        if (userId === currentUser?.id) {
            alert('Вы не можете удалить свой собственный аккаунт');
            return;
        }

        if (window.confirm('Вы уверены, что хотите удалить этого пользователя?')) {
            try {
                await userService.delete(userId);
                await loadUsers();
            } catch (err) {
                alert('Ошибка при удалении пользователя');
            }
        }
    };

    const handleChangeStatus = async (userId: string, status: UserStatus) => {
        if (userId === currentUser?.id) {
            alert('Вы не можете изменить свой собственный статус');
            return;
        }

        try {
            await userService.changeStatus(userId, status);
            await loadUsers();
        } catch (err) {
            alert('Ошибка при изменении статуса');
        }
    };

    const openEditModal = (user: UserDTO) => {
        setEditingUser(user);
        setEditFormData({
            email: user.email,
            firstName: user.firstName,
            lastName: user.lastName,
            login: user.login || '',
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

    if (loading) return <div className="loading">Загрузка...</div>;
    if (error) return <div className="error">{error}</div>;

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
                <div className="filter-group">
                    <input
                        type="text"
                        placeholder="Поиск по имени, email или логину..."
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
                        <option value={UserStatus.ACTIVE}>Активен</option>
                        <option value={UserStatus.INACTIVE}>Неактивен</option>
                        <option value={UserStatus.SUSPENDED}>Заблокирован</option>
                    </select>
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
                                    />
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
                                    />
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
                                        pattern="^[a-zA-Z0-9_]+$"
                                        className="form-control"
                                    />
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
                                    />
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
                                    />
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
                                    />
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
                                />
                            </div>

                            <div className="form-group">
                                <label>Логин *</label>
                                <input
                                    type="text"
                                    name="login"
                                    value={editFormData.login}
                                    onChange={handleEditFormChange}
                                    pattern="^[a-zA-Z0-9_]+$"
                                    className="form-control"
                                />
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
                                    <option value={UserStatus.ACTIVE}>Активен</option>
                                    <option value={UserStatus.INACTIVE}>Неактивен</option>
                                    <option value={UserStatus.SUSPENDED}>Заблокирован</option>
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

            <div className="table-wrapper">
                <div className="users-table">
                    <table>
                        <thead>
                        <tr>
                            <th>Имя</th>
                            <th>Email</th>
                            <th>Логин</th>
                            <th>Роль</th>
                            <th>Статус</th>
                            <th>Отдел</th>
                            <th>Регистрация</th>
                            <th>Действия</th>
                        </tr>
                        </thead>
                        <tbody>
                        {paginatedUsers.map(user => (
                            <tr key={user.id}>
                                <td>
                                        <span className="cell-text" title={`${user.firstName} ${user.lastName}`}>
                                            {user.firstName} {user.lastName}
                                        </span>
                                </td>
                                <td>
                                        <span className="cell-text" title={user.email}>
                                            {user.email}
                                        </span>
                                </td>
                                <td>
                                        <span className="cell-text" title={user.login}>
                                            {user.login}
                                        </span>
                                </td>
                                <td>
                                        <span className={`role-badge role-${user.role.toLowerCase()}`}>
                                            {getRoleLabel(user.role)}
                                        </span>
                                </td>
                                <td>
                                        <span className={`status-badge status-${user.status.toLowerCase()}`}>
                                            {user.status}
                                        </span>
                                </td>
                                <td>
                                        <span className="cell-text" title={user.department || ''}>
                                            {user.department || '—'}
                                        </span>
                                </td>
                                <td>
                                    {new Date(user.createdAt).toLocaleDateString()}
                                </td>
                                <td>
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
        </div>
    );
};

export default UserManagement;