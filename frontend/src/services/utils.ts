import { UserRole, UserStatus } from '../types/user';
import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export const getTicketStatusVariant = (status: string): 'open' | 'progress' | 'closed' => {
    switch (status) {
        case 'OPEN': return 'open';
        case 'IN_PROGRESS': return 'progress';
        case 'CLOSED': return 'closed';
        default: return 'closed';
    }
};

export const getTicketPriorityVariant = (priority: string): 'priority-low' | 'priority-medium' | 'priority-high' | 'priority-very-high' => {
    switch (priority) {
        case 'VERY_HIGH': return 'priority-very-high';
        case 'HIGH': return 'priority-high';
        case 'MEDIUM': return 'priority-medium';
        case 'LOW': return 'priority-low';
        default: return 'priority-low';
    }
};

export const getTicketStatusLabel = (status: string) => {
    switch (status) {
        case 'OPEN': return 'Открыт';
        case 'IN_PROGRESS': return 'В работе';
        case 'CLOSED': return 'Закрыт';
        default: return status;
    }
};

export const getTicketStatusColor: Record<string, string> = {
    OPEN: '#28a745',
    IN_PROGRESS: '#ffc107',
    CLOSED: '#6c757d'
};

export const getTicketPriorityLabel = (priority: string) => {
    switch (priority) {
        case 'VERY_HIGH': return 'Очень высокий';
        case 'HIGH': return 'Высокий';
        case 'MEDIUM': return 'Средний';
        case 'LOW': return 'Низкий';
        default: return priority;
    }
};

export const getUserRoleVariant = (role: string): 'admin' | 'support' | 'user' => {
    switch (role) {
        case 'ADMIN': return 'admin';
        case 'SUPPORT': return 'support';
        default: return 'user';
    }
};

export const getUserRoleLabel = (role: UserRole): string => {
    switch (role) {
        case UserRole.ADMIN: return 'Администратор';
        case UserRole.SUPPORT: return 'Поддержка';
        case UserRole.USER: return 'Пользователь';
        default: return role;
    }
};

export const getUserStatusVariant = (status: string): 'active' | 'inactive' | 'suspended' => {
    switch (status) {
        case 'ACTIVE': return 'active';
        case 'INACTIVE': return 'inactive';
        case 'SUSPENDED': return 'suspended';
        default: return 'inactive';
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

/**
 * Combines and merges Tailwind class names using clsx.
 * This prevents class conflicts like "p-2 p-4" by keeping only the last one.
 *
 * @example
 * cn("px-2 py-1", condition && "bg-red-500", "px-4")
 * // Returns: "py-1 px-4 bg-red-500" if condition is true
 */
export function cn(...inputs: ClassValue[]): string {
    return twMerge(clsx(inputs));
}

export function formatDate(date: string | Date, options: Intl.DateTimeFormatOptions = {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
    }
): string {
    return new Date(date).toLocaleDateString('ru-RU', options);
}

export const formatTime = (hours: number | null | undefined): string => {
    if (hours === null || hours === undefined) return '—';
    if (hours < 1) return `${Math.round(hours * 60)} мин`;
    if (hours < 24) return `${hours.toFixed(1)} ч`;
    return `${Math.floor(hours / 24)} д ${Math.round(hours % 24)} ч`;
};

export function formatDateTime(date: string | Date): string {
    return new Date(date).toLocaleString('ru-RU', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
    });
}

export function getUserInitials(firstName?: string, lastName?: string): string {
    const first = firstName?.charAt(0) || '';
    const last = lastName?.charAt(0) || '';
    return (first + last).toUpperCase();
}

export const stripHtml = (html: string): string => {
    if (!html) return '';

    const withSpaces = html
        .replace(/<br\s*\/?>/gi, ' ')
        .replace(/<\/(p|div|li|tr|h[1-6]|blockquote|pre)>/gi, ' ');

    const tmp = document.createElement('DIV');
    tmp.innerHTML = withSpaces;

    const text = tmp.textContent || tmp.innerText || '';
    return text.replace(/\s+/g, ' ').trim();
};