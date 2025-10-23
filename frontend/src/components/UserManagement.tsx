import React, { useEffect, useState, useMemo } from 'react';
import { UserDTO, UserRole, UserStatus, CreateUserDTO, UpdateUserDTO } from '../types/user';
import { userService } from '../services/userService';
import { useAuth } from '../contexts/AuthContext';
import Pagination from './Pagination';

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

    const handleUpdateUser = async (userId: string, data: UpdateUserDTO) => {
        try {
            await userService.update(userId, data);
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
                        <option value={UserRole.ADMIN}>Администратор</option>
                        <option value={UserRole.SUPPORT}>Поддержка</option>
                        <option value={UserRole.USER}>Пользователь</option>
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
                        <h3>Создать пользователя</h3>
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
                                        <option value={UserRole.USER}>Пользователь</option>
                                        <option value={UserRole.SUPPORT}>Поддержка</option>
                                        <option value={UserRole.ADMIN}>Администратор</option>
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
                                {editingUser?.id === user.id ? (
                                    <div className="inline-edit">
                                        <input
                                            type="text"
                                            value={editingUser.firstName}
                                            onChange={(e) => setEditingUser({
                                                ...editingUser,
                                                firstName: e.target.value
                                            })}
                                            className="form-control-sm"
                                        />
                                        <input
                                            type="text"
                                            value={editingUser.lastName}
                                            onChange={(e) => setEditingUser({
                                                ...editingUser,
                                                lastName: e.target.value
                                            })}
                                            className="form-control-sm"
                                        />
                                    </div>
                                ) : (
                                    `${user.firstName} ${user.lastName}`
                                )}
                            </td>
                            <td>{user.email}</td>
                            <td>{user.login || '—'}</td>
                            <td>
                                {editingUser?.id === user.id ? (
                                    <select
                                        value={editingUser.role}
                                        onChange={(e) => setEditingUser({
                                            ...editingUser,
                                            role: e.target.value as UserRole
                                        })}
                                        className="form-control-sm"
                                        disabled={user.id === currentUser?.id}
                                    >
                                        <option value={UserRole.USER}>Пользователь</option>
                                        <option value={UserRole.SUPPORT}>Поддержка</option>
                                        <option value={UserRole.ADMIN}>Администратор</option>
                                    </select>
                                ) : (
                                    <span className={`role-badge role-${user.role.toLowerCase()}`}>
                                            {getRoleLabel(user.role)}
                                        </span>
                                )}
                            </td>
                            <td>
                                <select
                                    value={user.status}
                                    onChange={(e) => handleChangeStatus(user.id, e.target.value as UserStatus)}
                                    className="status-select-sm"
                                    disabled={user.id === currentUser?.id}
                                >
                                    <option value={UserStatus.ACTIVE}>Активен</option>
                                    <option value={UserStatus.INACTIVE}>Неактивен</option>
                                    <option value={UserStatus.SUSPENDED}>Заблокирован</option>
                                </select>
                            </td>
                            <td>{user.department || '—'}</td>
                            <td>{new Date(user.createdAt).toLocaleDateString()}</td>
                            <td>
                                <div className="table-actions">
                                    {editingUser?.id === user.id ? (
                                        <>
                                            <button
                                                onClick={() => handleUpdateUser(user.id, {
                                                    firstName: editingUser.firstName,
                                                    lastName: editingUser.lastName,
                                                    role: editingUser.role
                                                })}
                                                className="btn-icon btn-success"
                                                title="Сохранить"
                                            >
                                                ✓
                                            </button>
                                            <button
                                                onClick={() => setEditingUser(null)}
                                                className="btn-icon btn-secondary"
                                                title="Отмена"
                                            >
                                                ✕
                                            </button>
                                        </>
                                    ) : (
                                        <>
                                            <button
                                                onClick={() => setEditingUser(user)}
                                                className="btn-icon btn-primary"
                                                title="Редактировать"
                                                disabled={user.id === currentUser?.id}
                                            >
                                                ✎
                                            </button>
                                            <button
                                                onClick={() => handleDeleteUser(user.id)}
                                                className="btn-icon btn-danger"
                                                title="Удалить"
                                                disabled={user.id === currentUser?.id}
                                            >
                                                🗑
                                            </button>
                                        </>
                                    )}
                                </div>
                            </td>
                        </tr>
                    ))}
                    </tbody>
                </table>
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

const getRoleLabel = (role: UserRole): string => {
    switch (role) {
        case UserRole.ADMIN: return 'Администратор';
        case UserRole.SUPPORT: return 'Поддержка';
        case UserRole.USER: return 'Пользователь';
        default: return role;
    }
};

export default UserManagement;