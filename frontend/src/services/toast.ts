import { toast as sonnerToast } from 'sonner';

export const toast = {
    success: (message: string, options?: { title?: string; duration?: number }) => {
        sonnerToast.success(options?.title || 'Успешно', {
            description: message,
            duration: options?.duration ?? 3000
        });
    },

    error: (message: string, options?: { title?: string; duration?: number }) => {
        sonnerToast.error(options?.title || 'Ошибка', {
            description: message,
            duration: options?.duration ?? 5000
        });
    },

    warning: (message: string, options?: { title?: string; duration?: number }) => {
        sonnerToast.warning(options?.title || 'Предупреждение', {
            description: message,
            duration: options?.duration ?? 5000
        });
    },

    info: (message: string, options?: { title?: string; duration?: number }) => {
        sonnerToast.info(options?.title || 'Информация', {
            description: message,
            duration: options?.duration ?? 4000
        });
    },

    custom: sonnerToast
};