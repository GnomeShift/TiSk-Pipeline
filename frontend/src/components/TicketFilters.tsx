import React from 'react';
import { cn } from '../services/utils';
import { Collapsible, useCollapsible } from './ui/collapsible';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { TicketPrioritySelect, TicketStatusSelect } from './ui/entity-select';
import { ChevronDown, Filter, RotateCcw, Search, X } from 'lucide-react';

interface TicketFiltersProps {
    search: string;
    status: string;
    priority: string;
    sortBy: string;
    sortOrder: string;
    onSearchChange: (value: string) => void;
    onStatusChange: (value: string) => void;
    onPriorityChange: (value: string) => void;
    onSortByChange: (value: string) => void;
    onSortOrderChange: (value: string) => void;
    onReset: () => void;
}

const TicketFilters: React.FC<TicketFiltersProps> = ({
                                                         search, status, priority, sortBy, sortOrder,
                                                         onSearchChange, onStatusChange, onPriorityChange,
                                                         onSortByChange, onSortOrderChange, onReset
                                                     }) => {
    const { isOpen, toggle } = useCollapsible(false);

    const activeFiltersCount = [
        status !== 'ALL',
        priority !== 'ALL',
        sortBy !== 'createdAt',
        sortOrder !== 'desc',
    ].filter(Boolean).length;

    return (
        <Collapsible
            open={isOpen}
            onOpenChange={toggle}
            className="shadow-sm"
            contentClassName="pt-4"
            trigger={
                <div className="p-4">
                    <div className="flex gap-2">
                        <div className="relative flex-1">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                            <Input
                                type="text"
                                placeholder="Поиск по заголовку, описанию или ID..."
                                value={search}
                                onChange={(e) => onSearchChange(e.target.value)}
                                className="pl-10 pr-10"
                            />
                            {search && (
                                <button
                                    onClick={() => onSearchChange('')}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                                >
                                    <X className="w-4 h-4" />
                                </button>
                            )}
                        </div>

                        <Button variant={isOpen ? 'secondary' : 'outline'} onClick={toggle} className="gap-2">
                            <Filter className="w-4 h-4" />
                            <span className="hidden sm:inline">Фильтры</span>
                            {activeFiltersCount > 0 && (
                                <span className="flex items-center justify-center w-5 h-5 rounded-full bg-primary text-primary-foreground text-xs font-medium">
                                    {activeFiltersCount}
                                </span>
                            )}
                            <ChevronDown className={cn('w-4 h-4 transition-transform duration-200', isOpen && 'rotate-180')} />
                        </Button>
                    </div>
                </div>
            }
        >
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="space-y-1.5">
                    <Label className="text-sm">Статус</Label>
                    <TicketStatusSelect value={status} onChange={onStatusChange} includeAll />
                </div>

                <div className="space-y-1.5">
                    <Label className="text-sm">Приоритет</Label>
                    <TicketPrioritySelect value={priority} onChange={onPriorityChange} includeAll />
                </div>

                <div className="space-y-1.5">
                    <Label htmlFor="sort-by" className="text-sm">Сортировать по</Label>
                    <Select value={sortBy} onValueChange={onSortByChange}>
                        <SelectTrigger id="sort-by">
                            <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="createdAt">Дате создания</SelectItem>
                            <SelectItem value="updatedAt">Дате обновления</SelectItem>
                            <SelectItem value="priority">Приоритету</SelectItem>
                        </SelectContent>
                    </Select>
                </div>

                <div className="space-y-1.5">
                    <Label htmlFor="sort-order" className="text-sm">Порядок</Label>
                    <Select value={sortOrder} onValueChange={onSortOrderChange}>
                        <SelectTrigger id="sort-order">
                            <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="desc">По убыванию</SelectItem>
                            <SelectItem value="asc">По возрастанию</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
            </div>

            {(activeFiltersCount > 0 || search) && (
                <div className="flex justify-end mt-4 pt-4 border-t">
                    <Button variant="ghost" onClick={onReset} className="gap-2">
                        <RotateCcw className="w-4 h-4" /> Сбросить фильтры
                    </Button>
                </div>
            )}
        </Collapsible>
    );
};

export default TicketFilters;