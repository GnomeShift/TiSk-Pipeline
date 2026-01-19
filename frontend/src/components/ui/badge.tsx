import * as React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '../../services/utils';

const badgeVariants = cva(
    'inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2',
    {
        variants: {
            variant: {
                default: 'border-transparent bg-primary text-primary-foreground',
                secondary: 'border-transparent bg-secondary text-secondary-foreground',
                destructive: 'border-transparent bg-destructive text-destructive-foreground',
                success: 'border-transparent bg-success text-success-foreground',
                warning: 'border-transparent bg-warning text-warning-foreground',
                outline: 'text-foreground',
                // Status
                open: 'border-transparent bg-success text-success-foreground',
                progress: 'border-transparent bg-warning text-warning-foreground',
                closed: 'border-transparent bg-slate-500 text-white dark:bg-slate-600',
                // Priority
                'priority-very-high': 'border-transparent bg-red-900 text-white dark:bg-red-800',
                'priority-high': 'border-transparent bg-destructive text-destructive-foreground',
                'priority-medium': 'border-transparent bg-warning text-warning-foreground',
                'priority-low': 'border-transparent bg-success text-success-foreground',
                // Role
                admin: 'border-transparent bg-destructive text-destructive-foreground',
                support: 'border-transparent bg-blue-500 text-white dark:bg-blue-600',
                user: 'border-transparent bg-slate-500 text-white dark:bg-slate-600',
                // User status
                active: 'border-transparent bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-300',
                inactive: 'border-transparent bg-amber-100 text-amber-800 dark:bg-amber-900/50 dark:text-amber-300',
                suspended: 'border-transparent bg-red-100 text-red-800 dark:bg-red-900/50 dark:text-red-300',
            },
        },
        defaultVariants: {
            variant: 'default',
        },
    }
);

export interface BadgeProps
    extends React.HTMLAttributes<HTMLDivElement>,
        VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
    return (
        <div className={cn(badgeVariants({ variant }), className)} {...props} />
    );
}

export { Badge, badgeVariants };