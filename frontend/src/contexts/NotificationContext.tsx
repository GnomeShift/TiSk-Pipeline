import React, { createContext, useContext, useState, ReactNode, useCallback, useRef } from 'react';

export type NotificationType = 'success' | 'error' | 'warning' | 'info';

export interface Notification {
    id: string;
    type: NotificationType;
    title?: string;
    message: string;
    duration?: number;
}

interface NotificationContextType {
    notifications: Notification[];
    addNotification: (
        type: NotificationType,
        message: string,
        title?: string,
        duration?: number
    ) => void;
    removeNotification: (id: string) => void;
    success: (message: string, title?: string) => void;
    error: (message: string, title?: string) => void;
    warning: (message: string, title?: string) => void;
    info: (message: string, title?: string) => void;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

interface NotificationProviderProps {
    children: ReactNode;
}

export const NotificationProvider: React.FC<NotificationProviderProps> = ({ children }) => {
    const [notifications, setNotifications] = useState<Notification[]>([]);
    const timeoutsRef = useRef<Map<string, number>>(new Map());

    const removeNotification = useCallback((id: string) => {
        const timeout = timeoutsRef.current.get(id);
        if (timeout) {
            clearTimeout(timeout);
            timeoutsRef.current.delete(id);
        }

        setNotifications(prevNotifications =>
            prevNotifications.filter(notification => notification.id !== id)
        );
    }, []);

    const addNotification = useCallback((
        type: NotificationType,
        message: string,
        title?: string,
        duration: number = 5000
    ) => {
        const id = `${Date.now()}-${Math.random()}`;
        const notification: Notification = {
            id,
            type,
            title,
            message,
            duration
        };

        setNotifications(prev => [...prev, notification]);

        if (duration > 0) {
            const timeout = setTimeout(() => {
                removeNotification(id);
            }, duration);
            timeoutsRef.current.set(id, timeout);
        }
    }, [removeNotification]);

    const success = useCallback((message: string, title?: string) => {
        addNotification('success', message, title, 3000);
    }, [addNotification]);

    const error = useCallback((message: string, title?: string) => {
        addNotification('error', message, title, 5000);
    }, [addNotification]);

    const warning = useCallback((message: string, title?: string) => {
        addNotification('warning', message, title, 5000);
    }, [addNotification]);

    const info = useCallback((message: string, title?: string) => {
        addNotification('info', message, title, 5000);
    }, [addNotification]);

    return (
        <NotificationContext.Provider value={{
            notifications,
            addNotification,
            removeNotification,
            success,
            error,
            warning,
            info
        }}>
            {children}
        </NotificationContext.Provider>
    );
};

export const useNotification = () => {
    const context = useContext(NotificationContext);
    if (!context) {
        throw new Error('useNotification must be used within a NotificationProvider');
    }
    return context;
};