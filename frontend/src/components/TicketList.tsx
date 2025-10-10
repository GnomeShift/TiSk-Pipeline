import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Ticket } from '../types/ticket';
import { ticketService } from '../services/ticketService';
import {getPriorityColor, getStatusColor} from "../services/utils.ts";

const TicketList: React.FC = () => {
    const [tickets, setTickets] = useState<Ticket[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        loadTickets();
    }, []);

    const loadTickets = async () => {
        try {
            setLoading(true);
            const data = await ticketService.getAll();
            setTickets(data);
        } catch (err) {
            setError('Ошибка загрузки тикетов');
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

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

    if (loading) return <div className="loading">Загрузка...</div>;
    if (error) return <div className="error">{error}</div>;

    return (
        <div className="ticket-list">
            <h2>Список тикетов</h2>
            {tickets.length === 0 ? (
                <div className="empty-state">
                    <p>Нет тикетов</p>
                    <Link to="/create" className="btn btn-primary">
                        Создать первый тикет
                    </Link>
                </div>
            ) : (
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
                    ))}
                </div>
            )}
        </div>
    );
};

export default TicketList;