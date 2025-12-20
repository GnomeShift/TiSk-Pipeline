import React, { useEffect, useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { TicketDTO } from '../types/ticket';
import { ticketService } from '../services/ticketService';
import { getPriorityStyle, getStatusStyle, getStatusLabel, getPriorityLabel } from '../services/utils';
import TicketFilters from './TicketFilters';
import Pagination from './Pagination';
import { useAuth } from '../contexts/AuthContext';
import { useNotification } from '../contexts/NotificationContext';
import { UserRole } from '../types/user';

const TicketList: React.FC = () => {
    const { user } = useAuth();
    const notification = useNotification();
    const [allTickets, setAllTickets] = useState<TicketDTO[]>([]);
    const [loading, setLoading] = useState(true);
    const [viewMode, setViewMode] = useState<'all' | 'reported' | 'assigned' | 'available'>('all');

    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage] = useState(9);

    const [search, setSearch] = useState('');
    const [status, setStatus] = useState('ALL');
    const [priority, setPriority] = useState('ALL');
    const [sortBy, setSortBy] = useState<'createdAt' | 'updatedAt' | 'priority'>('createdAt');
    const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

    useEffect(() => {
        loadTickets();
    }, []);

    useEffect(() => {
        if (user) {
            if (user.role === UserRole.USER) {
                setViewMode('reported');
            } else if (user.role === UserRole.SUPPORT) {
                setViewMode('available');
            } else {
                setViewMode('all');
            }
        }
    }, [user]);

    const loadTickets = async () => {
        try {
            setLoading(true);
            const data = await ticketService.getAll();
            setAllTickets(data);
        } catch (err: any) {
            notification.error('Ошибка загрузки тикетов');
        } finally {
            setLoading(false);
        }
    };

    const getTicketsByViewMode = (tickets: TicketDTO[]): TicketDTO[] => {
        if (!user) return [];

        switch (viewMode) {
            case 'reported': return tickets.filter(t => t.reporter?.id === user.id);
            case 'assigned': return tickets.filter(t => t.assignee?.id === user.id);
            case 'available': return tickets.filter(t => !t.assignee && t.status !== 'CLOSED');
            case 'all':
                if (user.role === UserRole.ADMIN) {
                    return tickets;
                } else if (user.role === UserRole.SUPPORT) {
                    return tickets.filter(t => t.reporter?.id === user.id || t.assignee?.id === user.id || !t.assignee);
                } else {
                    return tickets.filter(t => t.reporter?.id === user.id);
                }
            default: return tickets;
        }
    };

    const filteredAndSortedTickets = useMemo(() => {
        let filtered = [...getTicketsByViewMode(allTickets)];

        if (search) {
            const searchLower = search.toLowerCase();
            filtered = filtered.filter(ticket =>
                ticket.title.toLowerCase().includes(searchLower) ||
                ticket.description.toLowerCase().includes(searchLower) ||
                ticket.id.toLowerCase().includes(searchLower)
            );
        }

        if (status !== 'ALL') {
            filtered = filtered.filter(ticket => ticket.status === status);
        }

        if (priority !== 'ALL') {
            filtered = filtered.filter(ticket => ticket.priority === priority);
        }

        filtered.sort((a, b) => {
            let aVal: any = a[sortBy as keyof TicketDTO];
            let bVal: any = b[sortBy as keyof TicketDTO];

            if (sortBy === 'priority') {
                const priorityOrder = { 'VERY_HIGH': 4, 'HIGH': 3, 'MEDIUM': 2, 'LOW': 1 };
                aVal = priorityOrder[aVal as keyof typeof priorityOrder] || 0;
                bVal = priorityOrder[bVal as keyof typeof priorityOrder] || 0;
            }

            if (sortBy === 'createdAt' || sortBy === 'updatedAt') {
                aVal = new Date(aVal).getTime();
                bVal = new Date(bVal).getTime();
            }

            if (sortOrder === 'desc') {
                return bVal > aVal ? 1 : -1;
            }
            return aVal > bVal ? 1 : -1;
        });

        return filtered;
    }, [allTickets, viewMode, search, status, priority, sortBy, sortOrder, user]);

    const paginatedTickets = useMemo(() => {
        const start = (currentPage - 1) * itemsPerPage;
        const end = start + itemsPerPage;
        return filteredAndSortedTickets.slice(start, end);
    }, [currentPage, filteredAndSortedTickets, itemsPerPage]);

    const totalPages = Math.ceil(filteredAndSortedTickets.length / itemsPerPage);

    useEffect(() => {
        setCurrentPage(1);
    }, [search, status, priority, sortBy, sortOrder, viewMode]);

    const handleDelete = async (id: string) => {
        if (window.confirm('Удалить этот тикет?')) {
            try {
                await ticketService.delete(id);
                await loadTickets();
                notification.success('Тикет успешно удален');
            } catch (err: any) {
                notification.error('Ошибка при удалении тикета');
            }
        }
    };

    const handleTakeTicket = async (ticketId: string) => {
        if (!user) return;

        try {
            await ticketService.assignTicket(ticketId, user.id);
            await loadTickets();
            notification.success('Тикет взят');
        } catch (err: any) {
            notification.error(err.response?.data?.message || 'Ошибка при взятии тикета');
        }
    };

    const handleResetFilters = () => {
        setSearch('');
        setStatus('ALL');
        setPriority('ALL');
        setSortBy('createdAt');
        setSortOrder('desc');
        setCurrentPage(1);
    };

    const handlePageChange = (page: number) => {
        setCurrentPage(page);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const canDelete = () => {
        if (!user) return false;
        return user.role === UserRole.ADMIN;
    };

    const canEdit = (ticket: TicketDTO) => {
        if (!user) return false;
        return user.role === UserRole.ADMIN || user.role === UserRole.SUPPORT || ticket.reporter?.id === user.id;
    };

    const canTake = (ticket: TicketDTO) => {
        if (!user) return false;
        return (user.role === UserRole.ADMIN || user.role === UserRole.SUPPORT) && !ticket.assignee && ticket.status !== 'CLOSED';
    };

    const getAvailableTabs = () => {
        if (!user) return [];

        const tabs: { key: 'all' | 'reported' | 'assigned' | 'available'; label: string; count: number }[] = [];

        if (user.role === UserRole.ADMIN) {
            tabs.push(
                { key: 'all', label: 'Все', count: allTickets.length },
                { key: 'available', label: 'Доступные', count: allTickets.filter(t => !t.assignee && t.status !== 'CLOSED').length },
                { key: 'assigned', label: 'В работе', count: allTickets.filter(t => t.assignee?.id === user.id).length },
                { key: 'reported', label: 'Мои', count: allTickets.filter(t => t.reporter?.id === user.id).length }
            );
        } else if (user.role === UserRole.SUPPORT) {
            tabs.push(
                { key: 'available', label: 'Доступные', count: allTickets.filter(t => !t.assignee && t.status !== 'CLOSED').length },
                { key: 'assigned', label: 'В работе', count: allTickets.filter(t => t.assignee?.id === user.id).length },
                { key: 'reported', label: 'Мои', count: allTickets.filter(t => t.reporter?.id === user.id).length }
            );
        } else {
            tabs.push(
                { key: 'reported', label: 'Мои', count: allTickets.filter(t => t.reporter?.id === user.id).length }
            );
        }

        return tabs;
    };

    if (loading) return <div className="loading"></div>;

    const availableTabs = getAvailableTabs();

    return (
        <div className="ticket-list">
            <div className="list-header">
                <h2>Список тикетов</h2>
                <div className="list-stats">
                    Найдено: <strong>{filteredAndSortedTickets.length}</strong>
                    {viewMode === 'all' && user?.role === UserRole.ADMIN &&
                        <> из <strong>{allTickets.length}</strong></>
                    }
                </div>
            </div>

            {availableTabs.length > 1 && (
                <div className="view-tabs">
                    {availableTabs.map(tab => (
                        <button
                            key={tab.key}
                            className={`tab ${viewMode === tab.key ? 'active' : ''}`}
                            onClick={() => setViewMode(tab.key)}
                        >
                            {tab.label}
                            <span className="tab-count">{tab.count}</span>
                        </button>
                    ))}
                </div>
            )}

            <TicketFilters
                search={search}
                status={status}
                priority={priority}
                sortBy={sortBy}
                sortOrder={sortOrder}
                onSearchChange={setSearch}
                onStatusChange={setStatus}
                onPriorityChange={setPriority}
                onSortByChange={(value: string) => setSortBy(value as any)}
                onSortOrderChange={(value: string) => setSortOrder(value as any)}
                onReset={handleResetFilters}
            />

            {paginatedTickets.length === 0 ? (
                <div className="empty-state">
                    <p>
                        {search || status !== 'ALL' || priority !== 'ALL'
                            ? 'Тикеты не найдены. Попробуйте изменить параметры поиска.'
                            : viewMode === 'available'
                                ? 'Нет доступных тикетов'
                                : viewMode === 'assigned'
                                    ? 'Нет тикетов'
                                    : viewMode === 'reported'
                                        ? 'Вы еще не создали ни одного тикета'
                                        : 'Нет тикетов'}
                    </p>
                    {viewMode === 'reported' && !(search || status !== 'ALL' || priority !== 'ALL') && (
                        <Link to="/create" className="btn btn-primary">
                            Создать первый тикет
                        </Link>
                    )}
                </div>
            ) : (
                <>
                    <div className="tickets-grid">
                        {paginatedTickets.map((ticket) => (
                            <div key={ticket.id} className="ticket-card">
                                <div className="ticket-header">
                                    <h3 className="ticket-title">
                                        <Link to={`/ticket/${ticket.id}`}
                                              title={ticket.title.length > 36 ? ticket.title : undefined}
                                        >
                                            {ticket.title}
                                        </Link>
                                    </h3>
                                    <span className={`priority ${getPriorityStyle(ticket.priority)}`}>
                                        {getPriorityLabel(ticket.priority)}
                                    </span>
                                </div>
                                <p className="ticket-description">{ticket.description}</p>
                                <div className="ticket-meta">
                                    <span className={`status ${getStatusStyle(ticket.status)}`}>
                                        {getStatusLabel(ticket.status)}
                                    </span>
                                    <span className="ticket-id">#{ticket.id.substring(0, 8)}</span>
                                </div>

                                <div className="ticket-users">
                                    {ticket.reporter ? (
                                        <div className="ticket-user">
                                            <span className="user-label">Автор:</span>
                                            <span className="user-name">
                                                {ticket.reporter.firstName} {ticket.reporter.lastName}
                                            </span>
                                        </div>
                                    ) : (
                                        <div className="ticket-user">
                                            <span className="user-label">Автор:</span>
                                            <span className="user-name text-muted">
                                                Нет
                                            </span>
                                        </div>
                                    )}
                                    {ticket.assignee ? (
                                        <div className="ticket-user">
                                            <span className="user-label">Исполнитель:</span>
                                            <span className="user-name">
                                                {ticket.assignee.firstName} {ticket.assignee.lastName}
                                            </span>
                                        </div>
                                    ) : (
                                        <div className="ticket-user">
                                            <span className="user-label">Исполнитель:</span>
                                            <span className="user-name text-muted">
                                                Нет
                                            </span>
                                        </div>
                                    )}
                                </div>

                                <div className="ticket-footer">
                                    <span className="ticket-date">
                                        {new Date(ticket.createdAt).toLocaleDateString()}
                                    </span>
                                    <div className="ticket-actions">
                                        <Link to={`/ticket/${ticket.id}`} className="btn btn-sm">
                                            Просмотр
                                        </Link>
                                        {canTake(ticket) && (
                                            <button
                                                onClick={() => handleTakeTicket(ticket.id)}
                                                className="btn btn-sm btn-primary"
                                            >
                                                Взять
                                            </button>
                                        )}
                                        {canEdit(ticket) && (
                                            <Link to={`/edit/${ticket.id}`} className="btn btn-sm" title="Редактировать">
                                                Ред.
                                            </Link>
                                        )}
                                        {canDelete() && (
                                            <button
                                                onClick={() => handleDelete(ticket.id)}
                                                className="btn btn-sm btn-danger"
                                            >
                                                Удалить
                                            </button>
                                        )}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>

                    {totalPages > 1 && (
                        <Pagination
                            currentPage={currentPage}
                            totalPages={totalPages}
                            onPageChange={handlePageChange}
                            totalItems={filteredAndSortedTickets.length}
                            itemsPerPage={itemsPerPage}
                        />
                    )}
                </>
            )}
        </div>
    );
};

export default TicketList;