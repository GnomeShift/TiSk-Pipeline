import React, { useEffect, useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { TicketDTO } from '../types/ticket';
import { ticketService } from '../services/ticketService';
import { getTicketStatusVariant, getTicketStatusLabel, getTicketPriorityVariant,
    getTicketPriorityLabel, cn, formatDate } from '../services/utils';
import TicketFilters from './TicketFilters';
import Pagination from './Pagination';
import { useAuth } from '../contexts/AuthContext';
import { UserRole } from '../types/user';
import { toast } from '../services/toast';
import {useDeleteConfirm} from './ui/confirm-dialog';
import { Badge } from './ui/badge';
import { Card, CardContent, CardFooter, CardHeader } from './ui/card';
import { SkeletonTicketCard, Skeleton } from './ui/skeleton';
import { SimpleTooltip } from './ui/tooltip';
import {Edit, Eye, NotebookText, Plus, Target, Trash2} from 'lucide-react';
import { Button } from './ui/button';
import { usePermissions } from '../hooks/usePermissions';
import { getErrorMessage } from '../services/errorTranslator';
import { stripHtml } from '../services/utils';

type ViewMode = 'all' | 'reported' | 'assigned' | 'available';

const TicketList: React.FC = () => {
    const { user } = useAuth();
    const deleteConfirm = useDeleteConfirm();
    const permissions = usePermissions();
    const [allTickets, setAllTickets] = useState<TicketDTO[]>([]);
    const [loading, setLoading] = useState(true);
    const [viewMode, setViewMode] = useState<ViewMode>('all');
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 9;
    const [search, setSearch] = useState('');
    const [status, setStatus] = useState('ALL');
    const [priority, setPriority] = useState('ALL');
    const [sortBy, setSortBy] = useState<'createdAt' | 'updatedAt' | 'priority'>('createdAt');
    const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

    useEffect(() => {
        loadTickets();
        if (!user) return;
        if (user.role === UserRole.USER) setViewMode('reported');
        else if (user.role === UserRole.SUPPORT) setViewMode('available');
        else setViewMode('all');
    }, [user]);

    const loadTickets = async () => {
        try {
            setLoading(true);
            setAllTickets(await ticketService.getAll());
        } catch (err) {
            toast.error(getErrorMessage(err));
        } finally {
            setLoading(false);
        }
    };

    const filteredAndSortedTickets = useMemo(() => {
        if (!user) return [];
        let res = [...allTickets];

        if (viewMode === 'reported') res = res.filter(t => t.reporter?.id === user.id);
        else if (viewMode === 'assigned') res = res.filter(t => t.assignee?.id === user.id);
        else if (viewMode === 'available') res = res.filter(t => !t.assignee && t.status !== 'CLOSED');
        else if (viewMode === 'all' && user.role !== UserRole.ADMIN) {
            res = res.filter(t => t.reporter?.id === user.id || t.assignee?.id === user.id || !t.assignee);
        }

        // Search and filters
        if (search) {
            const s = search.toLowerCase();
            res = res.filter(t => t.title.toLowerCase().includes(s) ||
                t.description.toLowerCase().includes(s) ||
                t.id.toLowerCase().includes(s));
        }
        if (status !== 'ALL') res = res.filter(t => t.status === status);
        if (priority !== 'ALL') res = res.filter(t => t.priority === priority);

        // Sorting
        res.sort((a, b) => {
            let aVal: any = a[sortBy], bVal: any = b[sortBy];
            if (sortBy === 'priority') {
                const map: any = { 'VERY_HIGH': 4, 'HIGH': 3, 'MEDIUM': 2, 'LOW': 1 };
                aVal = map[aVal] || 0; bVal = map[bVal] || 0;
            } else {
                aVal = new Date(aVal).getTime(); bVal = new Date(bVal).getTime();
            }
            return sortOrder === 'desc' ? (bVal > aVal ? 1 : -1) : (aVal > bVal ? 1 : -1);
        });

        return res;
    }, [allTickets, viewMode, search, status, priority, sortBy, sortOrder, user]);

    const paginatedTickets = filteredAndSortedTickets.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);
    const totalPages = Math.ceil(filteredAndSortedTickets.length / itemsPerPage);

    useEffect(() => { setCurrentPage(1);}, [search, status, priority, sortBy, sortOrder, viewMode]);

    const handleDelete = async (id: string, title: string) => {
        if (await deleteConfirm(`тикет "${title.length > 35 ? title.substring(0, 35) + '...' : title}"`)) {
            await ticketService.delete(id);
            await loadTickets();
            toast.success('Тикет удален');
        }
    };

    const handleTakeTicket = async (ticketId: string) => {
        if (!user) return;

        try {
            await ticketService.assignTicket(ticketId, user.id);
            await loadTickets();
            toast.success('Тикет взят в работу');
        } catch (err) {
            toast.error(getErrorMessage(err));
        }
    };

    if (loading) return (
        <div className="space-y-4">
            <div className="flex justify-between">
                <Skeleton className="h-8 w-48" />
                <Skeleton className="h-4 w-32" />
            </div>
                <Skeleton className="h-12 w-full" />
                <Skeleton className="h-14 w-full" />
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {[...Array(6)].map((_, i) => <SkeletonTicketCard key={i} />)}
            </div>
        </div>
    );

    const tabs = [];
    if (!user) return [];
    if (user.role === UserRole.ADMIN) {
        tabs.push(
            { k: 'all', l: 'Все', c: allTickets.length },
            { k: 'available', l: 'Доступные', c: allTickets.filter(t => !t.assignee && t.status !== 'CLOSED').length },
            { k: 'assigned', l: 'В работе', c: allTickets.filter(t => t.assignee?.id === user.id).length },
            { k: 'reported', l: 'Мои', c: allTickets.filter(t => t.reporter?.id === user.id).length }
        );
    }
    else if (user?.role === UserRole.SUPPORT) {
        tabs.push(
            { k: 'available', l: 'Доступные', c: allTickets.filter(t => !t.assignee && t.status !== 'CLOSED').length },
            { k: 'assigned', l: 'В работе', c: allTickets.filter(t => t.assignee?.id === user.id).length},
            { k: 'reported', l: 'Мои', c: allTickets.filter(t => t.reporter?.id === user.id).length }
        );
    }
    else {
        tabs.push(
            { k: 'reported', l: 'Мои', c: allTickets.filter(t => t.reporter?.id === user.id).length }
        );
    }

    return (
        <div className="space-y-4">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <h2 className="text-2xl font-bold">Список тикетов</h2>
                <p className="text-muted-foreground">
                    Найдено: <strong className="text-foreground">{filteredAndSortedTickets.length}</strong>
                    {viewMode === 'all' && user?.role === UserRole.ADMIN && (
                        <> из <strong className="text-foreground">{allTickets.length}</strong></>
                    )}
                </p>
            </div>

            {/* Tabs */}
            {tabs.length > 1 && (
                <Card className="p-1">
                    <div className="flex gap-1 overflow-x-auto scrollbar-hide">
                        {tabs.map(t => (
                            <button
                                key={t.k}
                                onClick={() => setViewMode(t.k as ViewMode)}
                                    className={cn(
                                        'flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-colors whitespace-nowrap',
                                        viewMode === t.k ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:text-foreground hover:bg-muted'
                                    )}
                            >
                                {t.l}
                                <span
                                    className={cn(
                                        'px-2 py-0.5 rounded-full text-xs font-semibold',
                                        viewMode === t.k ? 'bg-primary-foreground/20 text-primary-foreground' : 'bg-muted text-muted-foreground'
                                    )}
                                >
                                    {t.c}
                                </span>
                            </button>
                        ))}
                    </div>
                </Card>
            )}

            {/* Filters */}
            <TicketFilters
                search={search}
                status={status}
                priority={priority}
                sortBy={sortBy}
                sortOrder={sortOrder}
                onSearchChange={setSearch}
                onStatusChange={setStatus}
                onPriorityChange={setPriority}
                onSortByChange={(v) => setSortBy(v as any)}
                onSortOrderChange={(v) => setSortOrder(v as any)}
                onReset={() => {
                    setSearch('');
                    setStatus('ALL');
                    setPriority('ALL');
                    setSortBy('createdAt');
                    setSortOrder('desc');
                    setCurrentPage(1);
                }}
            />

            {/* Empty state */}
            {paginatedTickets.length === 0 ? (
                <Card className="text-center py-12">
                    <CardContent>
                        <div className="flex justify-center mb-4">
                            <NotebookText className="w-12 h-12 opacity-50" />
                        </div>

                        <h3 className="text-lg font-semibold mb-2">Тикеты не найдены</h3>
                        <p className="text-muted-foreground mb-4 max-w-md mx-auto">Попробуйте изменить фильтры.</p>
                        {viewMode === 'reported' &&
                            <Link to="/create" className="inline-flex items-center gap-2 px-4 py-2 rounded-md bg-primary text-primary-foreground hover:bg-primary/90">
                                <Plus className="w-4 h-4" />
                                Создать тикет
                            </Link>
                        }
                    </CardContent>
                </Card>
            ) : (
                // Tickets grid
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {paginatedTickets.map((t) => (
                        <Card key={t.id} className="flex flex-col hover:shadow-card-hover transition-shadow">
                            <CardHeader className="pb-2">
                                <div className="flex items-start justify-between gap-2">
                                    <h3 className="font-semibold flex-1 min-w-0">
                                        <Link to={`/ticket/${t.id}`} className="hover:text-primary transition-colors block truncate" title={t.title}>
                                            {t.title}
                                        </Link>
                                    </h3>
                                    <Badge variant={getTicketPriorityVariant(t.priority)} className="flex-shrink-0">
                                        {getTicketPriorityLabel(t.priority)}
                                    </Badge>
                                </div>
                            </CardHeader>

                            <CardContent className="flex-1 pb-3">
                                <p className="text-sm text-muted-foreground line-clamp-2 mb-3 break-words">
                                    {stripHtml(t.description)}
                                </p>

                                <div className="flex items-center justify-between mb-3 pb-3 border-b">
                                    <Badge variant={getTicketStatusVariant(t.status)}>{getTicketStatusLabel(t.status)}</Badge>
                                    <span className="text-xs text-muted-foreground font-mono">#{t.id.substring(0, 8)}</span>
                                </div>

                                <div className="space-y-1 text-sm">
                                    <div className="flex items-baseline gap-2">
                                        <span className="text-muted-foreground font-medium flex-shrink-0">Автор:</span>
                                        <span className={cn('truncate', t.reporter ? '' : 'text-muted-foreground italic')}>
                                            {t.reporter ? `${t.reporter.firstName} ${t.reporter.lastName}` : 'Нет'}
                                        </span>
                                    </div>
                                    <div className="flex items-baseline gap-2">
                                        <span className="text-muted-foreground font-medium flex-shrink-0">Исполнитель:</span>
                                        <span className={cn('truncate', t.assignee ? '' : 'text-muted-foreground italic')}>
                                            {t.assignee ? `${t.assignee.firstName} ${t.assignee.lastName}` : 'Нет'}
                                        </span>
                                    </div>
                                </div>

                            </CardContent>
                            <CardFooter className="pt-3 border-t flex items-center justify-between gap-2">
                                <span className="text-xs text-muted-foreground">{formatDate(t.createdAt)}</span>

                                <div className="flex gap-1">
                                    <SimpleTooltip content="Просмотр">
                                        <Button variant="ghost" size="icon-sm" asChild>
                                            <Link to={`/ticket/${t.id}`}>
                                                <Eye className="w-4 h-4" />
                                            </Link>
                                        </Button>
                                    </SimpleTooltip>

                                    {permissions.canTakeTicket(t) && (
                                        <SimpleTooltip content="Взять в работу">
                                        <Button variant="ghost" size="icon-sm" onClick={() => handleTakeTicket(t.id)}>
                                            <Target className="w-4 h-4" />
                                        </Button>
                                        </SimpleTooltip>
                                    )}
                                    {permissions.canEditTicket(t) && (
                                        <SimpleTooltip content="Редактировать">
                                            <Link to={`/edit/${t.id}`} className="inline-flex items-center justify-center h-8 w-8 rounded-md hover:bg-accent transition-colors">
                                                <Edit className="w-4 h-4" />
                                            </Link>
                                        </SimpleTooltip>
                                    )}
                                    {permissions.canDeleteTicket(t) && (
                                        <SimpleTooltip content="Удалить">
                                        <button
                                            onClick={() => handleDelete(t.id, t.title)}
                                            className="inline-flex items-center justify-center h-8 w-8 rounded-md text-destructive hover:bg-destructive hover:text-destructive-foreground dark:hover:bg-red-900/50 transition-colors"
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </button>
                                        </SimpleTooltip>
                                    )}
                                </div>
                            </CardFooter>
                        </Card>
                    ))}
                </div>
            )}

            {/* Pagination */}
            {totalPages > 1 &&
                <Pagination
                    currentPage={currentPage}
                    totalPages={totalPages}
                    onPageChange={(p) => { setCurrentPage(p); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
                    totalItems={filteredAndSortedTickets.length}
                    itemsPerPage={itemsPerPage}
                />}
        </div>
    );
};

export default TicketList;