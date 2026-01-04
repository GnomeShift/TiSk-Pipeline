import React, {useEffect, useState} from 'react';
import {useNavigate, useParams} from 'react-router-dom';
import {CreateTicketDTO, TicketPriority, TicketStatus, UpdateTicketDTO} from '../types/ticket';
import {ticketService} from '../services/ticketService';
import {useAuth} from "../contexts/AuthContext.tsx";
import {useNotification} from '../contexts/NotificationContext';
import {getPriorityLabel, getStatusLabel} from "../services/utils";
import {UserRole} from '../types/user.ts';
import FormInput from './FormInput';
import { useFormValidation } from '../hooks/useFormValidation';

const TicketForm: React.FC = () => {
    const navigate = useNavigate();
    const notification = useNotification();
    const { id } = useParams();
    const { user } = useAuth();
    const isEdit = !!id;
    const { forceValidate, registerFieldError, validateForm } = useFormValidation();

    const [formData, setFormData] = useState({
        title: '',
        description: '',
        status: TicketStatus.OPEN,
        priority: TicketPriority.LOW
    });

    const [loading, setLoading] = useState(false);
    const [initialLoading, setInitialLoading] = useState(isEdit);

    useEffect(() => {
        if (isEdit && id) {
            loadTicket(id);
        }
    }, [id, isEdit]);

    const loadTicket = async (ticketId: string) => {
        try {
            setInitialLoading(true);
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
            navigate('/');
        } finally {
            setInitialLoading(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        const { isValid } = await validateForm();
        if (!isValid) {
            return;
        }

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

    const canChangeStatus = () => {
        if (!user) return false;
        return user.role === UserRole.ADMIN || user.role === UserRole.SUPPORT;
    };

    if (initialLoading) return <div className="loading" />;

    return (
        <div className="ticket-form">
            <h2>{isEdit ? 'Редактировать тикет' : 'Создать новый тикет'}</h2>

            <form onSubmit={handleSubmit} noValidate>
                <FormInput
                    type="text"
                    id="title"
                    name="title"
                    label="Заголовок"
                    value={formData.title}
                    onChange={handleChange}
                    required
                    placeholder="Кратко опишите проблему"
                    disabled={loading}
                    minLength={1}
                    maxLength={255}
                    forceValidate={forceValidate}
                    onValidationChange={registerFieldError}
                />

                <FormInput
                    type="textarea"
                    id="description"
                    name="description"
                    label="Описание"
                    value={formData.description}
                    onChange={handleChange}
                    required
                    rows={5}
                    placeholder="Подробно опишите проблему, шаги для воспроизведения..."
                    disabled={loading}
                    minLength={1}
                    maxLength={5000}
                    forceValidate={forceValidate}
                    onValidationChange={registerFieldError}
                />

                <div className="form-row">
                    <div className="form-group">
                        <label htmlFor="priority">Приоритет</label>
                        <select
                            id="priority"
                            name="priority"
                            value={formData.priority}
                            onChange={handleChange}
                            className="form-control"
                            disabled={loading}
                        >
                            <option value={TicketPriority.LOW}>{getPriorityLabel(TicketPriority.LOW)}</option>
                            <option value={TicketPriority.MEDIUM}>{getPriorityLabel(TicketPriority.MEDIUM)}</option>
                            <option value={TicketPriority.HIGH}>{getPriorityLabel(TicketPriority.HIGH)}</option>
                            <option value={TicketPriority.VERY_HIGH}>{getPriorityLabel(TicketPriority.VERY_HIGH)}</option>
                        </select>
                    </div>

                    {isEdit && canChangeStatus() && (
                        <div className="form-group">
                            <label htmlFor="status">Статус</label>
                            <select
                                id="status"
                                name="status"
                                value={formData.status}
                                onChange={handleChange}
                                className="form-control"
                                disabled={loading}
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
                        disabled={loading}
                    >
                        Отмена
                    </button>
                </div>
            </form>
        </div>
    );
};

export default TicketForm;