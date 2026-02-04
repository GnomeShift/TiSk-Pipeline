import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from './dialog';
import { Button } from './button';
import { AlertTriangle, Trash2, Info, HelpCircle } from 'lucide-react';
import { cn } from '../../services/utils';
import {UserStatus} from "../../types/user.ts";

type ConfirmVariant = 'danger' | 'warning' | 'info' | 'default';

interface ConfirmOptions {
    title?: string;
    description?: ReactNode | string;
    confirmText?: string;
    cancelText?: string;
    variant?: ConfirmVariant;
}

interface ConfirmContextType {
    confirm: (options: ConfirmOptions) => Promise<boolean>;
}

const ConfirmContext = createContext<ConfirmContextType | undefined>(undefined);

interface ConfirmProviderProps {
    children: ReactNode;
}

export const ConfirmProvider: React.FC<ConfirmProviderProps> = ({ children }) => {
    const [isOpen, setIsOpen] = useState(false);
    const [options, setOptions] = useState<ConfirmOptions | null>(null);
    const [resolveRef, setResolveRef] = useState<((value: boolean) => void) | null>(null);

    const confirm = useCallback((opts: ConfirmOptions): Promise<boolean> => {
        return new Promise((resolve) => {
            setOptions(opts);
            setResolveRef(() => resolve);
            setIsOpen(true);
        });
    }, []);

    const handleConfirm = useCallback(() => {
        setIsOpen(false);
        resolveRef?.(true);
    }, [resolveRef]);

    const handleCancel = useCallback(() => {
        setIsOpen(false);
        resolveRef?.(false);
    }, [resolveRef]);

    const getIcon = (variant: ConfirmVariant) => {
        switch (variant) {
            case 'danger': return <Trash2 className="w-6 h-6" />;
            case 'warning': return <AlertTriangle className="w-6 h-6" />;
            case 'info': return <Info className="w-6 h-6" />;
            default: return <HelpCircle className="w-6 h-6" />;
        }
    };

    const getIconColor = (variant: ConfirmVariant) => {
        switch (variant) {
            case 'danger': return 'text-destructive bg-destructive/10';
            case 'warning': return 'text-amber-500 bg-amber-500/10';
            case 'info': return 'text-blue-500 bg-blue-500/10';
            default: return 'text-muted-foreground bg-muted';
        }
    };

    const getConfirmButtonVariant = (variant: ConfirmVariant) => {
        switch (variant) {
            case 'danger': return 'destructive';
            case 'warning': return 'warning';
            default: return 'default';
        }
    };

    return (
        <ConfirmContext.Provider value={{ confirm }}>
            {children}

            <Dialog open={isOpen} onOpenChange={(open) => !open && handleCancel()}>
                <DialogContent className="max-w-md">
                    <DialogHeader>
                        <div className="flex items-start gap-4">
                            {options?.variant && (
                                <div className={cn(
                                    'flex items-center justify-center w-12 h-12 rounded-full flex-shrink-0',
                                    getIconColor(options.variant)
                                )}>
                                    {getIcon(options.variant)}
                                </div>
                            )}
                            <div className="flex-1 pt-1">
                                <DialogTitle className="text-lg">
                                    {options?.title}
                                </DialogTitle>
                                <DialogDescription className="mt-2">
                                    {options?.description}
                                </DialogDescription>
                            </div>
                        </div>
                    </DialogHeader>

                    <DialogFooter className="gap-2 sm:gap-0">
                        <Button
                            variant={getConfirmButtonVariant(options?.variant || 'default') as any}
                            onClick={handleConfirm}
                        >
                            {options?.confirmText || 'Подтвердить'}
                        </Button>
                        <Button variant="outline" onClick={handleCancel}>
                            {options?.cancelText || 'Отмена'}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </ConfirmContext.Provider>
    );
};

export const useConfirm = () => {
    const context = useContext(ConfirmContext);
    if (!context) {
        throw new Error('useConfirm must be used within a ConfirmProvider');
    }
    return context;
};

export const useDeleteConfirm = () => {
    const { confirm } = useConfirm();

    return useCallback((itemName: string) => {
        return confirm({
            title: 'Удалить?',
            description: (
                <div className="text-sm text-muted-foreground">
                    <span>Вы уверены, что хотите удалить </span>
                    <span className="wrap-break-word">{itemName}</span>
                    ?
                    <span className="font-medium text-foreground">
                        <br/>
                        Это действие нельзя отменить!
                    </span>
                </div>
            ),
            confirmText: 'Удалить',
            cancelText: 'Отмена',
            variant: 'danger',
        });
    }, [confirm]);
};

export const useBlockConfirm = () => {
    const { confirm } = useConfirm();

    return useCallback((userName: string, newStatus: UserStatus) => {
        const isBlocking = newStatus === UserStatus.SUSPENDED;
        return confirm({
            title: isBlocking ? 'Заблокировать пользователя?' : 'Разблокировать пользователя?',
            description: isBlocking
                ? `Пользователь "${userName}" не сможет войти.`
                : `Пользователь "${userName}" снова сможет войти.`,
            confirmText: isBlocking ? 'Заблокировать' : 'Разблокировать',
            cancelText: 'Отмена',
            variant: isBlocking ? 'warning' : 'default',
        });
    }, [confirm]);
};