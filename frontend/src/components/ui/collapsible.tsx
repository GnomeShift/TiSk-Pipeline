import * as React from 'react';
import { cn } from '../../services/utils';
import { ChevronDown } from 'lucide-react';

interface CollapsibleProps {
    children: React.ReactNode;
    title?: React.ReactNode;
    defaultOpen?: boolean;
    className?: string;
    contentClassName?: string;
    open?: boolean;
    onOpenChange?: (open: boolean) => void;
    trigger?: React.ReactNode;
}

export const Collapsible: React.FC<CollapsibleProps> = ({
                                                            children,
                                                            title,
                                                            defaultOpen = true,
                                                            className,
                                                            contentClassName,
                                                            open: controlledOpen,
                                                            onOpenChange,
                                                            trigger,
                                                        }) => {
    const [internalOpen, setInternalOpen] = React.useState(defaultOpen);
    const isControlled = controlledOpen !== undefined;
    const isOpen = isControlled ? controlledOpen : internalOpen;

    const handleToggle = React.useCallback(() => {
        if (isControlled) {
            onOpenChange?.(!controlledOpen);
        } else {
            setInternalOpen(prev => !prev);
        }
    }, [isControlled, controlledOpen, onOpenChange]);

    return (
        <div className={cn('rounded-lg border bg-card', className)}>
            {title && !trigger && (
                <button
                    type="button"
                    onClick={handleToggle}
                    className="flex items-center justify-between w-full p-4 text-left font-medium hover:bg-muted/50 transition-colors rounded-t-lg"
                >
                    {title}
                    <ChevronDown
                        className={cn(
                            'h-5 w-5 text-muted-foreground transition-transform duration-200',
                            isOpen && 'rotate-180'
                        )}
                    />
                </button>
            )}

            {trigger}

            <div
                className={cn(
                    'overflow-hidden transition-all duration-200',
                    isOpen ? 'max-h-[1000px] opacity-100' : 'max-h-0 opacity-0'
                )}
            >
                <div className={cn('p-4 pt-0 border-t', contentClassName)}>
                    {children}
                </div>
            </div>
        </div>
    );
};

export const useCollapsible = (defaultOpen = false) => {
    const [isOpen, setIsOpen] = React.useState(defaultOpen);
    const toggle = React.useCallback(() => setIsOpen(prev => !prev), []);
    const open = React.useCallback(() => setIsOpen(true), []);
    const close = React.useCallback(() => setIsOpen(false), []);

    return { isOpen, toggle, open, close, setIsOpen };
};