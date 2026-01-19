import { Toaster as Sonner } from 'sonner';
import { useTheme } from '../../contexts/ThemeContext';
import React from 'react';

type ToasterProps = React.ComponentProps<typeof Sonner>;

const Toaster = ({ ...props }: ToasterProps) => {
    const { resolvedTheme } = useTheme();

    return (
        <Sonner
            theme={resolvedTheme as ToasterProps['theme']}
            className="toaster group"
            position="top-right"
            expand={false}
            richColors
            closeButton
            duration={4000}
            visibleToasts={5}
            toastOptions={{
                classNames: {
                    toast:
                        'group toast group-[.toaster]:bg-background group-[.toaster]:text-foreground group-[.toaster]:border-border group-[.toaster]:shadow-lg group-[.toaster]:rounded-lg',
                    description: 'group-[.toast]:text-muted-foreground',
                    actionButton:
                        'group-[.toast]:bg-primary group-[.toast]:text-primary-foreground',
                    cancelButton:
                        'group-[.toast]:bg-muted group-[.toast]:text-muted-foreground',
                    closeButton:
                        'group-[.toast]:bg-background group-[.toast]:text-foreground group-[.toast]:border-border group-[.toast]:hover:bg-muted',
                    // Success
                    success: 'group-[.toaster]:border-l-4 group-[.toaster]:border-l-green-500',
                    // Error
                    error: 'group-[.toaster]:border-l-4 group-[.toaster]:border-l-red-500',
                    // Warning
                    warning: 'group-[.toaster]:border-l-4 group-[.toaster]:border-l-amber-500',
                    // Info
                    info: 'group-[.toaster]:border-l-4 group-[.toaster]:border-l-blue-500',
                },
            }}
            {...props}
        />
    );
};

export { Toaster };