import React from 'react';
import { cn } from '../../services/utils';

const Skeleton = React.forwardRef<
    HTMLDivElement,
    React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
    <div
        ref={ref}
        className={cn(
            'animate-pulse rounded-md bg-muted',
            className
        )} {...props}
    />
));

Skeleton.displayName = 'Skeleton';

export const SkeletonTicketCard: React.FC = () => (
    <div className="rounded-lg border bg-card shadow-card p-5 space-y-4">
        {/* Header */}
        <div className="flex items-start justify-between gap-2">
            <div className="flex-1 space-y-2">
                <Skeleton className="h-5 w-full" />
                <Skeleton className="h-5 w-2/3" />
            </div>
            <Skeleton className="h-6 w-20 rounded-full" />
        </div>

        {/* Description */}
        <div className="space-y-2">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-4/5" />
        </div>

        <div className="flex items-center justify-between pb-3 border-b">
            <Skeleton className="h-6 w-20 rounded-full" />
            <Skeleton className="h-4 w-24" />
        </div>

        {/* Users */}
        <div className="space-y-2">
            <div className="flex items-center gap-2">
                <Skeleton className="h-4 w-12" />
                <Skeleton className="h-4 w-32" />
            </div>
            <div className="flex items-center gap-2">
                <Skeleton className="h-4 w-20" />
                <Skeleton className="h-4 w-28" />
            </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between pt-3 border-t">
            <Skeleton className="h-4 w-24" />
            <div className="flex gap-1">
                {[1, 2, 3].map(i => <Skeleton key={i} className="h-8 w-8 rounded-md" />)}
            </div>
        </div>
    </div>
);

export const SkeletonTable: React.FC<{ rows?: number; cols?: number }> = ({ rows = 5, cols = 6 }) => (
    <div className="rounded-lg border bg-card overflow-hidden">
        {/* Header */}
        <div className="bg-muted/50 px-4 py-3 flex gap-4">
            {Array.from({ length: cols }).map((_, i) => (
                <Skeleton key={i} className="h-4 flex-1" />
            ))}
        </div>

        {/* Rows */}
        {Array.from({ length: rows }).map((_, rowIndex) => (
            <div key={rowIndex} className="px-4 py-3 flex gap-4 border-t">
                {Array.from({ length: cols }).map((_, colIndex) => (
                    <Skeleton
                        key={colIndex}
                        className={cn(
                            'h-4 flex-1',
                            colIndex === 0 && 'w-32',
                            colIndex === cols - 1 && 'w-24'
                        )}
                    />
                ))}
            </div>
        ))}
    </div>
);

export const SkeletonText: React.FC<{ lines?: number; className?: string }> = ({ lines = 3, className }) => (
    <div className={cn('space-y-2', className)}>
        {Array.from({ length: lines }).map((_, i) => (
            <Skeleton
                key={i}
                className={cn(
                    'h-4',
                    i === lines - 1 ? 'w-4/5' : 'w-full'
                )}
            />
        ))}
    </div>
);

export const SkeletonProfile: React.FC = () => (
    <div className="space-y-6 max-w-3xl mx-auto">
        {/* Header */}
        <div className="flex items-center gap-3">
            <Skeleton className="h-8 w-8 rounded" />
            <Skeleton className="h-8 w-48" />
        </div>

        {/* Profile */}
        <div className="rounded-lg border bg-card p-6 space-y-6">
            <div className="flex items-center justify-between">
                <Skeleton className="h-6 w-40" />
                <Skeleton className="h-10 w-32 rounded-md" />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {Array.from({ length: 8 }).map((_, i) => (
                    <div key={i} className="space-y-1">
                        <Skeleton className="h-4 w-20" />
                        <Skeleton className="h-5 w-full" />
                    </div>
                ))}
            </div>
        </div>

        {/* Password */}
        <div className="rounded-lg border bg-card p-6 space-y-4">
            <Skeleton className="h-6 w-40" />
            <div className="max-w-md space-y-4">
                {Array.from({ length: 3 }).map((_, i) => (
                    <div key={i} className="space-y-2">
                        <Skeleton className="h-4 w-32" />
                        <Skeleton className="h-10 w-full rounded-md" />
                    </div>
                ))}
                <Skeleton className="h-10 w-40 rounded-md" />
            </div>
        </div>
    </div>
);

