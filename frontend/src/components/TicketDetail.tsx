import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import {TicketDTO, TicketStatus} from '../types/ticket';
import { ticketService } from '../services/ticketService';
import {getPriorityColor, getStatusColor, getStatusLabel, getPriorityLabel, getRoleLabel} from '../services/utils';
import { useAuth } from '../contexts/AuthContext';
import { userService } from '../services/userService';
import { UserDTO } from '../types/user';

const TicketDetail: React.FC = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { user } = useAuth();
    const [ticket, setTicket] = useState<TicketDTO | null>(null);
    const [users, setUsers] = useState<UserDTO[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [assigneeId, setAssigneeId] = useState<string>('');

    useEffect(() => {
        if (id) {
            loadTicket(id);
            if (user?.role === 'ADMIN' || user?.role === 'SUPPORT') {
                loadUsers();
            }
        }
    }, [id, user]);

    const loadTicket = async (ticketId: string) => {
        try {
            setLoading(true);
            const data = await ticketService.getById(ticketId);
            setTicket(data);
            setAssigneeId(data.assignee?.id || '');
        }
        catch (err) {
            setError('Ошибка загрузки тикета');
        }
        finally {
            setLoading(false);
        }
    };

    const loadUsers = async () => {
        try {
            const data = await userService.getAll();
            setUsers(data.filter(u => u.role === 'SUPPORT' || u.role === 'ADMIN'));
        } catch (err) {
            console.error('Ошибка загрузки пользователей:', err);
        }
    };

    const handleStatusChange = async (newStatus: TicketStatus) => {
        if (!ticket) return;

        try {
            const updateData = {
                title: ticket.title,
                description: ticket.description,
                status: newStatus,
                priority: ticket.priority,
                reporterId: ticket.reporter?.id
            };
            const updated = await ticketService.update(ticket.id, updateData);
            setTicket(updated);
        } catch (err) {
            alert('Ошибка при обновлении статуса');
        }
    };

    const handleAssign = async () => {
        if (!ticket || !assigneeId) return;

        try {
            const updated = await ticketService.assignTicket(ticket.id, assigneeId);
            setTicket(updated);
            alert('Тикет успешно назначен');
        } catch (err) {
            alert('Ошибка при назначении тикета');
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

    const canEdit = () => {
        if (!ticket || !user) return false;
        return user.role === 'ADMIN' || user.role === 'SUPPORT' || ticket.reporter?.id === user.id;
    };

    const canDelete = () => {
        return user?.role === 'ADMIN';
    };

    const canAssign = () => {
        return user?.role === 'ADMIN' || user?.role === 'SUPPORT';
    };

    if (loading) return <div className="loading"></div>;
    if (error) return <div className="error">{error}</div>;
    if (!ticket) return <div className="error">Тикет не найден</div>;

    return (
        <div className="ticket-detail">
            <div className="detail-header">
                <h2>Тикет #{ticket.id.substring(0, 8)}</h2>
                <div className="detail-actions">
                    {canEdit() && (
                        <Link to={`/edit/${ticket.id}`} className="btn btn-primary">
                            Редактировать
                        </Link>
                    )}
                    {canDelete() && (
                        <button onClick={handleDelete} className="btn btn-danger">
                            Удалить
                        </button>
                    )}
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
                                {canEdit() ? (
                                    <select
                                        value={ticket.status}
                                        onChange={(e) => handleStatusChange(e.target.value as TicketStatus)}
                                        className="status-select"
                                    >
                                        <option value={TicketStatus.OPEN}>{getStatusLabel(TicketStatus.OPEN)}</option>
                                        <option value={TicketStatus.IN_PROGRESS}>{getStatusLabel(TicketStatus.IN_PROGRESS)}</option>
                                        <option value={TicketStatus.CLOSED}>{getStatusLabel(TicketStatus.CLOSED)}</option>
                                    </select>
                                ) : (
                                    <span className={`status ${getStatusColor(ticket.status)}`}>
                                        {getStatusLabel(ticket.status)}
                                    </span>
                                )}
                            </dd>

                            <dt>Приоритет:</dt>
                            <dd>
                                <span
                                    className={`priority ${getPriorityColor(ticket.priority)}`}>
                                    {getPriorityLabel(ticket.priority)}
                                </span>
                            </dd>

                            <dt>Автор:</dt>
                            <dd>
                                {ticket.reporter ? (
                                    <>
                                        {ticket.reporter.firstName} {ticket.reporter.lastName}
                                        <br />
                                        <small>{ticket.reporter.email}</small>
                                    </>
                                ) : (
                                    '—'
                                )}
                            </dd>

                            <dt>Назначен:</dt>
                            <dd>
                                {ticket.assignee ? (
                                    <>
                                        {ticket.assignee.firstName} {ticket.assignee.lastName}
                                        <br />
                                        <small>{ticket.assignee.email}</small>
                                    </>
                                ) : (
                                    '—'
                                )}
                            </dd>

                            <dt>Создан:</dt>
                            <dd>{new Date(ticket.createdAt).toLocaleString()}</dd>

                            <dt>Обновлен:</dt>
                            <dd>{new Date(ticket.updatedAt).toLocaleString()}</dd>
                        </dl>

                        {canAssign() && (
                            <div className="assign-section">
                                <h4>Назначить тикет</h4>
                                <div className="assign-form">
                                    <select
                                        value={assigneeId}
                                        onChange={(e) => setAssigneeId(e.target.value)}
                                        className="form-control"
                                    >
                                        <option value="">Выберите исполнителя</option>
                                        {users.map(u => (
                                            <option key={u.id} value={u.id}>
                                                {u.firstName} {u.lastName} ({getRoleLabel(u.role)})
                                            </option>
                                        ))}
                                    </select>
                                    <button
                                        onClick={handleAssign}
                                        className="btn btn-primary"
                                        disabled={!assigneeId}
                                    >
                                        Назначить
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default TicketDetail;