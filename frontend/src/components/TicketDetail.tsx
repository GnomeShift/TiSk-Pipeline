import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import {Ticket, TicketStatus} from '../types/ticket';
import { ticketService } from '../services/ticketService';

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

    const handleStatusChange = async (newStatus: TicketStatus) => {
        if (!ticket) return;

        try {
            await ticketService.update(ticket.id, { status: newStatus });
            await loadTicket(ticket.id);
        }
        catch (err) {
            alert('Ошибка при обновлении статуса');
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

    if (loading) return <div className="loading">Загрузка...</div>;
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
                            <dd>
                                <select
                                    value={ticket.status}
                                    onChange={(e) => handleStatusChange(e.target.value as any)}
                                    className="status-select"
                                >
                                    <option value={TicketStatus.OPEN}>Открыт</option>
                                    <option value={TicketStatus.IN_PROGRESS}>В работе</option>
                                    <option value={TicketStatus.CLOSED}>Закрыт</option>
                                </select>
                            </dd>

                            <dt>Создан:</dt>
                            <dd>{new Date(ticket.created_at).toLocaleString()}</dd>

                            <dt>Обновлен:</dt>
                            <dd>{new Date(ticket.updated_at).toLocaleString()}</dd>
                        </dl>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default TicketDetail;