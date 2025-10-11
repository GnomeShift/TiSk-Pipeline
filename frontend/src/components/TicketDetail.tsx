import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import {Ticket} from '../types/ticket';
import { ticketService } from '../services/ticketService';
import {getPriorityColor, getStatusColor} from "../services/utils.ts";

const TicketDetail: React.FC = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [ticket, setTicket] = useState<Ticket | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (id) {
            loadTicket(id);
        }
    }, [id]);

    const loadTicket = async (ticketId: string) => {
        try {
            setLoading(true);
            const data = await ticketService.getById(ticketId);
            setTicket(data);
            console.log(data)
        }
        catch (err) {
            setError('Ошибка загрузки тикета');
        }
        finally {
            setLoading(false);
        }
    };

    const handleDelete = async () => {
        if (!ticket) return;

        if (window.confirm('Удалить этот тикет?')) {
            try {
                await ticketService.delete(ticket.id);
                navigate('/');
            }
            catch (err) {
                alert('Ошибка при удалении тикета');
            }
        }
    };

    if (loading) return <div className="loading"/>;
    if (error) return <div className="error">{error}</div>;
    if (!ticket) return <div className="error">Тикет не найден</div>;

    return (
        <div className="ticket-detail">
            <div className="detail-header">
                <h2>Тикет #{ticket.id}</h2>
                <div className="detail-actions">
                    <Link to={`/edit/${ticket.id}`} className="btn btn-primary">
                        Редактировать
                    </Link>
                    <button onClick={handleDelete} className="btn btn-danger">
                        Удалить
                    </button>
                </div>
            </div>

            <div className="detail-content">
                <div className="detail-main">
                    <h3>{ticket.title}</h3>
                    <div className="detail-description">
                        <h4>Описание:</h4>
                        <p>{ticket.description}</p>
                    </div>
                </div>

                <div className="detail-sidebar">
                    <div className="detail-info">
                        <h4>Информация</h4>
                        <dl>
                            <dt>Статус:</dt>
                            <dd className={`status ${getStatusColor(ticket.status)}`}>
                                {ticket.status}
                            </dd>

                            <dt>Приоритет:</dt>
                            <dd className={`priority ${getPriorityColor(ticket.priority)}`}>
                                {ticket.priority}
                            </dd>

                            <dt>Создан:</dt>
                            <dd>{new Date(ticket.createdAt).toLocaleString()}</dd>

                            <dt>Обновлен:</dt>
                            <dd>{new Date(ticket.updatedAt).toLocaleString()}</dd>
                        </dl>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default TicketDetail;