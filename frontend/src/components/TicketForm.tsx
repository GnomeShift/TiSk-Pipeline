import React, {useEffect, useState} from 'react';
import {useNavigate, useParams} from 'react-router-dom';
import {CreateTicketDTO, TicketPriority, TicketStatus, UpdateTicketDTO} from '../types/ticket';
import {ticketService} from '../services/ticketService';
import {useAuth} from "../contexts/AuthContext.tsx";
import {useNotification} from '../contexts/NotificationContext';
import {getPriorityLabel, getStatusLabel} from "../services/utils";

const TicketForm: React.FC = () => {
    const navigate = useNavigate();
    const notification = useNotification();
    const { id } = useParams();
    const { user } = useAuth()
    const isEdit = !!id;

    const [formData, setFormData] = useState({
        title: '',
        description: '',
        status: TicketStatus.OPEN || TicketStatus.IN_PROGRESS || TicketStatus.CLOSED,
        priority: TicketPriority.LOW || TicketPriority.MEDIUM || TicketPriority.HIGH || TicketPriority.VERY_HIGH
    });

    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (isEdit && id) {
            loadTicket(id);
        }
    }, [id, isEdit]);

    const loadTicket = async (ticketId: string) => {
        try {
            setLoading(true);
            const ticket = await ticketService.getById(ticketId);
            setFormData({
                title: ticket.title,
                description: ticket.description,
                status: ticket.status,
                priority: ticket.priority
            });
        }
        catch (err: any) {
            notification.error('Ошибка загрузки тикета');
        }
        finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        try {
            setLoading(true);
            if (isEdit && id) {
                const updateData: UpdateTicketDTO = {
                    title: formData.title,
                    description: formData.description,
                    status: formData.status,
                    priority: formData.priority
                };
                await ticketService.update(id, updateData);
                notification.success('Тикет успешно обновлен');
            }
            else {
                const createData: CreateTicketDTO = {
                    title: formData.title,
                    description: formData.description,
                    priority: formData.priority,
                    reporterId: user!.id
                };
                await ticketService.create(createData);
                notification.success('Тикет успешно создан');
            }
            navigate('/');
        }
        catch (err: any) {
            notification.error('Ошибка при сохранении тикета');
        }
        finally {
            setLoading(false);
        }
    };

    const handleChange = (
        e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
    ) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value,
        });
    };

    if (loading && isEdit) return <div className="loading"/>;

    return (
        <div className="ticket-form">
            <h2>{isEdit ? 'Редактировать тикет' : 'Создать новый тикет'}</h2>

            <form onSubmit={handleSubmit}>
                <div className="form-group">
                    <label htmlFor="title">Заголовок *</label>
                    <input
                        type="text"
                        id="title"
                        name="title"
                        value={formData.title}
                        onChange={handleChange}
                        required
                        className="form-control"
                        minLength={1}
                        maxLength={255}
                    />
                    <small className="form-hint">
                        Минимум 1, максимум 255 символов
                    </small>
                </div>

                <div className="form-group">
                    <label htmlFor="description">Описание *</label>
                    <textarea
                        id="description"
                        name="description"
                        value={formData.description}
                        onChange={handleChange}
                        required
                        rows={5}
                        className="form-control"
                        minLength={1}
                        maxLength={5000}
                    />
                    <small className="form-hint">
                        Минимум 1, максимум 5000 символов
                    </small>
                </div>

                <div className="form-row">
                    <div className="form-group">
                        <label htmlFor="priority">Приоритет</label>
                        <select
                            id="priority"
                            name="priority"
                            value={formData.priority}
                            onChange={handleChange}
                            className="form-control"
                        >
                            <option value={TicketPriority.LOW}>{getPriorityLabel(TicketPriority.LOW)}</option>
                            <option value={TicketPriority.MEDIUM}>{getPriorityLabel(TicketPriority.MEDIUM)}</option>
                            <option value={TicketPriority.HIGH}>{getPriorityLabel(TicketPriority.HIGH)}</option>
                            <option value={TicketPriority.VERY_HIGH}>{getPriorityLabel(TicketPriority.VERY_HIGH)}</option>
                        </select>
                    </div>

                    {isEdit && (
                        <div className="form-group">
                            <label htmlFor="status">Статус</label>
                            <select
                                id="status"
                                name="status"
                                value={formData.status}
                                onChange={handleChange}
                                className="form-control"
                            >
                                <option value={TicketStatus.OPEN}>{getStatusLabel(TicketStatus.OPEN)}</option>
                                <option value={TicketStatus.IN_PROGRESS}>{getStatusLabel(TicketStatus.IN_PROGRESS)}</option>
                                <option value={TicketStatus.CLOSED}>{getStatusLabel(TicketStatus.CLOSED)}</option>
                            </select>
                        </div>
                    )}
                </div>

                {!isEdit && user && (
                    <div className="form-info">
                        <p>Тикет будет создан от имени: <strong>{user.firstName} {user.lastName}</strong></p>
                    </div>
                )}

                <div className="form-actions">
                    <button type="submit" className="btn btn-primary" disabled={loading}>
                        {loading ? 'Сохранение...' : isEdit ? 'Обновить' : 'Создать'}
                    </button>
                    <button
                        type="button"
                        onClick={() => navigate('/')}
                        className="btn btn-secondary"
                    >
                        Отмена
                    </button>
                </div>
            </form>
        </div>
    );
};

export default TicketForm;