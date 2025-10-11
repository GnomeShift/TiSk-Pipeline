import React, { useEffect, useState, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { Ticket } from '../types/ticket';
import { ticketService } from '../services/ticketService';
import { getPriorityColor, getStatusColor } from '../services/utils';
import TicketFilters from './TicketFilters';
import Pagination from './Pagination';
import { PaginationParams } from '../types/pagination';

const TicketList: React.FC = () => {
    const [tickets, setTickets] = useState<Ticket[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [totalItems, setTotalItems] = useState(0);
    const [itemsPerPage] = useState(9);

    const [search, setSearch] = useState('');
    const [status, setStatus] = useState('ALL');
    const [priority, setPriority] = useState('ALL');
    const [sortBy, setSortBy] = useState<'created_at' | 'updated_at' | 'priority'>('created_at');
    const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

    const [searchTimer, setSearchTimer] = useState<number | null>(null);

    const loadTickets = useCallback(async () => {
        try {
            setLoading(true);

            const params: PaginationParams = {
                page: currentPage,
                limit: itemsPerPage,
                search: search || undefined,
                status: status !== 'ALL' ? status : undefined,
                priority: priority !== 'ALL' ? priority : undefined,
                sortBy,
                sortOrder
            };

            const response = await ticketService.getAll(params);
            setTickets(response.data);
            setTotalPages(response.totalPages);
            setTotalItems(response.total);
        } catch (err) {
            setError('Ошибка загрузки тикетов');
            console.error(err);
        } finally {
            setLoading(false);
        }
    }, [currentPage, itemsPerPage, search, status, priority, sortBy, sortOrder]);

    useEffect(() => {
        loadTickets();
    }, [loadTickets]);

    const handleDelete = async (id: string) => {
        if (window.confirm('Удалить этот тикет?')) {
            try {
                await ticketService.delete(id);
                await loadTickets();
            } catch (err) {
                alert('Ошибка при удалении тикета');
            }
        }
    };

    const handleSearchChange = (value: string) => {
        if (searchTimer) {
            clearTimeout(searchTimer);
        }

        const timer = setTimeout(() => {
            setSearch(value);
            setCurrentPage(1);
        }, 500);

        setSearchTimer(timer);
        setSearch(value);
    };

    const handleStatusChange = (value: string) => {
        setStatus(value);
        setCurrentPage(1);
    };

    const handlePriorityChange = (value: string) => {
        setPriority(value);
        setCurrentPage(1);
    };

    const handleSortByChange = (value: string) => {
        setSortBy(value as 'created_at' | 'updated_at' | 'priority');
    };

    const handleSortOrderChange = (value: string) => {
        setSortOrder(value as 'asc' | 'desc');
    };

    const handleResetFilters = () => {
        setSearch('');
        setStatus('ALL');
        setPriority('ALL');
        setSortBy('created_at');
        setSortOrder('desc');
        setCurrentPage(1);
    };

    const handlePageChange = (page: number) => {
        setCurrentPage(page);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    return (
        <div className="ticket-list">
            <div className="list-header">
                <h2>Список тикетов</h2>
                <div className="list-stats">
                    Всего тикетов: <strong>{totalItems}</strong>
                </div>
            </div>

            <TicketFilters
                search={search}
                status={status}
                priority={priority}
                sortBy={sortBy}
                sortOrder={sortOrder}
                onSearchChange={handleSearchChange}
                onStatusChange={handleStatusChange}
                onPriorityChange={handlePriorityChange}
                onSortByChange={handleSortByChange}
                onSortOrderChange={handleSortOrderChange}
                onReset={handleResetFilters}
            />

            {loading ? (
                <div className="loading"/>
            ) : error ? (
                <div className="error">{error}</div>
            ) : tickets.length === 0 ? (
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
                        {tickets.map((ticket) => (
                            <div key={ticket.id} className="ticket-card">
                                <div className="ticket-header">
                                    <h3 className="ticket-title">
                                        <Link to={`/ticket/${ticket.id}`}>{ticket.title}</Link>
                                    </h3>
                                    <span className={`priority ${getPriorityColor(ticket.priority)}`}>
                                        {ticket.priority}
                                    </span>
                                </div>
                                <p className="ticket-description">{ticket.description}</p>
                                <div className="ticket-meta">
                                    <span className={`status ${getStatusColor(ticket.status)}`}>
                                        {ticket.status}
                                    </span>
                                    <span className="ticket-id">#{ticket.id}</span>
                                </div>
                                <div className="ticket-footer">
                                    <span className="ticket-date">
                                        {new Date(ticket.createdAt).toLocaleDateString()}
                                    </span>
                                    <div className="ticket-actions">
                                        <Link to={`/ticket/${ticket.id}`} className="btn btn-sm">
                                            Просмотр
                                        </Link>
                                        <Link to={`/edit/${ticket.id}`} className="btn btn-sm">
                                            Редактировать
                                        </Link>
                                        <button
                                            onClick={() => handleDelete(ticket.id)}
                                            className="btn btn-sm btn-danger"
                                        >
                                            Удалить
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>

                    <Pagination
                        currentPage={currentPage}
                        totalPages={totalPages}
                        onPageChange={handlePageChange}
                        totalItems={totalItems}
                        itemsPerPage={itemsPerPage}
                    />
                </>
            )}
        </div>
    );
};

export default TicketList;