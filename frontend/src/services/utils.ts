import { UserRole, UserStatus } from '../types/user';

export const getStatusColor = (status: string) => {
    switch (status) {
        case 'OPEN': return 'status-open';
        case 'IN_PROGRESS': return 'status-progress';
        case 'CLOSED': return 'status-closed';
        default: return '';
    }
};

export const getPriorityColor = (priority: string) => {
    switch (priority) {
        case 'VERY_HIGH': return 'priority-very-high';
        case 'HIGH': return 'priority-high';
        case 'MEDIUM': return 'priority-medium';
        case 'LOW': return 'priority-low';
        default: return '';
    }
};

export const getStatusLabel = (status: string) => {
    switch (status) {
        case 'OPEN': return 'Открыт';
        case 'IN_PROGRESS': return 'В работе';
        case 'CLOSED': return 'Закрыт';
        default: return status;
    }
};

export const getPriorityLabel = (priority: string) => {
    switch (priority) {
        case 'VERY_HIGH': return 'Очень высокий';
        case 'HIGH': return 'Высокий';
        case 'MEDIUM': return 'Средний';
        case 'LOW': return 'Низкий';
        default: return priority;
    }
};

export const getRoleLabel = (role: UserRole): string => {
    switch (role) {
        case UserRole.ADMIN: return 'Администратор';
        case UserRole.SUPPORT: return 'Поддержка';
        case UserRole.USER: return 'Пользователь';
        default: return role;
    }
};

export const getUserStatusLabel = (status: UserStatus): string => {
    switch (status) {
        case UserStatus.ACTIVE: return 'Активен';
        case UserStatus.INACTIVE: return 'Неактивен';
        case UserStatus.SUSPENDED: return 'Заблокирован';
        default: return status;
    }
};

export const validatePassword = (password: string): boolean => {
    const regex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/;
    return regex.test(password);
};