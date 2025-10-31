import React, { useState, useEffect } from 'react';
import { useNotification } from '../contexts/NotificationContext';

interface NotificationItemProps {
    notification: {
        id: string;
        type: string;
        title?: string;
        message: string;
        duration?: number;
    };
    onClose: (id: string) => void;
}

const NotificationItem: React.FC<NotificationItemProps> = ({ notification, onClose }) => {
    const [isVisible, setIsVisible] = useState(false);
    const [isLeaving, setIsLeaving] = useState(false);
    const [progress, setProgress] = useState(100);

    useEffect(() => {
        setIsVisible(true);

        if (notification.duration && notification.duration > 0) {
            const interval = setInterval(() => {
                setProgress((prev) => {
                    const newProgress = prev - (100 / (notification.duration! / 100));
                    if (newProgress <= 0) {
                        clearInterval(interval);
                        handleClose();
                        return 0;
                    }
                    return newProgress;
                });
            }, 100);

            return () => clearInterval(interval);
        }
    }, [notification.duration]);

    const getIcon = (type: string) => {
        switch (type) {
            case 'success': return '✓';
            case 'error': return '✕';
            case 'warning': return '⚠';
            case 'info': return 'ℹ';
            default: return 'ℹ';
        }
    };

    const handleClose = () => {
        if (isLeaving) return;
        setIsLeaving(true);
        setTimeout(() => {
            onClose(notification.id);
        }, 400);
    };

    return (
        <div
            className={`notification notification-${notification.type} ${
                isLeaving ? 'notification-exit' : isVisible ? 'notification-enter-active' : 'notification-enter'
            }`}
            onClick={handleClose}
        >
            <div className="notification-icon">
                {getIcon(notification.type)}
            </div>
            <div className="notification-content">
                {notification.title && (
                    <div className="notification-title">
                        {notification.title}
                    </div>
                )}
                <div className="notification-message">
                    {notification.message}
                </div>
            </div>
            <button
                className="notification-close"
                onClick={(e) => {
                    e.stopPropagation();
                    handleClose();
                }}
                type="button"
                aria-label="Закрыть"
            >
                ×
            </button>
            {notification.duration && notification.duration > 0 && (
                <div className="notification-progress">
                    <div
                        className="notification-progress-bar"
                        style={{ width: `${progress}%` }}
                    />
                </div>
            )}
        </div>
    );
};

const NotificationContainer: React.FC = () => {
    const { notifications, removeNotification } = useNotification();

    return (
        <div className="notification-container">
            {notifications.map(notification => (
                <NotificationItem
                    key={notification.id}
                    notification={notification}
                    onClose={removeNotification}
                />
            ))}
        </div>
    );
};

export default NotificationContainer;