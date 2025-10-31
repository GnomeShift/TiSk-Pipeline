import React, { useEffect, useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { TicketDTO } from '../types/ticket';
import { ticketService } from '../services/ticketService';
import { getPriorityColor, getStatusColor, getStatusLabel, getPriorityLabel } from '../services/utils';
import TicketFilters from './TicketFilters';
import Pagination from './Pagination';
import { useAuth } from '../contexts/AuthContext';
import { useNotification } from '../contexts/NotificationContext';

const TicketList: React.FC = () => {
    const { user } = useAuth();
    const notification = useNotification();
    const [allTickets, setAllTickets] = useState<TicketDTO[]>([]);
    const [loading, setLoading] = useState(true);

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

    const filteredAndSortedTickets = useMemo(() => {
        let filtered = [...allTickets];

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
    }, [allTickets, search, status, priority, sortBy, sortOrder]);

    const paginatedTickets = useMemo(() => {
        const start = (currentPage - 1) * itemsPerPage;
        const end = start + itemsPerPage;
        return filteredAndSortedTickets.slice(start, end);
    }, [currentPage, filteredAndSortedTickets, itemsPerPage]);

    const totalPages = Math.ceil(filteredAndSortedTickets.length / itemsPerPage);

    useEffect(() => {
        setCurrentPage(1);
    }, [search, status, priority, sortBy, sortOrder]);

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

    const handleSearchChange = (value: string) => {
        setSearch(value);
    };

    const handleSortByChange = (value: string) => {
        setSortBy(value as 'createdAt' | 'updatedAt' | 'priority');
    };

    const handleSortOrderChange = (value: string) => {
        setSortOrder(value as 'asc' | 'desc');
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
        return user?.role === 'ADMIN';
    };

    const canEdit = (ticket: TicketDTO) => {
        return user?.role === 'ADMIN' || user?.role === 'SUPPORT' || ticket.reporter?.id === user?.id;
    };

    if (loading) return <div className="loading"></div>;

    return (
        <div className="ticket-list">
            <div className="list-header">
                <h2>Список тикетов</h2>
                <div className="list-stats">
                    Найдено: <strong>{filteredAndSortedTickets.length}</strong> из <strong>{allTickets.length}</strong>
                </div>
            </div>

            <TicketFilters
                search={search}
                status={status}
                priority={priority}
                sortBy={sortBy}
                sortOrder={sortOrder}
                onSearchChange={handleSearchChange}
                onStatusChange={setStatus}
                onPriorityChange={setPriority}
                onSortByChange={handleSortByChange}
                onSortOrderChange={handleSortOrderChange}
                onReset={handleResetFilters}
            />

            {paginatedTickets.length === 0 ? (
                <div className="empty-state">
                    <p>
                        {search || status !== 'ALL' || priority !== 'ALL'
                            ? 'Тикеты не найдены. Попробуйте изменить параметры поиска.'
                            : 'Нет тикетов'}
                    </p>
                    {!(search || status !== 'ALL' || priority !== 'ALL') && (
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
                                        <Link to={`/ticket/${ticket.id}`}>{ticket.title}</Link>
                                    </h3>
                                    <span className={`priority ${getPriorityColor(ticket.priority)}`}>
                                        {getPriorityLabel(ticket.priority)}
                                    </span>
                                </div>
                                <p className="ticket-description">{ticket.description}</p>
                                <div className="ticket-meta">
                                    <span className={`status ${getStatusColor(ticket.status)}`}>
                                        {getStatusLabel(ticket.status)}
                                    </span>
                                    <span className="ticket-id">#{ticket.id.substring(0, 8)}</span>
                                </div>

                                <div className="ticket-users">
                                    {ticket.reporter && (
                                        <div className="ticket-user">
                                            <span className="user-label">Автор:</span>
                                                {ticket.reporter.firstName} {ticket.reporter.lastName}
                                        </div>
                                    )}
                                    {ticket.assignee && (
                                        <div className="ticket-user">
                                            <span className="user-label">Исполнитель:</span>
                                                {ticket.assignee.firstName} {ticket.assignee.lastName}
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
                                        {canEdit(ticket) && (
                                            <Link to={`/edit/${ticket.id}`} className="btn btn-sm">
                                                Редактировать
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