export const SkeletonTicketDetail: React.FC = () => (
    <div className="space-y-4">
        <div className="rounded-lg border bg-card p-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                    <Skeleton className="h-10 w-10 rounded-md" />
                    <Skeleton className="h-7 w-48" />
                </div>
                <div className="flex gap-2">
                    <Skeleton className="h-10 w-32 rounded-md" />
                    <Skeleton className="h-10 w-24 rounded-md" />
                </div>
            </div>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            <div className="lg:col-span-2 rounded-lg border bg-card p-6 space-y-4">
                <Skeleton className="h-8 w-3/4" />
                <Skeleton className="h-4 w-20" />
                <SkeletonText lines={4} />
            </div>
            <div className="rounded-lg border bg-card p-6 space-y-4">
                <Skeleton className="h-6 w-32" />
                {Array.from({ length: 6 }).map((_, i) => (
                    <div key={i} className="space-y-1.5">
                        <Skeleton className="h-4 w-20" />
                        <Skeleton className="h-5 w-full" />
                    </div>
                ))}
            </div>
        </div>
    </div>
);

export const SkeletonTicketForm: React.FC = () => (
    <div className="max-w-3xl mx-auto space-y-6">
        <Skeleton className="h-10 w-24 rounded-md" />
        <div className="rounded-lg border bg-card p-6 space-y-6">
            <Skeleton className="h-8 w-64" />
            <div className="space-y-2">
                <Skeleton className="h-4 w-20" />
                <Skeleton className="h-10 w-full rounded-md" />
            </div>
            <div className="space-y-2">
                <Skeleton className="h-4 w-20" />
                <Skeleton className="h-32 w-full rounded-md" />
            </div>
            <div className="grid gap-6 md:grid-cols-2">
                <div className="space-y-2">
                    <Skeleton className="h-4 w-20" />
                    <Skeleton className="h-10 w-full rounded-md" />
                </div>
                <div className="space-y-2">
                    <Skeleton className="h-4 w-20" />
                    <Skeleton className="h-10 w-full rounded-md" />
                </div>
            </div>
            <div className="flex gap-3 pt-4">
                <Skeleton className="h-10 w-28 rounded-md" />
                <Skeleton className="h-10 w-24 rounded-md" />
            </div>
        </div>
    </div>
);

export const SkeletonUserManagement: React.FC = () => (
    <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <Skeleton className="h-8 w-64" />
            <Skeleton className="h-10 w-48 rounded-md" />
        </div>
        <div className="rounded-lg border bg-card p-6 space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-10 rounded-md" />)}
            </div>
            <Skeleton className="h-4 w-32" />
        </div>
        <SkeletonTable rows={5} cols={9} />
    </div>
);

export const SkeletonStatistics: React.FC = () => (
    <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <Skeleton className="h-8 w-40" />
            <Skeleton className="h-10 w-32 rounded-md" />
        </div>
        <div className="rounded-lg border bg-card p-1">
            <div className="flex gap-1">
                {[1, 2, 3].map(i => <Skeleton key={i} className="h-10 flex-1 rounded-md" />)}
            </div>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="rounded-lg border bg-card p-6">
                    <div className="flex items-center gap-4">
                        <Skeleton className="h-14 w-14 rounded-xl" />
                        <div className="space-y-2">
                            <Skeleton className="h-8 w-16" />
                            <Skeleton className="h-4 w-24" />
                        </div>
                    </div>
                </div>
            ))}
        </div>
        <div className="rounded-lg border bg-card p-6 space-y-4">
            <Skeleton className="h-6 w-32" />
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {[1, 2, 3].map(i => (
                    <div key={i} className="p-4 bg-muted/50 rounded-lg text-center space-y-3">
                        <Skeleton className="h-5 w-20 mx-auto" />
                        <div className="flex justify-center gap-6">
                            <div className="space-y-1">
                                <Skeleton className="h-8 w-12 mx-auto" />
                                <Skeleton className="h-3 w-16 mx-auto" />
                            </div>
                            <div className="space-y-1">
                                <Skeleton className="h-8 w-12 mx-auto" />
                                <Skeleton className="h-3 w-16 mx-auto" />
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    </div>
);

export { Skeleton };