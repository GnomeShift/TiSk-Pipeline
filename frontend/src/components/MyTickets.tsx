import React, { useEffect, useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { TicketDTO } from '../types/ticket';
import { ticketService } from '../services/ticketService';
import { getPriorityColor, getPriorityLabel, getStatusColor, getStatusLabel } from "../services/utils";
import Pagination from './Pagination';
import { useAuth } from '../contexts/AuthContext';
import { useNotification } from '../contexts/NotificationContext';

const MyTickets: React.FC = () => {
    const { user } = useAuth();
    const notification = useNotification();
    const [tickets, setTickets] = useState<TicketDTO[]>([]);
    const [loading, setLoading] = useState(true);
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage] = useState(6);
    const [filterType, setFilterType] = useState<'all' | 'reported' | 'assigned'>('all');

    useEffect(() => {
        loadMyTickets();
    }, []);

    const loadMyTickets = async () => {
        try {
            setLoading(true);
            const data = await ticketService.getMyTickets();
            setTickets(data);
        } catch (err: any) {
            notification.error('Ошибка загрузки тикетов');
        } finally {
            setLoading(false);
        }
    };

    const filteredTickets = useMemo(() => {
        if (!user) return tickets;

        switch (filterType) {
            case 'reported':
                return tickets.filter(t => t.reporter?.id === user.id);
            case 'assigned':
                return tickets.filter(t => t.assignee?.id === user.id);
            default:
                return tickets;
        }
    }, [tickets, filterType, user]);

    const paginatedTickets = useMemo(() => {
        const start = (currentPage - 1) * itemsPerPage;
        const end = start + itemsPerPage;
        return filteredTickets.slice(start, end);
    }, [currentPage, filteredTickets, itemsPerPage]);

    const totalPages = Math.ceil(filteredTickets.length / itemsPerPage);

    useEffect(() => {
        setCurrentPage(1);
    }, [filterType]);

    if (loading) return <div className="loading"></div>;

    return (
        <div className="my-tickets">
            <h2>Мои тикеты</h2>

            <div className="filter-tabs">
                <button
                    className={`tab ${filterType === 'all' ? 'active' : ''}`}
                    onClick={() => setFilterType('all')}
                >
                    Все ({tickets.length})
                </button>
                <button
                    className={`tab ${filterType === 'reported' ? 'active' : ''}`}
                    onClick={() => setFilterType('reported')}
                >
                    Мои ({tickets.filter(t => t.reporter?.id === user?.id).length})
                </button>
                <button
                    className={`tab ${filterType === 'assigned' ? 'active' : ''}`}
                    onClick={() => setFilterType('assigned')}
                >
                    Назначенные ({tickets.filter(t => t.assignee?.id === user?.id).length})
                </button>
            </div>

            {paginatedTickets.length === 0 ? (
                <div className="empty-state">
                    <p>У вас пока нет тикетов</p>
                    <Link to="/create" className="btn btn-primary">
                        Создать тикет
                    </Link>
                </div>
            ) : (
                <>
                    <div className="tickets-list">
                        {paginatedTickets.map((ticket) => (
                            <div key={ticket.id} className="ticket-item">
                                <div className="ticket-item-header">
                                    <Link to={`/ticket/${ticket.id}`} className="ticket-item-title">
                                        {ticket.title}
                                    </Link>
                                    <div className="ticket-item-badges">
                                        <span className={`status ${getStatusColor(ticket.status)}`}>
                                            {getStatusLabel(ticket.status)}
                                        </span>
                                        <span className={`priority ${getPriorityColor(ticket.priority)}`}>
                                            {getPriorityLabel(ticket.priority)}
                                        </span>
                                    </div>
                                </div>
                                <p className="ticket-item-description">{ticket.description}</p>
                                <div className="ticket-item-footer">
                                    <span className="ticket-item-id">#{ticket.id.substring(0, 8)}</span>
                                    <span className="ticket-item-date">
                                        {new Date(ticket.createdAt).toLocaleDateString()}
                                    </span>
                                </div>
                            </div>
                        ))}
                    </div>

                    {totalPages > 1 && (
                        <Pagination
                            currentPage={currentPage}
                            totalPages={totalPages}
                            onPageChange={setCurrentPage}
                            totalItems={filteredTickets.length}
                            itemsPerPage={itemsPerPage}
                        />
                    )}
                </>
            )}
        </div>
    );
};

export default MyTickets;