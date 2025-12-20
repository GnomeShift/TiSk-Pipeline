import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import {TicketDTO, TicketStatus} from '../types/ticket';
import { ticketService } from '../services/ticketService';
import {getPriorityStyle, getStatusStyle, getStatusLabel, getPriorityLabel, getRoleLabel} from '../services/utils';
import { useAuth } from '../contexts/AuthContext';
import { useNotification } from '../contexts/NotificationContext';
import { userService } from '../services/userService';
import { UserDTO, UserRole } from '../types/user';

const TicketDetail: React.FC = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { user } = useAuth();
    const [ticket, setTicket] = useState<TicketDTO | null>(null);
    const [users, setUsers] = useState<UserDTO[]>([]);
    const [loading, setLoading] = useState(true);
    const notification = useNotification();
    const [assigneeId, setAssigneeId] = useState<string>('');
    const [showAssignModal, setShowAssignModal] = useState(false);

    useEffect(() => {
        if (id) {
            loadTicket(id);
            if (user?.role === UserRole.ADMIN || user?.role === UserRole.SUPPORT) {
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
        catch (err: any) {
            notification.error('Ошибка загрузки тикета');
        }
        finally {
            setLoading(false);
        }
    };

    const loadUsers = async () => {
        try {
            const data = await userService.getAll();
            setUsers(data.filter(u => (u.role === UserRole.SUPPORT || u.role === UserRole.ADMIN) && u.status === 'ACTIVE'));
        } catch (err: any) {
            notification.error('Ошибка загрузки пользователей');
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
            notification.success(`Статус изменен на "${getStatusLabel(newStatus)}"`);
        } catch (err: any) {
            notification.error('Ошибка при обновлении статуса');
        }
    };

    const handleAssign = async (assigneeId: string) => {
        if (!ticket || !assigneeId) return;

        try {
            const updated = await ticketService.assignTicket(ticket.id, assigneeId);
            setTicket(updated);
            setAssigneeId(assigneeId);
            setShowAssignModal(false);

            const assignedUser = users.find(u => u.id === assigneeId);
            if (assignedUser) {
                notification.success('Тикет успешно назначен');
            }
        } catch (err: any) {
            notification.error('Ошибка при назначении тикета');
        }
    };

    const handleTakeTicket = async () => {
        if (!ticket || !user) return;

        try {
            const updated = await ticketService.assignTicket(ticket.id, user.id);
            setTicket(updated);
            setAssigneeId(user.id);
            notification.success('Тикет взят');
        } catch (err: any) {
            notification.error('Ошибка при взятии тикета');
        }
    };

    const handleDelete = async () => {
        if (!ticket) return;

        if (window.confirm('Удалить этот тикет?')) {
            try {
                await ticketService.delete(ticket.id);
                notification.success('Тикет успешно удален')
                navigate('/');
            }
            catch (err: any) {
                notification.error('Ошибка при удалении тикета');
            }
        }
    };

    const canEdit = () => {
        if (!ticket || !user) return false;
        return user.role === UserRole.ADMIN || user.role === UserRole.SUPPORT || ticket.reporter?.id === user.id;
    };

    const canChangeStatus = () => {
        if (!user) return false;
        return user.role === UserRole.ADMIN || user.role === UserRole.SUPPORT;
    };

    const canDelete = () => {
        return user?.role === UserRole.ADMIN;
    };

    const canAssign = () => {
        return user?.role === UserRole.ADMIN;
    };

    const canTakeTicket = () => {
        if (!ticket || !user) return false;
        return (user.role === UserRole.ADMIN || user.role === UserRole.SUPPORT) && !ticket.assignee
    };

    if (loading) return <div className="loading"></div>;
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
                                {canChangeStatus() ? (
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
                                    <span className={`status ${getStatusStyle(ticket.status)}`}>
                                        {getStatusLabel(ticket.status)}
                                    </span>
                                )}
                            </dd>

                            <dt>Приоритет:</dt>
                            <dd>
                                <span className={`priority ${getPriorityStyle(ticket.priority)}`}>
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

                            <dt>Исполнитель:</dt>
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

                        {(canTakeTicket() || canAssign()) && (
                            <div className="assign-actions">
                                {canTakeTicket() && (
                                    <button
                                        onClick={handleTakeTicket}
                                        className="btn btn-primary btn-block"
                                    >
                                        🎯 Взять
                                    </button>
                                )}

                                {canAssign() && (
                                    <button
                                        onClick={() => setShowAssignModal(true)}
                                        className="btn btn-primary btn-block"
                                        style={{ marginTop: '0.5rem' }}
                                    >
                                        👤 Назначить исполнителя
                                    </button>
                                )}
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {showAssignModal && (
                <div className="modal-overlay" onClick={() => setShowAssignModal(false)}>
                    <div className="modal-content assign-modal" onClick={(e) => e.stopPropagation()}>
                        <div className="modal-header">
                            <h3>Назначить исполнителя</h3>
                            <button
                                className="modal-close"
                                onClick={() => setShowAssignModal(false)}
                            >
                                ✕
                            </button>
                        </div>

                        <div className="assign-list">
                            {users.length === 0 ? (
                                <div className="empty-state">
                                    <p>Нет доступных исполнителей</p>
                                </div>
                            ) : (
                                users.map(u => (
                                    <div
                                        key={u.id}
                                        className={`assign-user-card ${assigneeId === u.id ? 'current' : ''}`}
                                        onClick={() => handleAssign(u.id)}
                                    >
                                        <div className="user-info">
                                            <div className="user-avatar">
                                                {u.firstName.charAt(0)}{u.lastName.charAt(0)}
                                            </div>
                                            <div className="user-details">
                                                <div className="user-name">
                                                    {u.firstName} {u.lastName}
                                                    {assigneeId === u.id && (
                                                        <span className="current-badge">Текущий</span>
                                                    )}
                                                </div>
                                                <div className="user-meta">
                                                    <span className="user-email">{u.email}</span>
                                                    <span className={`role-badge role-${u.role.toLowerCase()}`}>
                                                        {getRoleLabel(u.role)}
                                                    </span>
                                                </div>
                                                {u.department && (
                                                    <div className="user-department">
                                                        🏢 {u.department}
                                                        {u.position && ` • ${u.position}`}
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                        {assigneeId !== u.id && (
                                            <div className="assign-button">
                                                <span className="assign-icon">→</span>
                                            </div>
                                        )}
                                    </div>
                                ))
                            )}
                        </div>

                        <div className="modal-actions">
                            <button
                                onClick={() => setShowAssignModal(false)}
                                className="btn btn-secondary"
                            >
                                Отмена
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default TicketDetail;